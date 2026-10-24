import {TheGame} from "../entities/game";
import {CHOOSE_CARD_FOR_GRAVE_ROBBER} from "../constants/stages";

export const giveCardForGraveRobber = (game: TheGame, cardIndex: number) => {
  const { ctx } = game.context;

  // Tìm người chết đang ở stage CHOOSE_CARD_FOR_GRAVE_ROBBER
  const givingPlayerId = Object.keys(ctx.activePlayers || {}).find(
    pId => ctx.activePlayers?.[pId] === CHOOSE_CARD_FOR_GRAVE_ROBBER
  );

  if (!givingPlayerId) {
    throw new Error('Không tìm thấy người chơi trong giai đoạn nộp bài Grave Robber');
  }

  const givingPlayer = game.players.getPlayer(givingPlayerId);
  const card = givingPlayer.getCardAt(cardIndex);
  if (!card) {
    throw new Error('Chỉ số thẻ bài nộp cho Grave Robber không hợp lệ');
  }

  // Đặt thẻ bài vào bộ bài rút
  card.moveTo(game.piles.drawPile);

  const pending = game.gameState.graveRobberPending || [];
  const nextPending = pending.filter(id => id !== givingPlayerId);
  game.gameState.graveRobberPending = nextPending;

  if (nextPending.length > 0) {
    const nextPlayerId = nextPending[0];
    game.turnManager.setActivePlayers({
      value: {
        [nextPlayerId]: CHOOSE_CARD_FOR_GRAVE_ROBBER,
      },
    });
  } else {
    // Sau khi tất cả người chết đã nộp bài, xáo trộn bộ bài rút
    game.piles.drawPile.shuffle();
    game.gameState.graveRobberPending = [];
    game.turnManager.endStage();
  }
};
