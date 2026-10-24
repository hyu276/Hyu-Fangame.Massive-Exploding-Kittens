import {DeckType} from '../deck-type';
import {TheGame} from '../game';
import {
  ANNOY,
  ALTER_THE_FUTURE,
  DEFUSE,
  SLAP_1X,
  SLAP_2X,
  SLAP_3X,
  STEAL_A_CARD,
  EXPLODING_KITTEN
} from '../../registries/card-registry';

export class AttackingKittensDeck extends DeckType {
  constructor() {
    super(
      'attacking_kittens',
      'Gói Mở Rộng: Attacking Kittens (14 lá)',
      'Bộ mở rộng thiên về tấn công, cướp bài và ép đối thủ thực hiện thêm lượt: 1 Annoy, 1 Alter the Future (3x), 2 Defuse, 4 Slap (1x, 2x, 3x), 4 Steal a Card, 2 Exploding Kitten.',
      false,
      '⚔️',
      '/assets/decks/attacking_kittens.png'
    );
  }

  startingHandSize(): number {
    return 0; // Bài chia ban đầu lấy từ Bộ Tiêu Chuẩn
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 1. Annoy (1 lá) - Khóa ngẫu nhiên 2 lá bài trên tay đối thủ
    drawPile.addCard(ANNOY.createCard(0, game));

    // 2. Alter the Future 3x (1 lá) - Xem và sắp xếp lại 3 lá đầu
    drawPile.addCard(ALTER_THE_FUTURE.createCard(0, game));

    // 3. Defuse (2 lá) - Hóa giải Mèo Nổ bổ sung
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(DEFUSE.createCard(i % 6, game));
    }

    // 4. Slap (4 lá) - Ép người chơi kế tiếp thực hiện thêm lượt (1x, 2x, 3x)
    drawPile.addCard(SLAP_1X.createCard(0, game));
    drawPile.addCard(SLAP_2X.createCard(0, game));
    drawPile.addCard(SLAP_2X.createCard(1, game));
    drawPile.addCard(SLAP_3X.createCard(0, game));

    // 5. Steal a Card (4 lá) - Cướp ngẫu nhiên 1 lá từ tay đối thủ
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(STEAL_A_CARD.createCard(i, game));
    }
  }

  addPostDealCards(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 6. Exploding Kitten (2 lá) - Mèo nổ bổ sung, thêm sau khi chia bài
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(EXPLODING_KITTEN.createCard(i % 4, game));
    }
  }
}
