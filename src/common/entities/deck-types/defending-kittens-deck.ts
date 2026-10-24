import {DeckType} from '../deck-type';
import {TheGame} from '../game';
import {
  DRAW_FROM_THE_BOTTOM,
  ANNOY,
  REVERSE,
  SEE_THE_FUTURE_1X,
  SEE_THE_FUTURE,
  SEE_THE_FUTURE_5X,
  ALTER_THE_FUTURE,
  ALTER_THE_FUTURE_5X,
  CURSE_OF_CRYSTAL_CORN,
  KITTEN_ROLL_CALL,
  SHUFFLE
} from '../../registries/card-registry';

export class DefendingKittensDeck extends DeckType {
  constructor() {
    super(
      'defending_kittens',
      'Gói Mở Rộng: Defending Kittens (14 lá)',
      'Bộ mở rộng thiên về phòng thủ và kiểm soát bộ bài rút: 1 Rút Từ Đáy, 1 Làm Phiền (Annoy), 2 Đảo Chiều, 4 Nhìn Tương Lai (1x, 3x, 5x), 2 Đổi Tương Lai (3x, 5x), 1 Curse of Crystal Corn, 1 Kitten Roll Call, 2 Xáo Bài.',
      false,
      '🛡️',
      '/assets/decks/defending_kittens.png'
    );
  }

  startingHandSize(): number {
    return 0; // Bài chia ban đầu lấy từ Bộ Tiêu Chuẩn
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 1. Draw From the Bottom (1 lá) - Rút lá dưới cùng
    drawPile.addCard(DRAW_FROM_THE_BOTTOM.createCard(0, game));

    // 2. Annoy (1 lá) - Khóa ngẫu nhiên 2 lá trên tay đối thủ
    drawPile.addCard(ANNOY.createCard(0, game));

    // 3. Reverse (2 lá) - Đảo chiều vòng chơi
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(REVERSE.createCard(i, game));
    }

    // 4. See the Future (4 lá): 1x (1 lá), 3x (2 lá), 5x (1 lá)
    drawPile.addCard(SEE_THE_FUTURE_1X.createCard(0, game));
    drawPile.addCard(SEE_THE_FUTURE.createCard(0, game));
    drawPile.addCard(SEE_THE_FUTURE.createCard(1, game));
    drawPile.addCard(SEE_THE_FUTURE_5X.createCard(0, game));

    // 5. Alter the Future (2 lá): 3x (1 lá), 5x (1 lá)
    drawPile.addCard(ALTER_THE_FUTURE.createCard(0, game));
    drawPile.addCard(ALTER_THE_FUTURE_5X.createCard(0, game));

    // 6. Anti-Shuffle: The Curse of Crystal Corn (1 lá) - Chặn và hủy lá Shuffle
    drawPile.addCard(CURSE_OF_CRYSTAL_CORN.createCard(0, game));

    // 7. Anti-Shuffle: Kitten Roll Call (1 lá) - Đưa toàn bộ Mèo Nổ lên đầu và cấm Shuffle
    drawPile.addCard(KITTEN_ROLL_CALL.createCard(0, game));

    // 8. Shuffle (2 lá) - Xáo trộn bộ bài rút
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(SHUFFLE.createCard(i, game));
    }
  }
}
