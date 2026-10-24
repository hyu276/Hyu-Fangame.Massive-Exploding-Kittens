import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class SkipCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const multiplier = game.gameState.comboMultiplier || 1;
    if (multiplier > 1 && game.turnManager.turnsRemaining > 1) {
      game.turnManager.turnsRemaining = Math.max(1, game.turnManager.turnsRemaining - (multiplier - 1));
    }
    game.gameState.comboMultiplier = 1;
    game.turnManager.endTurn();
  }


  sortOrder(): number {
    return 2;
  }
}
