import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_SHUFFLE_NOW} from '../../constants/cards';
import {DEFUSE_EXPLODING_KITTEN} from '../../constants/stages';

export class ShuffleNowCard extends CardType {
  constructor(name: string = NAME_SHUFFLE_NOW) {
    super(name);
  }

  isNowCard(): boolean {
    return true;
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    const activeStages = Object.values(game.context.ctx.activePlayers || {});
    if (activeStages.includes(DEFUSE_EXPLODING_KITTEN)) {
      return false;
    }
    if (game.gameState.isShuffleForbidden) {
      return false;
    }
    return super.canBePlayed(game, _card);
  }

  onPlayed(game: TheGame, _card: Card) {
    game.piles.drawPile.shuffle();
  }

  sortOrder(): number {
    return 28;
  }
}
