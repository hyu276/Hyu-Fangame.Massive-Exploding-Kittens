import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_STEAL_A_CARD} from '../../constants/cards';
import {CHOOSE_PLAYER_TO_STEAL_FROM} from '../../constants/stages';
import {stealCard} from '../../moves/steal-card-move';

export class StealACard extends CardType {
  constructor(name: string = NAME_STEAL_A_CARD) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.players.getValidCardActionTargets(game.players.actingPlayer).length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);
    if (candidates.length === 1) {
      stealCard(game, candidates[0].id);
    } else if (candidates.length > 1) {
      game.turnManager.setStage(CHOOSE_PLAYER_TO_STEAL_FROM);
    }
  }

  sortOrder(): number {
    return 35;
  }
}
