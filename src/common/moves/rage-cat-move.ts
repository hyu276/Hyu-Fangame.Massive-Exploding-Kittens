import { TheGame } from "../entities/game";

/**
 * Move sử dụng tượng Rage Cat (Mode 10 - Rage Mode).
 * Người giữ chuyển tượng cho một đối thủ và cướp ngẫu nhiên 1 lá của họ.
 * Không bị Nope, không kết thúc lượt.
 */
export const activateRageCat = (game: TheGame, targetPlayerId: string) => {
  const actor = game.players.currentPlayer;
  if (!actor || !actor.isAlive) throw new Error('Không phải lượt của bạn');

  const rageMode = game.gameState.rageMode;
  if (!rageMode || rageMode.rageCatHolderId !== actor.id) {
    throw new Error('Bạn không giữ tượng Rage Cat');
  }

  if (rageMode.rageCatUsedThisTurn) {
    throw new Error('Bạn đã sử dụng Rage Cat trong lượt này rồi');
  }

  const target = game.players.getPlayer(targetPlayerId);
  if (!target || !target.isAlive || target.id === actor.id) {
    throw new Error('Mục tiêu không hợp lệ');
  }

  // Chuyển tượng Rage Cat sang đối thủ
  rageMode.rageCatHolderId = target.id;
  rageMode.rageCatUsedThisTurn = true;

  // Cướp ngẫu nhiên 1 lá của đối thủ
  if (target.handSize > 0) {
    const randomIndex = Math.floor(game.random.Number() * target.handSize);
    const stolenCard = target.removeCardAt(randomIndex);
    if (stolenCard) {
      actor.addCard(stolenCard);
      actor.resolveStolenCardHazard(stolenCard);
    }
  }
};
