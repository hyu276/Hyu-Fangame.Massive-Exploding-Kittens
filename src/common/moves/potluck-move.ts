import {TheGame} from "../entities/game";
import {CHOOSE_CARD_FOR_POTLUCK} from "../constants/stages";

export const givePotluckCard = (game: TheGame, cardIndex: number) => {
  const { ctx } = game.context;

  // Tìm người đang ở stage CHOOSE_CARD_FOR_POTLUCK
  const givingPlayerId = Object.keys(ctx.activePlayers || {}).find(
    pId => ctx.activePlayers?.[pId] === CHOOSE_CARD_FOR_POTLUCK
  );

  if (!givingPlayerId) {
    throw Error('Không tìm thấy người chơi trong giai đoạn nộp bài Potluck');
  }

  const givingPlayer = game.players.getPlayer(givingPlayerId);
  const card = givingPlayer.getCardAt(cardIndex);
  if (!card) {
    throw Error('Chỉ số lá bài nộp Potluck không hợp lệ');
  }

  // Đặt úp lá bài lên trên đỉnh bộ bài rút (insertIndex: 0)
  card.moveTo(game.piles.drawPile, { insertIndex: 0 });

  // Cập nhật danh sách hàng đợi Potluck
  const pending = game.gameState.potluckPending || [];
  const nextPending = pending.filter(id => id !== givingPlayerId);
  game.gameState.potluckPending = nextPending;

  if (nextPending.length > 0) {
    const nextPlayerId = nextPending[0];
    game.turnManager.setActivePlayers({
      value: {
        [nextPlayerId]: CHOOSE_CARD_FOR_POTLUCK,
      },
    });
  } else {
    game.turnManager.endStage();
  }
};
