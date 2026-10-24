import {TheGame} from "../entities/game";

/**
 * Chọn 1 lá trong 5 lá trên cùng của bộ bài rút để nhận, sau đó xáo phần còn lại vào bộ bài.
 */
export const pickSearchCard = (game: TheGame, cardIndexInTop5: number) => {
  const player = game.players.actingPlayer;
  if (!player || !player.isAlive) return;

  const drawPile = game.piles.drawPile;
  const topCards = drawPile.allCards.slice(0, 5);

  if (cardIndexInTop5 < 0 || cardIndexInTop5 >= topCards.length) {
    console.error("Invalid search card index", cardIndexInTop5);
    return;
  }

  const chosenCard = topCards[cardIndexInTop5];
  // Chuyển lá bài được chọn về tay người chơi
  chosenCard.moveTo(player, { visibleTo: [player.id] });

  // Xáo trộn phần còn lại vào bộ bài rút
  drawPile.shuffle();

  // Dọn dẹp trạng thái và kết thúc stage tìm kiếm trước
  game.gameState.searchTopCards = undefined;
  game.turnManager.endStage();

  // Sau khi kết thúc stage tìm kiếm mới kiểm tra hazard (tránh bị endStage ghi đè Defuse)
  player.checkExplodingKittenHazard();
};
