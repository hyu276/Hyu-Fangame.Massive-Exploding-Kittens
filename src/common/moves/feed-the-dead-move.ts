import {TheGame} from "../entities/game";
import {GIVE_CARD_TO_FEED_DEAD} from "../constants/stages";

export const selectDeadPlayerForFeed = (game: TheGame, targetDeadPlayerId: string) => {
  const deadPlayers = game.context.G.deadPlayers || [];
  if (!deadPlayers.includes(targetDeadPlayerId) || game.players.getPlayer(targetDeadPlayerId).hasLeft) {
    throw new Error('Mục tiêu chọn không phải là người đã chết');
  }

  game.gameState.feedTheDeadTarget = targetDeadPlayerId;

  // Lập danh sách tất cả những người chơi còn sống KHÁC người đánh, và có bài trên tay
  const actingPlayer = game.players.actingPlayer;
  const pendingPlayers = game.players.alivePlayers
    .filter(p => p.id !== actingPlayer?.id && p.handSize > 0)
    .map(p => p.id);

  if (pendingPlayers.length === 0) {
    game.gameState.feedTheDeadTarget = null;
    game.turnManager.endStage();
    return;
  }

  game.gameState.feedTheDeadPending = pendingPlayers;
  const firstPlayer = pendingPlayers[0];
  game.turnManager.setActivePlayers({
    value: {
      [firstPlayer]: GIVE_CARD_TO_FEED_DEAD,
    },
  });
};

export const giveCardToFeedDead = (game: TheGame, cardIndex: number) => {
  const { ctx } = game.context;

  // Tìm người đang ở stage GIVE_CARD_TO_FEED_DEAD
  const givingPlayerId = Object.keys(ctx.activePlayers || {}).find(
    pId => ctx.activePlayers?.[pId] === GIVE_CARD_TO_FEED_DEAD
  );

  if (!givingPlayerId) {
    throw new Error('Không tìm thấy người chơi trong giai đoạn nộp bài Feed the Dead');
  }

  const givingPlayer = game.players.getPlayer(givingPlayerId);
  const targetDeadPlayerId = game.gameState.feedTheDeadTarget;
  if (!targetDeadPlayerId) {
    throw new Error('Không có mục tiêu người chết để nộp bài');
  }

  const targetDeadPlayer = game.players.getPlayer(targetDeadPlayerId);
  const card = givingPlayer.getCardAt(cardIndex);
  if (!card) {
    throw new Error('Chỉ số thẻ bài nộp cho Feed the Dead không hợp lệ');
  }

  card.moveTo(targetDeadPlayer);
  targetDeadPlayer.checkExplodingKittenHazard();

  const pending = game.gameState.feedTheDeadPending || [];
  const nextPending = pending.filter(id => id !== givingPlayerId);
  game.gameState.feedTheDeadPending = nextPending;

  if (nextPending.length > 0) {
    const nextPlayerId = nextPending[0];
    game.turnManager.setActivePlayers({
      value: {
        [nextPlayerId]: GIVE_CARD_TO_FEED_DEAD,
      },
    });
  } else {
    game.gameState.feedTheDeadTarget = null;
    game.gameState.feedTheDeadPending = [];
    game.turnManager.endStage();
  }
};
