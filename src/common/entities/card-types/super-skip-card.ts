import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_SUPER_SKIP} from "../../constants/cards";

export class SuperSkipCard extends CardType {
  constructor(name: string = NAME_SUPER_SKIP) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    // Kết thúc toàn bộ các lượt hiện tại, kể cả khi đang bị cộng dồn Attack
    game.turnManager.turnsRemaining = 1;
    game.turnManager.endTurn();
  }

  sortOrder(): number {
    return 2;
  }
}
