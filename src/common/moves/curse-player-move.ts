import {TheGame} from "../entities/game";

/**
 * Nguyền rủa người chơi mục tiêu bằng Lời Nguyền Mông Mèo (Curse of the Cat Butt)
 * Bài trên tay bị úp mù và xáo trộn ngẫu nhiên.
 */
export const cursePlayer = (game: TheGame, targetPlayerId: string) => {
  const target = game.players.getPlayer(targetPlayerId);
  if (!target || !target.isAlive) {
    console.error("Invalid target for Curse");
    return;
  }

  // Đặt trạng thái mù bài
  target.isBlinded = true;

  // Xáo trộn mù thứ tự bài trên tay của mục tiêu
  target.shuffle();

  game.turnManager.endStage();
};
