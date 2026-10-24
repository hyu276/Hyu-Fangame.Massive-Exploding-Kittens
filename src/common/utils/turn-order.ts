import {IContext} from '../models';
import {TheGame} from "../entities/game";

export const findNextAlivePlayer = (game: TheGame, startPos: number): number | undefined => {
  const numPlayers = game.players.playerCount;
  if (numPlayers === 0) return undefined;

  const isReversed = game.gameState?.isReversed ?? false;
  const step = isReversed ? -1 : 1;
  let currentPos = ((startPos % numPlayers) + numPlayers) % numPlayers;

  // Check all players once to avoid infinite loops
  for (let i = 0; i < numPlayers; i++) {
    const playerId = game.turnManager.playOrder[currentPos];

    if (game.players.getPlayer(playerId).isAlive) {
      return currentPos;
    }

    currentPos = (((currentPos + step) % numPlayers) + numPlayers) % numPlayers;
  }

  // No alive players found
  return undefined;
};

export const turnOrder = {
  first: (context: IContext): number => {
    const game = new TheGame(context);

    const nextAlive = findNextAlivePlayer(game, 0);
    // Fallback to first player if no one is alive (shouldn't happen)
    return nextAlive ?? 0;
  },

  /**
   * Get the next alive player, considering turnsRemaining counter and isReversed direction
   */
  next: (context: IContext): number | undefined => {
    const game = new TheGame(context);

    const playOrderPos = game.turnManager.playOrderPos;
    const currentTurnPlayer = game.players.currentPlayer;

    // Only stay with the current player if they are still alive!
    if (currentTurnPlayer && currentTurnPlayer.isAlive && game.turnManager.turnsRemaining > 0) {
      return playOrderPos;
    }

    // This callback receives frozen state. Elimination resets extra turns in Player.eliminate().

    const isReversed = game.gameState?.isReversed ?? false;
    const step = isReversed ? -1 : 1;
    return findNextAlivePlayer(game, playOrderPos + step);
  },

  /**
   * Shuffle the play order at the start of the play phase
   */
  playOrder: ({ ctx, random }: IContext): string[] => {
    const ids = Array.from({ length: ctx.numPlayers }, (_, i) => String(i));
    return random.Shuffle(ids);
  },
};
