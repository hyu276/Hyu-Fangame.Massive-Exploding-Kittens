import {TheGame} from "../entities/game";

/**
 * Khóa ngẫu nhiên tối đa 2 lá bài trên tay mục tiêu (kể cả Defuse) bằng lá Làm Phiền (Annoy)
 */
export const annoyPlayer = (game: TheGame, targetPlayerId: string) => {
  const target = game.players.getPlayer(targetPlayerId);
  if (!target || !target.isAlive || target.handSize === 0) {
    console.error("Invalid target for Annoy");
    return;
  }

  // Lấy danh sách các lá chưa bị khóa trên tay mục tiêu
  const unlocked = target.hand.filter(c => !c.isLocked);
  const pool = unlocked.length > 0 ? unlocked : target.hand;

  // Xáo trộn ngẫu nhiên và khóa tối đa 2 lá
  const shuffled = game.random.Shuffle(pool);
  const countToLock = Math.min(2, shuffled.length);
  for (let i = 0; i < countToLock; i++) {
    shuffled[i].setLocked(true);
  }

  game.turnManager.endStage();
};
