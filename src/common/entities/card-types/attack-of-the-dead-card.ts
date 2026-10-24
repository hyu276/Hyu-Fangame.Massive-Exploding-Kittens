import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_ATTACK_OF_THE_DEAD} from '../../constants/cards';
import {findNextAlivePlayer} from '../../utils/turn-order';

export class AttackOfTheDeadCard extends CardType {
  constructor(name: string = NAME_ATTACK_OF_THE_DEAD) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    const deadPlayers = game.context.G.deadPlayers || [];
    return deadPlayers.length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const { turnManager } = game;
    const { ctx } = game.context;
    const deadCount = game.context.G.deadPlayers?.length ?? 0;

    if (deadCount === 0) {
      return;
    }

    // Mỗi người chết ép người kế tiếp nhận 3 lượt chơi
    const attackTurns = 3 * deadCount;
    turnManager.addAttackTurns(attackTurns);

    const isReversed = game.gameState?.isReversed ?? false;
    const step = isReversed ? -1 : 1;
    const nextPlayerIndex = findNextAlivePlayer(game, ctx.playOrderPos + step);

    if (nextPlayerIndex !== undefined) {
      turnManager.endTurn({ next: turnManager.playOrder[nextPlayerIndex] });
    } else {
      turnManager.endTurn();
    }
  }

  sortOrder(): number {
    return 27;
  }
}
