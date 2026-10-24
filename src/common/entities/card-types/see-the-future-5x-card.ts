import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_SEE_THE_FUTURE_5X} from "../../constants/cards";
import {VIEWING_FUTURE_5X} from "../../constants/stages";

export class SeeTheFuture5xCard extends CardType {
  constructor(name: string = NAME_SEE_THE_FUTURE_5X) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    // Xem 5 lá trên cùng của bộ bài
    game.turnManager.setStage(VIEWING_FUTURE_5X);
  }

  sortOrder(): number {
    return 12;
  }
}
