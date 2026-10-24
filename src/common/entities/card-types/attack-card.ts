import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {findNextAlivePlayer} from "../../utils/turn-order";

export class AttackCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const { turnManager } = game;
    const { ctx } = game.context;

    const multiplier = game.gameState.comboMultiplier || 1;
    turnManager.addAttackTurns(2 * multiplier);
    game.gameState.comboMultiplier = 1;

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
    return 1;
  }
}
