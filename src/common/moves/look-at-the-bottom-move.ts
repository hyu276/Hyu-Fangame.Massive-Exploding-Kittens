import {TheGame} from "../entities/game";
import {NAME_RAISING_HECK} from "../constants/cards";

function finishBottomChoice(game: TheGame) {
  const endsTurn = game.gameState.lastActionCardName === NAME_RAISING_HECK;
  game.turnManager.endStage();
  if (endsTurn) game.turnManager.endTurn();
}

export const keepAtBottom = (game: TheGame) => {
  game.gameState.bottomCard = null;
  finishBottomChoice(game);
};

export const moveBottomToTop = (game: TheGame) => {
  const drawPile = game.piles.drawPile;
  if (drawPile.size > 1) {
    const bottom = drawPile.removeCardAt(drawPile.size - 1);
    if (bottom) {
      drawPile.insertCard(bottom, 0);
    }
  }

  // Cập nhật topDrawCard nếu lá chuyển lên đỉnh đang ngửa mặt
  if (drawPile.rawCards[0]?.isFaceUp) {
    game.gameState.topDrawCard = { ...drawPile.rawCards[0] };
  } else {
    game.gameState.topDrawCard = null;
  }

  game.gameState.bottomCard = null;
  finishBottomChoice(game);
};
