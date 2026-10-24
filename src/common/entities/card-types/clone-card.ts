import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_CLONE} from '../../constants/cards';

export class CloneCard extends CardType {
  constructor(name: string = NAME_CLONE) {
    super(name);
  }

  onPlayed(game: TheGame, card: Card) {
    const discardCards = game.piles.discardPile.allCards;
    // Lá bài vừa đánh (Clone) nằm ở đỉnh discardPile (length - 1)
    // Lá ngay phía dưới nó nằm ở vị trí (length - 2)
    if (discardCards.length >= 2) {
      const beneathCard = discardCards[discardCards.length - 2];
      if (beneathCard && beneathCard.name !== NAME_CLONE) {
        // Sao chép và kích hoạt công dụng của lá bài phía dưới
        beneathCard.type.onPlayed(game, card);
      }
    }
  }

  sortOrder(): number {
    return 23;
  }
}
