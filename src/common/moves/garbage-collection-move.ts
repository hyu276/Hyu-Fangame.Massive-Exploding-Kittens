import {TheGame} from "../entities/game";
import {CHOOSE_CARD_FOR_GARBAGE} from "../constants/stages";

/**
 * Người chơi chọn 1 lá bài trên tay nộp vào Chồng bài rút (Garbage Collection)
 */
export const giveGarbageCard = (game: TheGame, cardIndex: number) => {
  const actingPlayer = game.players.actingPlayer;
  if (!actingPlayer) return;

  const pending = game.gameState.garbageCollectionPending || [];
  if (!pending.includes(actingPlayer.id)) {
    return; // Người chơi đã nộp bài hoặc không thuộc danh sách
  }

  const card = actingPlayer.getCardAt(cardIndex);
  if (!card) {
    console.error("Card not found at index", cardIndex);
    return;
  }

  card.setMarked(false);
  card.moveTo(game.piles.drawPile);

  // Xóa actingPlayer khỏi danh sách chờ
  const updatedPending = pending.filter(id => id !== actingPlayer.id);
  game.gameState.garbageCollectionPending = updatedPending;

  if (updatedPending.length === 0) {
    // Tất cả người chơi đã nộp bài: xáo trộn Chồng bài rút và kết thúc stage
    game.piles.drawPile.shuffle();
    game.turnManager.endStage();
    game.turnManager.setActivePlayers({ value: {} });
  } else {
    // Cập nhật lại danh sách activePlayers cho những người chưa nộp
    const activeObj: Record<string, string> = {};
    updatedPending.forEach(id => {
      activeObj[id] = CHOOSE_CARD_FOR_GARBAGE;
    });
    game.turnManager.setActivePlayers({
      value: activeObj
    });
  }
};
