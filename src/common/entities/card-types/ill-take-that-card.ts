import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_ILL_TAKE_THAT} from '../../constants/cards';
import {CHOOSE_PLAYER_FOR_ILL_TAKE_THAT} from '../../constants/stages';

export class IllTakeThatCard extends CardType {
  constructor(name: string = NAME_ILL_TAKE_THAT) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    game.turnManager.setStage(CHOOSE_PLAYER_FOR_ILL_TAKE_THAT);
  }

  sortOrder(): number {
    return 21;
  }
}
