import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class DrawFromTheBottomCard extends CardType {
  constructor(name: string = 'draw_from_the_bottom') {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    // Rút lá bài ở dưới đáy của chồng bài rút thay vì trên đỉnh
    game.players.actingPlayer.drawFromBottom();
  }

  sortOrder(): number {
    return 8;
  }
}
