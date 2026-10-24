import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_STREAKING_KITTEN} from "../../constants/cards";

export class StreakingKittenCard extends CardType {
  constructor(name: string = NAME_STREAKING_KITTEN) {
    super(name);
  }

  canBePlayed(_game: TheGame, _card: Card): boolean {
    return false; // Thẻ bị động, giữ bí mật trên tay, không thể tự đánh ra
  }

  sortOrder(): number {
    return 11;
  }
}
