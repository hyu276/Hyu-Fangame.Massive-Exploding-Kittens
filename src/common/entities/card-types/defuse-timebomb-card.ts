import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_DEFUSE_TIMEBOMB} from '../../constants/cards';
import {EXPLODING_KITTEN} from '../../registries/card-registry';

export class DefuseTimebombCard extends CardType {
  constructor(name: string = NAME_DEFUSE_TIMEBOMB) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    // Có thể chủ động đánh nếu người chơi đang có Timebomb Kitten đặt trước mặt
    const player = game.players.actingPlayer;
    return !!(player && player.activeTimebombs && player.activeTimebombs.length > 0);
  }

  onPlayed(game: TheGame, _card: Card) {
    const player = game.players.actingPlayer;
    if (!player) return;

    if (player.defuseTimebomb()) {
      // Khi Timebomb được gỡ: thay bằng 1 Exploding Kitten vào bộ bài rút (artwork index 0)
      game.piles.drawPile.addCard(EXPLODING_KITTEN.createCard(0, game));
      game.piles.drawPile.shuffle();
    }
  }

  sortOrder(): number {
    return 1;
  }
}
