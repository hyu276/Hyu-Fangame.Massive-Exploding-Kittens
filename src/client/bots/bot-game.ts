import { ExplodingKittens } from '../../common';
import type { TheGame } from '../../common/entities/game';
import { setupGame } from '../../common/setup/game-setup';
import { closeFutureView } from '../../common/moves/see-future-move';
import { reorderFuture } from '../../common/moves/alter-future-move';
import { inGame } from '../../common/moves/in-game';
import * as S from '../../common/constants/stages';
import type { BotMatchOptions } from '../../common/bots/difficulty';
import type { ICard } from '../../common/models';

/** The intelligence callback lives in this session; it is never serialized into G or logs. */
export function createBotGame(options: BotMatchOptions, rememberHumanFuture: (cards: ICard[]) => void): typeof ExplodingKittens {
  const game: typeof ExplodingKittens = {
    ...ExplodingKittens,
    setup: context => setupGame(context, {
      selectedDecks: options.selectedDecks,
      gameMode: options.gameMode,
      maxPlayers: options.botCount + 1,
    }),
  };
  if (options.difficulty !== 'asia') return game;

  const futureMove = <Args extends unknown[]>(move: (game: TheGame, ...args: Args) => void) => ({
    client: false,
    redact: true,
    move: inGame((game: TheGame, ...args: Args) => {
      const stage = game.context.ctx.activePlayers?.[game.players.actingPlayerId];
      const count = stage === S.VIEWING_FUTURE_1X ? 1 :
        [S.VIEWING_FUTURE_5X, S.ALTERING_FUTURE_5X].includes(stage ?? '') ? 5 :
          [S.VIEWING_FUTURE, S.ALTERING_FUTURE].includes(stage ?? '') ? 3 : 0;
      move(game, ...args);
      if (game.players.actingPlayerId === '0' && count) {
        rememberHumanFuture(game.piles.drawPile.rawCards.slice(0, count).map(card => ({ ...card })));
      }
    }),
  });
  const play = ExplodingKittens.phases!.play;
  const stages = { ...play.turn!.stages };
  for (const stage of [S.VIEWING_FUTURE, S.VIEWING_FUTURE_1X, S.VIEWING_FUTURE_5X]) {
    stages[stage] = { ...stages[stage], moves: { ...stages[stage].moves, closeFutureView: futureMove(closeFutureView) } };
  }
  for (const stage of [S.ALTERING_FUTURE, S.ALTERING_FUTURE_5X]) {
    stages[stage] = { ...stages[stage], moves: { ...stages[stage].moves, reorderFuture: futureMove(reorderFuture) } };
  }
  game.phases = {
    ...game.phases,
    play: {
      ...play,
      moves: { ...play.moves, closeFutureView: futureMove(closeFutureView) },
      turn: { ...play.turn, stages },
    },
  };
  return game;
}
