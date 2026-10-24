import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_CURSE_OF_CRYSTAL_CORN, NAME_SHUFFLE, NAME_SHUFFLE_NOW} from '../../constants/cards';

export class CurseOfCrystalCornCard extends CardType {
  constructor(name: string = NAME_CURSE_OF_CRYSTAL_CORN) {
    super(name);
  }

  isNowCard(): boolean {
    return true;
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    const pending = game.piles.pendingCard;
    if (pending) {
      return (
        (pending.card.name === NAME_SHUFFLE || pending.card.name === NAME_SHUFFLE_NOW) &&
        !pending.isNoped
      );
    }
    // Có thể đánh chủ động trong lượt của mình để cấm người khác xáo bài
    return game.players.actingPlayer.isCurrentPlayer;
  }

  onPlayed(game: TheGame, _card: Card) {
    const pending = game.piles.pendingCard;
    if (pending && (pending.card.name === NAME_SHUFFLE || pending.card.name === NAME_SHUFFLE_NOW)) {
      // Hủy hiệu ứng lá Shuffle ngay lập tức
      pending.isNoped = true;
      pending.lastNopeBy = game.players.actingPlayer.id;
      return;
    }

    // Nếu đánh chủ động: phong tỏa cấm tất cả hành động Shuffle đến hết lượt này
    game.gameState.isShuffleForbidden = true;
  }

  sortOrder(): number {
    return 37;
  }
}
