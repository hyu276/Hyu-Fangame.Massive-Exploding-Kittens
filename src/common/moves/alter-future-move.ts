import {TheGame} from "../entities/game";
import {ALTERING_FUTURE_5X, VIEWING_FUTURE} from "../constants/stages";
import {findNextAlivePlayer} from "../utils/turn-order";

/**
 * Sắp xếp lại thứ tự của các lá bài trên đỉnh bộ bài (tối đa 3 lá hoặc 5 lá với Alter 5x)
 * newOrder: mảng các chỉ số vị trí ban đầu được sắp xếp lại, ví dụ [2, 0, 1]
 */
export const reorderFuture = (game: TheGame, newOrder: number[]) => {
  const drawPile = game.piles.drawPile;
  const cards = drawPile.rawCards;
  const actingPlayerId = game.players.actingPlayer?.id;
  const is5x = actingPlayerId ? game.turnManager.isInStage(actingPlayerId, ALTERING_FUTURE_5X) : false;
  const maxCount = (is5x ? 5 : 3) * (game.gameState.comboMultiplier || 1);
  const count = Math.min(maxCount, cards.length);

  if (count >= 2 && Array.isArray(newOrder) && newOrder.length === count) {
    const sorted = [...newOrder].sort((a, b) => a - b);
    const isValidPermutation = sorted.every((val, idx) => val === idx);
    if (isValidPermutation) {
      const topCards = cards.slice(0, count);
      const reordered = newOrder.map(idx => topCards[idx]).filter(Boolean);
      if (reordered.length === count) {
        cards.splice(0, count, ...reordered);
      }
    }
  }

  if (game.gameState.isSharingFuture) {
    game.gameState.isSharingFuture = false;
    const { ctx } = game.context;
    const step = game.gameState?.isReversed ? -1 : 1;
    const nextPlayerIndex = findNextAlivePlayer(game, ctx.playOrderPos + step);
    if (nextPlayerIndex !== undefined) {
      const nextPlayerId = game.turnManager.playOrder[nextPlayerIndex];
      game.turnManager.setActivePlayers({ value: { [nextPlayerId]: VIEWING_FUTURE } });
      return;
    }
  }

  game.gameState.comboMultiplier = 1;
  game.turnManager.endStage();
};
