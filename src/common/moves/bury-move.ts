import {TheGame} from "../entities/game";

export const buryCard = (game: TheGame, insertIndex: number) => {
  const drawPile = game.piles.drawPile;

  if (!Number.isInteger(insertIndex) || insertIndex < 0 || insertIndex > drawPile.size) {
    throw new Error('Vị trí chôn bài không hợp lệ');
  }

  const rawCard = game.gameState.buryingCard;
  if (rawCard) {
    const removed = drawPile.removeCardById(rawCard.id);
    if (removed) {
      const adjustedIndex = Math.min(insertIndex, drawPile.size);
      drawPile.insertCard(removed.data, adjustedIndex);
    }
    game.gameState.buryingCard = null;
  }

  game.turnManager.endStage();
  game.turnManager.endTurn();
};
