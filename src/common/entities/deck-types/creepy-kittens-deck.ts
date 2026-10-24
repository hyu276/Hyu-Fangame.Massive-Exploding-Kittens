import {DeckType} from '../deck-type';
import {TheGame} from '../game';
import {
  LOOK_AT_THE_BOTTOM,
  DRAW_FROM_ANYWHERE,
  CHOOSE_YOUR_FATE,
  DRAW_FROM_THE_BOTTOM,
  SHUFFLE,
  FLIP_FOUR
} from '../../registries/card-registry';

export class CreepyKittensDeck extends DeckType {
  constructor() {
    super(
      'creepy_kittens',
      'Gói Mở Rộng: Creepy Kittens (11 lá)',
      'Gói mở rộng Creepy Kittens mang đến cơ chế đảo lật mặt bài ngửa/úp và tương tác đỉnh/đáy độc đáo: 2 Nhìn Đáy Bài, 1 Rút Tùy Ý, 1 Định Đoạt Số Phận, 2 Rút Từ Đáy, 1 Xáo Bài, 4 Lật 4 Lá.',
      false,
      '👻',
      '/assets/decks/creepy_kittens.png'
    );
  }

  startingHandSize(): number {
    return 0; // Bài chia ban đầu lấy từ Bộ Tiêu Chuẩn
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 2 Look at the Bottom (Nhìn Đáy Bài)
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(LOOK_AT_THE_BOTTOM.createCard(i, game));
    }

    // 1 Draw From Anywhere (Rút Tùy Ý)
    drawPile.addCard(DRAW_FROM_ANYWHERE.createCard(0, game));

    // 1 Choose Your Fate (Định Đoạt Số Phận)
    drawPile.addCard(CHOOSE_YOUR_FATE.createCard(0, game));

    // 2 Draw From the Bottom (Rút Từ Đáy)
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(DRAW_FROM_THE_BOTTOM.createCard(i, game));
    }

    // 1 Shuffle (Xáo Bài)
    drawPile.addCard(SHUFFLE.createCard(0, game));

    // 4 Flip Four (Lật 4 Lá)
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(FLIP_FOUR.createCard(i, game));
    }
  }
}
