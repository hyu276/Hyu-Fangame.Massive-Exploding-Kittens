import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_DISCARD} from '../../constants/cards';
import {CHOOSE_PLAYER_FOR_DISCARD} from '../../constants/stages';
import {discardPlayerCards} from '../../moves/discard-player-move';

export class DiscardCard extends CardType {
  constructor(name: string = NAME_DISCARD) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.players.getValidCardActionTargets(game.players.actingPlayer).length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);
    if (candidates.length === 1) {
      discardPlayerCards(game, candidates[0].id);
    } else if (candidates.length > 1) {
      game.turnManager.setStage(CHOOSE_PLAYER_FOR_DISCARD);
    }
  }

  sortOrder(): number {
    return 36;
  }
}
