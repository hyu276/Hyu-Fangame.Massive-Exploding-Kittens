import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_MARK} from "../../constants/cards";
import {CHOOSE_PLAYER_FOR_MARK} from "../../constants/stages";
import {markPlayer} from "../../moves/mark-player-move";

export class MarkCard extends CardType {
  constructor(name: string = NAME_MARK) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.players.getValidCardActionTargets(game.players.actingPlayer).length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);
    if (candidates.length === 1) {
      markPlayer(game, candidates[0].id);
    } else if (candidates.length > 1) {
      game.turnManager.setStage(CHOOSE_PLAYER_FOR_MARK);
    }
  }

  sortOrder(): number {
    return 17;
  }
}
