import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_SEE_THE_FUTURE_1X} from '../../constants/cards';
import {VIEWING_FUTURE_1X} from '../../constants/stages';

export class SeeTheFuture1xCard extends CardType {
  constructor(name: string = NAME_SEE_THE_FUTURE_1X) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    // Xem 1 lá trên cùng của bộ bài rút
    game.turnManager.setStage(VIEWING_FUTURE_1X);
  }

  sortOrder(): number {
    return 36;
  }
}
