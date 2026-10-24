import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_ALTER_THE_FUTURE_3X_NOW} from '../../constants/cards';
import {ALTERING_FUTURE, DEFUSE_EXPLODING_KITTEN} from '../../constants/stages';

export class AlterTheFuture3xNowCard extends CardType {
  constructor(name: string = NAME_ALTER_THE_FUTURE_3X_NOW) {
    super(name);
  }

  isNowCard(): boolean {
    return true;
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    // Không cho phép đánh ngắt quãng khi đang có người gỡ bom
    const activeStages = Object.values(game.context.ctx.activePlayers || {});
    if (activeStages.includes(DEFUSE_EXPLODING_KITTEN)) {
      return false;
    }
    return game.piles.drawPile.size > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    game.turnManager.setActivePlayers({
      value: {
        [actingPlayer.id]: ALTERING_FUTURE,
      },
    });
  }

  sortOrder(): number {
    return 17;
  }
}
