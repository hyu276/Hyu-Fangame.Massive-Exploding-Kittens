import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {ALTERING_FUTURE} from "../../constants/stages";

export class AlterTheFutureCard extends CardType {
  constructor(name: string = 'alter_the_future') {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    // Kích hoạt stage cho phép xem và sắp xếp lại 3 lá bài trên cùng
    game.turnManager.setStage(ALTERING_FUTURE);
  }

  sortOrder(): number {
    return 9;
  }
}
