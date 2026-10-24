import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_KITTEN_ROLL_CALL, NAME_EXPLODING_KITTEN, NAME_IMPLODING_KITTEN} from '../../constants/cards';

export class KittenRollCallCard extends CardType {
  constructor(name: string = NAME_KITTEN_ROLL_CALL) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const drawPile = game.piles.drawPile;
    const rawCards = drawPile.rawCards;

    // Tìm tất cả các lá Mèo Nổ (Exploding Kitten & Imploding Kitten) trong bộ bài rút
    const kittens = rawCards.filter(
      c => c.name === NAME_EXPLODING_KITTEN || c.name === NAME_IMPLODING_KITTEN
    );
    const others = rawCards.filter(
      c => c.name !== NAME_EXPLODING_KITTEN && c.name !== NAME_IMPLODING_KITTEN
    );

    // Đặt toàn bộ Mèo Nổ lên trên đỉnh của bộ bài rút (đỉnh là index 0)
    const newDrawCards = [...kittens, ...others];
    rawCards.splice(0, rawCards.length, ...newDrawCards);
    drawPile.updateSize();

    // Khóa quyền dùng Shuffle cho người tiếp theo
    game.gameState.isShuffleForbidden = true;
  }

  sortOrder(): number {
    return 38;
  }
}
