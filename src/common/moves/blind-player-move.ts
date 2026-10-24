import {TheGame} from "../entities/game";

/**
 * Cấm mục tiêu đánh bài ở lượt tiếp theo bằng lá Làm Mù (Blind)
 */
export const blindPlayer = (game: TheGame, targetPlayerId: string) => {
  const target = game.players.getPlayer(targetPlayerId);
  if (!target || !target.isAlive) {
    console.error("Invalid target for Blind");
    return;
  }

  target.isCardPlayBlocked = true;
  game.turnManager.endStage();
};
