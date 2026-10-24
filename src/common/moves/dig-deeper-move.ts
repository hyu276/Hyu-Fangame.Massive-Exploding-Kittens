import {TheGame} from "../entities/game";

export const takeTopCard = (game: TheGame) => {
  const actingPlayer = game.players.actingPlayer;
  if (!actingPlayer) return;

  const cards = game.piles.drawPile.allCards;
  if (cards.length === 0) {
    game.turnManager.endStage();
    actingPlayer.eliminate();
    return;
  }

  game.gameState.digDeeperCard = null;
  game.turnManager.endStage();

  const card = cards[0];
  actingPlayer.handleDrawnCard(card);
};

export const takeSecondCard = (game: TheGame) => {
  const actingPlayer = game.players.actingPlayer;
  if (!actingPlayer) return;

  const cards = game.piles.drawPile.allCards;
  if (cards.length === 0) {
    game.turnManager.endStage();
    actingPlayer.eliminate();
    return;
  }

  // Lấy lá thứ 2 (hoặc lá đầu tiên nếu chỉ còn 1 lá)
  const indexToDraw = cards.length > 1 ? 1 : 0;
  const card = cards[indexToDraw];

  game.gameState.digDeeperCard = null;
  game.turnManager.endStage();

  actingPlayer.handleDrawnCard(card);
};
