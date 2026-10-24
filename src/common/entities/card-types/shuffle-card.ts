import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class ShuffleCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    if (game.gameState.isShuffleForbidden) {
      return false;
    }
    return super.canBePlayed(game, _card);
  }

  onPlayed(game: TheGame, _card: Card) {
    game.piles.drawPile.shuffle();
  }

  sortOrder(): number {
    return 4;
  }
}
