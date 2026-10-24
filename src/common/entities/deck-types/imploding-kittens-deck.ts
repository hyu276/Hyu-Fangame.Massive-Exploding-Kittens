import {DeckType} from '../deck-type';
import {TheGame} from '../game';
import {
  ALTER_THE_FUTURE,
  DRAW_FROM_THE_BOTTOM,
  FERAL_CAT,
  IMPLODING_KITTEN,
  REVERSE,
  TARGETED_ATTACK,
} from '../../registries/card-registry';

export class ImplodingKittensDeck extends DeckType {
  constructor() {
    super(
      'imploding_kittens',
      'Gói Mở Rộng: Imploding Kittens (20 lá)',
      'Bao gồm 20 lá bài mới: 1 Imploding Kitten, 4 Reverse, 4 Draw from the Bottom, 4 Alter the Future (3x), 4 Feral Cat và 3 Targeted Attack (2x).',
      false,
      '💥',
      '/assets/decks/imploding_kittens.png'
    );
  }

  startingHandSize(): number {
    return 0; // Bài phát ban đầu dùng từ Bộ Tiêu Chuẩn
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 4 lá Reverse
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(REVERSE.createCard(i, game));
    }

    // 4 lá Draw from the Bottom
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(DRAW_FROM_THE_BOTTOM.createCard(i, game));
    }

    // 4 lá Alter the Future (3x)
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(ALTER_THE_FUTURE.createCard(i, game));
    }

    // 4 lá Feral Cat
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(FERAL_CAT.createCard(i, game));
    }

    // 3 lá Targeted Attack (2x)
    for (let i = 0; i < 3; i++) {
      drawPile.addCard(TARGETED_ATTACK.createCard(i, game));
    }
  }

  addPostDealCards(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 1 lá Imploding Kitten được thêm vào sau khi đã chia bài xong
    drawPile.addCard(IMPLODING_KITTEN.createCard(0, game));
  }
}
