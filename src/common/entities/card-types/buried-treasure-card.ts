import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_BURIED_TREASURE} from '../../constants/cards';

export class BuriedTreasureCard extends CardType {
  constructor(name: string = NAME_BURIED_TREASURE) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return false;
    // Có ít nhất 1 đối thủ còn sống có bài trên tay
    return game.players.alivePlayers.some(p => p.id !== actingPlayer.id && p.handSize > 0);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    // Lấy ngẫu nhiên 1 lá từ mỗi đối thủ còn sống có bài trên tay
    const opponents = game.players.alivePlayers.filter(
      p => p.id !== actingPlayer.id && p.handSize > 0
    );

    const stolenCards: Card[] = [];

    for (const opp of opponents) {
      const count = opp.handSize;
      if (count > 0) {
        const randIdx = Math.floor(game.random.Number() * count);
        const card = opp.getCardAt(randIdx);
        if (card) {
          stolenCards.push(card);
        }
      }
    }

    if (stolenCards.length === 0) {
      return;
    }

    // Xáo trộn các lá bài vừa thu thập được
    const shuffledStolenCards = game.random.Shuffle(stolenCards);

    // Đặt từng lá xuống dưới đáy của Chồng bài rút
    for (const c of shuffledStolenCards) {
      c.setMarked(false);
      c.moveTo(game.piles.drawPile, { insertIndex: game.piles.drawPile.size });
    }

    // Kiểm tra xem có người chơi nào bị mất Streaking Kitten dẫn đến phát nổ Mèo Nổ trên tay không
    for (const opp of opponents) {
      opp.checkExplodingKittenHazard();
    }
  }

  sortOrder(): number {
    return 31;
  }
}
