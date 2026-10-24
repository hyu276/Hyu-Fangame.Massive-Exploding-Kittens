import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_CATOMIC_BOMB, NAME_EXPLODING_KITTEN} from "../../constants/cards";

export class CatomicBombCard extends CardType {
  constructor(name: string = NAME_CATOMIC_BOMB) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const drawPile = game.piles.drawPile;
    const cards = drawPile.rawCards;

    // Tách toàn bộ Exploding Kitten ra khỏi bộ bài rút
    const explodingKittens = cards.filter(c => c.name === NAME_EXPLODING_KITTEN);
    const nonExploding = cards.filter(c => c.name !== NAME_EXPLODING_KITTEN);

    // Xáo trộn phần còn lại
    const shuffledNonExploding = game.random.Shuffle(nonExploding);

    // Đặt toàn bộ Exploding Kitten lên TRÊN CÙNG của bộ bài
    const newDrawCards = [...explodingKittens, ...shuffledNonExploding];
    cards.splice(0, cards.length, ...newDrawCards);
    drawPile.updateSize();

    // Kết thúc lượt ngay lập tức mà không cần rút bài
    game.turnManager.endTurn();
  }

  sortOrder(): number {
    return 16;
  }
}
