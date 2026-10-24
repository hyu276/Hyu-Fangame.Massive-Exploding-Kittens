import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_BLIND} from '../../constants/cards';
import {CHOOSE_PLAYER_FOR_BLIND} from '../../constants/stages';
import {blindPlayer} from '../../moves/blind-player-move';

export class BlindCard extends CardType {
  constructor(name: string = NAME_BLIND) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.players.getValidCardActionTargets(game.players.actingPlayer).length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);
    if (candidates.length === 1) {
      blindPlayer(game, candidates[0].id);
    } else if (candidates.length > 1) {
      game.turnManager.setStage(CHOOSE_PLAYER_FOR_BLIND);
    }
  }

  sortOrder(): number {
    return 34;
  }
}
