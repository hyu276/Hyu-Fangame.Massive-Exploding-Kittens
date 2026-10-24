import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_FLIP_FOUR, NAME_IMPLODING_KITTEN} from '../../constants/cards';

export class FlipFourCard extends CardType {
  constructor(name: string = NAME_FLIP_FOUR) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const drawPile = game.piles.drawPile;
    const count = Math.min(4, drawPile.size);
    if (count <= 0) return;

    // Lấy 4 lá trên cùng (index 0 đến count - 1)
    const topCards = drawPile.rawCards.slice(0, count);

    // Lật ngược hướng mặt (úp thành ngửa, ngửa thành úp)
    topCards.forEach(c => {
      c.isFaceUp = !c.isFaceUp;
      // Nếu là Imploding Kitten, đồng bộ cờ implodingKittenFaceUp
      if (c.name === NAME_IMPLODING_KITTEN) {
        game.gameState.implodingKittenFaceUp = c.isFaceUp;
      }
    });

    // Đảo ngược thứ tự của 4 lá
    topCards.reverse();

    // Đặt lại vào đỉnh của Chồng bài rút
    drawPile.rawCards.splice(0, count, ...topCards);

    // Cập nhật trạng thái hiển thị lá bài ngửa trên đỉnh nếu có
    if (drawPile.rawCards[0]?.isFaceUp) {
      game.gameState.topDrawCard = { ...drawPile.rawCards[0] };
    } else {
      game.gameState.topDrawCard = null;
    }
  }

  sortOrder(): number {
    return 22;
  }
}
