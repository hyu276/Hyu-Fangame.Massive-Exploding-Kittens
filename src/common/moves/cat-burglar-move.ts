import { TheGame } from "../entities/game";
import { GAME_MODE_CAT_BURGLAR } from "../constants/game-modes";
import { CAT_BURGLAR_TARGET_CARDS } from "../constants/cat-burglar";
import { NAME_CAT_CARD } from "../constants/cards";

/**
 * Hành động cướp bài bằng tượng Mèo Đạo Tặc (Cat Burglar):
 * 1. Chuyển tượng Cat Burglar sang cho đối thủ.
 * 2. Gọi tên chính xác 1 loại Cat Card (Tacocat, Cattermelon, Hairy Potato Cat, Beard Cat, Rainbow-Ralphing Cat).
 * 3. Nếu đối thủ có lá bài đó, họ phải giao nộp 1 lá cho người cướp.
 * 4. Nếu không có, không nhận được gì.
 * 5. Trong cả hai trường hợp, tượng Mèo Đạo Tặc vẫn ở trước mặt đối thủ mới.
 * 6. Hành động này không thể bị Nope và có thể thực hiện bất kỳ lúc nào trong lượt.
 */
export const activateCatBurglar = (
  game: TheGame,
  targetPlayerId: string,
  catCardIndex: number
) => {
  const actingPlayer = game.players.actingPlayer;
  if (!actingPlayer) return;

  // 1. Phải đang ở Game Mode 4: Cat Burglar Edition
  if (game.gameState.gameMode !== GAME_MODE_CAT_BURGLAR) {
    throw new Error("Chức năng Mèo Đạo Tặc chỉ khả dụng trong chế độ Cat Burglar!");
  }

  // 2. Người thực hiện phải là người đang giữ phụ kiện Cat Burglar
  if (game.gameState.catBurglarHolderId !== actingPlayer.id) {
    throw new Error("Bạn không giữ phụ kiện Mèo Đạo Tặc (Cat Burglar)!");
  }

  // 3. Mỗi lượt chỉ được kích hoạt 1 lần
  if (game.gameState.catBurglarUsedThisTurn) {
    throw new Error("Bạn đã kích hoạt Mèo Đạo Tặc trong lượt này rồi!");
  }

  // 4. Không thể tự nhắm vào chính mình
  if (targetPlayerId === actingPlayer.id) {
    throw new Error("Không thể đặt Mèo Đạo Tặc trước mặt chính mình!");
  }

  // 5. Đối thủ mục tiêu phải còn sống
  const targetPlayer = game.players.getPlayer(targetPlayerId);
  if (!targetPlayer || !targetPlayer.isAlive) {
    throw new Error("Mục tiêu không hợp lệ hoặc đã bị loại!");
  }

  // 6. catCardIndex phải là 1 trong 5 loại Cat Card hợp lệ (0, 1, 2, 3, 4)
  const catOption = CAT_BURGLAR_TARGET_CARDS.find(c => c.index === catCardIndex);
  if (!catOption) {
    throw new Error("Loại Cat Card chỉ định không hợp lệ!");
  }

  // 7. Chuyển phụ kiện Cat Burglar cho đối thủ (dù có cướp được hay không)
  game.gameState.catBurglarHolderId = targetPlayerId;
  game.gameState.catBurglarUsedThisTurn = true;

  // 8. Kiểm tra xem đối thủ có lá Cat Card tương ứng không
  const matchingCatCards = targetPlayer.cards.filter(
    c => c.name === NAME_CAT_CARD && c.index === catCardIndex
  );

  let success = false;
  if (matchingCatCards.length > 0) {
    // Đối thủ có lá bài này: lấy 1 lá chuyển về tay actingPlayer
    const stolenCard = matchingCatCards[0];
    stolenCard.moveTo(actingPlayer);
    success = true;
  }

  // 9. Lưu nhật ký hành động để hiển thị VFX/thông báo trên UI
  game.gameState.lastCatBurglarAction = {
    robberId: actingPlayer.id,
    targetId: targetPlayerId,
    requestedCatIndex: catCardIndex,
    catName: catOption.name,
    success,
    timestamp: Date.now(),
  };
};
