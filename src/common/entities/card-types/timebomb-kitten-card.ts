import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_TIMEBOMB_KITTEN} from '../../constants/cards';

export class TimebombKittenCard extends CardType {
  constructor(name: string = NAME_TIMEBOMB_KITTEN) {
    super(name);
  }

  canBePlayed(_game: TheGame, _card: Card): boolean {
    return false; // Timebomb Kitten không thể tự chủ động đánh từ trên tay
  }

  onPlayed(_game: TheGame, _card: Card) {}

  sortOrder(): number {
    return 100;
  }
}
