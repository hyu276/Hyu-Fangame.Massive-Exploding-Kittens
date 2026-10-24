import {TheGame} from "../entities/game";
import * as S from '../constants/stages';
import { IDLE_STAGE } from '../entities/turn-manager';

/**
 * Người chơi chủ động đầu hàng / rời khỏi trận đấu đang diễn ra.
 * Người chơi sẽ bị loại (eliminate) và lượt được chuyển giao bình thường.
 */
export const forfeit = (game: TheGame) => {
  const player = game.players.actingPlayer;
  if (player && !player.hasLeft) {
    const stage = game.turnManager.activePlayers?.[player.id];
    player.leave();
    const groups = [
      ['garbageCollectionPending', S.CHOOSE_CARD_FOR_GARBAGE],
      ['potluckPending', S.CHOOSE_CARD_FOR_POTLUCK],
      ['feedTheDeadPending', S.GIVE_CARD_TO_FEED_DEAD],
      ['graveRobberPending', S.CHOOSE_CARD_FOR_GRAVE_ROBBER],
    ] as const;
    for (const [key] of groups) {
      if (game.gameState[key]) game.gameState[key] = game.gameState[key]!.filter(id => id !== player.id);
    }
    if (player.isCurrentPlayer) {
      game.piles.pendingCard = null;
      game.gameState.handShuffleDefense = null;
      game.gameState.pendingCardSteal = null;
      game.gameState.buryingCard = null;
      game.gameState.digDeeperCard = null;
      game.gameState.bottomCard = null;
      game.gameState.defusingVictimId = null;
      game.gameState.isSharingFuture = false;
      game.gameState.isResurrectingFromDefuse = false;
      for (const [key] of groups) game.gameState[key] = [];
      game.turnManager.endStage();
      game.turnManager.endTurn();
      return;
    }
    if (game.gameState.pendingCardSteal?.targetPlayerId === player.id ||
        game.gameState.pendingCardSteal?.attackerId === player.id) {
      game.gameState.pendingCardSteal = null;
      game.turnManager.endStage();
    } else if (game.gameState.handShuffleDefense?.targetPlayerId === player.id) {
      game.gameState.handShuffleDefense = null;
      game.turnManager.endStage();
    } else if (stage && stage !== IDLE_STAGE && stage !== S.RESPOND_WITH_NOW_CARD) {
      const group = groups.find(([, groupStage]) => groupStage === stage);
      const pending = group ? game.gameState[group[0]] ?? [] : [];
      if (pending.length) {
        const next = stage === S.CHOOSE_CARD_FOR_GARBAGE ? pending : pending.slice(0, 1);
        game.turnManager.setActivePlayers({ value: Object.fromEntries(next.map(id => [id, stage])) });
      } else {
        if (stage === S.CHOOSE_CARD_FOR_GARBAGE || stage === S.CHOOSE_CARD_FOR_GRAVE_ROBBER) game.piles.drawPile.shuffle();
        game.turnManager.endStage();
      }
    }
  }
};
