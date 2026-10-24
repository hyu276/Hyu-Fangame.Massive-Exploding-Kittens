import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class ImplodingKittenCard extends CardType {
  constructor(name: string = 'imploding_kitten') {
    super(name);
  }

  canBePlayed(_game: TheGame, _card: Card): boolean {
    return false; // Không thể tự đánh ra từ trên tay
  }

  sortOrder(): number {
    return 0;
  }
}
