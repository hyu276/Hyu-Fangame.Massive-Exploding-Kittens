import {TheGame} from "../entities/game";

/**
 * Chỉ định 1 người chơi nhận 2 lượt chơi liên tiếp và chuyển lượt sang người đó
 */
export const targetedAttack = (game: TheGame, targetPlayerId: string) => {
  const { turnManager } = game;
  const target = game.players.getPlayer(targetPlayerId);

  if (!target || !target.isAlive || target.id === game.players.actingPlayerId) {
    console.error("Invalid target for targeted attack");
    return;
  }

  // Cộng dồn lượt: +2 lượt tấn công * multiplier + 1 bù onEnd decrement
  const multiplier = game.gameState.comboMultiplier || 1;
  turnManager.addAttackTurns(2 * multiplier);
  game.gameState.comboMultiplier = 1;

  // Kết thúc stage nếu đang ở stage chọn mục tiêu
  game.turnManager.endStage();

  // Chuyển trực tiếp sang lượt của người được nhắm tới
  turnManager.endTurn({ next: targetPlayerId });
};
