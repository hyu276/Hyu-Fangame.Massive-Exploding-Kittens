import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_ALTER_THE_FUTURE_5X} from "../../constants/cards";
import {ALTERING_FUTURE_5X} from "../../constants/stages";

export class AlterTheFuture5xCard extends CardType {
  constructor(name: string = NAME_ALTER_THE_FUTURE_5X) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    // Xem và sắp xếp lại 5 lá trên cùng
    game.turnManager.setStage(ALTERING_FUTURE_5X);
  }

  sortOrder(): number {
    return 13;
  }
}
