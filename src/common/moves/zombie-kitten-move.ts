import {TheGame} from "../entities/game";

export const resurrectPlayer = (game: TheGame, targetDeadPlayerId: string) => {
  // Hỗ trợ hồi sinh Carl trong Mode 6 (Zombie Carl)
  if (targetDeadPlayerId === 'carl' && game.gameState.carl && !game.gameState.carl.isAlive) {
    game.gameState.carl.isAlive = true;
    game.turnManager.endStage();
    if (game.gameState.isResurrectingFromDefuse) {
      game.gameState.isResurrectingFromDefuse = false;
      game.turnManager.endTurn();
    }
    return;
  }

  const target = game.players.getPlayer(targetDeadPlayerId);
  if (!target || target.isAlive || target.hasLeft) {
    throw new Error('Mục tiêu hồi sinh không hợp lệ');
  }

  target.resurrect();
  game.turnManager.endStage();

  // Nếu việc chọn hồi sinh xuất phát từ tình huống Defuse, kết thúc lượt của người chơi
  if (game.gameState.isResurrectingFromDefuse) {
    game.gameState.isResurrectingFromDefuse = false;
    game.turnManager.endTurn();
  }
};
