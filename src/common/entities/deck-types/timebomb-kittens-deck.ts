import {DeckType} from '../deck-type';
import {TheGame} from '../game';
import {
  TIMEBOMB_KITTEN,
  DEFUSE_TIMEBOMB,
  BLIND,
  SEARCH,
  DISCARD_CARD,
  COPYCAT
} from '../../registries/card-registry';

export class TimebombKittensDeck extends DeckType {
  constructor() {
    super(
      'timebomb_kittens',
      'Gói Mở Rộng: Timebomb Kittens (15 lá)',
      'Bộ mở rộng bom hẹn giờ, giới hạn lượt và kiểm soát đối thủ: 2 Timebomb Kitten, 3 Defuse Timebomb, 1 Blind, 3 Search, 3 Discard, 3 Copycat.',
      false,
      '💣',
      '/assets/decks/timebomb_kittens.png'
    );
  }

  startingHandSize(): number {
    return 0; // Bài chia ban đầu lấy từ Bộ Tiêu Chuẩn
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 1. Defuse Timebomb (3 lá) - Gỡ Timebomb hoặc Exploding Kitten
    for (let i = 0; i < 3; i++) {
      drawPile.addCard(DEFUSE_TIMEBOMB.createCard(i, game));
    }

    // 2. Blind (1 lá) - Khóa đánh bài lượt sau của đối thủ
    drawPile.addCard(BLIND.createCard(0, game));

    // 3. Search (3 lá) - Xem 5 lá đỉnh, chọn 1 lá và xáo phần còn lại
    for (let i = 0; i < 3; i++) {
      drawPile.addCard(SEARCH.createCard(i, game));
    }

    // 4. Discard (3 lá) - Hủy 2 lá ngẫu nhiên trên tay đối thủ
    for (let i = 0; i < 3; i++) {
      drawPile.addCard(DISCARD_CARD.createCard(i, game));
    }

    // 5. Copycat (3 lá) - Sao chép hiệu ứng lá hành động trước đó
    for (let i = 0; i < 3; i++) {
      drawPile.addCard(COPYCAT.createCard(i, game));
    }
  }

  addPostDealCards(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 6. Timebomb Kitten (2 lá) - Bom hẹn giờ thêm sau chia bài
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(TIMEBOMB_KITTEN.createCard(i, game));
    }
  }
}
