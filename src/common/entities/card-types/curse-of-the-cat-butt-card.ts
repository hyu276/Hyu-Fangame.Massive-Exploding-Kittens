import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_CURSE_OF_THE_CAT_BUTT} from "../../constants/cards";
import {CHOOSE_PLAYER_FOR_CURSE} from "../../constants/stages";
import {cursePlayer} from "../../moves/curse-player-move";

export class CurseOfTheCatButtCard extends CardType {
  constructor(name: string = NAME_CURSE_OF_THE_CAT_BUTT) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.players.getValidCardActionTargets(game.players.actingPlayer).length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);
    if (candidates.length === 1) {
      cursePlayer(game, candidates[0].id);
    } else if (candidates.length > 1) {
      game.turnManager.setStage(CHOOSE_PLAYER_FOR_CURSE);
    }
  }

  sortOrder(): number {
    return 18;
  }
}
