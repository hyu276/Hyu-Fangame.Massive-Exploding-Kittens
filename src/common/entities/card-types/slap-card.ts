import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {findNextAlivePlayer} from '../../utils/turn-order';

export class SlapCard extends CardType {
  constructor(name: string, public readonly multiplier: number = 2) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const { turnManager } = game;
    const { ctx } = game.context;

    turnManager.addAttackTurns(this.multiplier);

    // End turn and force move to next alive player
    const step = game.gameState?.isReversed ? -1 : 1;
    const nextPlayerIndex = findNextAlivePlayer(game, ctx.playOrderPos + step);

    if (nextPlayerIndex !== undefined) {
      turnManager.endTurn({ next: turnManager.playOrder[nextPlayerIndex] });
    } else {
      turnManager.endTurn();
    }
  }

  sortOrder(): number {
    return 34;
  }
}
