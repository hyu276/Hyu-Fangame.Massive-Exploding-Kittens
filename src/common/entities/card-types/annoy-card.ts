import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_ANNOY} from '../../constants/cards';
import {CHOOSE_PLAYER_FOR_ANNOY} from '../../constants/stages';
import {annoyPlayer} from '../../moves/annoy-player-move';

export class AnnoyCard extends CardType {
  constructor(name: string = NAME_ANNOY) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.players.getValidCardActionTargets(game.players.actingPlayer).length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);
    if (candidates.length === 1) {
      annoyPlayer(game, candidates[0].id);
    } else if (candidates.length > 1) {
      game.turnManager.setStage(CHOOSE_PLAYER_FOR_ANNOY);
    }
  }

  sortOrder(): number {
    return 33;
  }
}
