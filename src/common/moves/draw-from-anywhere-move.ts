import {TheGame} from "../entities/game";

export const drawFromAnywhere = (game: TheGame, depthIndex: number) => {
  const drawPile = game.piles.drawPile;

  if (drawPile.size === 0) {
    game.turnManager.endStage();
    game.players.actingPlayer.eliminate();
    return;
  }

  if (!Number.isInteger(depthIndex) || depthIndex < 0 || depthIndex >= drawPile.size) {
    throw new Error(`Vị trí rút bài không hợp lệ: ${depthIndex}`);
  }

  const cards = drawPile.allCards;
  const card = cards[depthIndex];
  if (!card) {
    throw new Error(`Không tìm thấy lá bài tại vị trí: ${depthIndex}`);
  }

  // Kết thúc stage rút bài tùy ý
  game.turnManager.endStage();

  // Xử lý thẻ bài được rút (kích hoạt nổ hoặc an toàn kết thúc lượt)
  game.players.actingPlayer.handleDrawnCard(card);

  // Cập nhật trạng thái hiển thị lá bài trên đỉnh bộ bài
  if (drawPile.rawCards[0]?.isFaceUp) {
    game.gameState.topDrawCard = { ...drawPile.rawCards[0] };
  } else {
    game.gameState.topDrawCard = null;
  }
};
