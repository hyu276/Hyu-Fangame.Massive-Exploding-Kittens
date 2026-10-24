import {DeckType} from '../deck-type';
import {TheGame} from '../game';
import {
  SUPER_SKIP,
  ALTER_THE_FUTURE,
  REVERSE_ATTACK,
  BURIED_TREASURE,
  ILL_TAKE_IT_FROM_HERE
} from '../../registries/card-registry';

export class AggroKittensDeck extends DeckType {
  constructor() {
    super(
      'aggro_kittens',
      'Gói Mở Rộng: Aggro Kittens (11 lá)',
      'Gói mở rộng Aggro Kittens tập trung lối chơi tốc độ cao và phản đòn quyết liệt: 2 Super Skip, 3 Alter the Future (3x), 4 Reverse Attack (2x), 1 Buried Treasure, 1 I\'ll Take It From Here (NOW).',
      false,
      '🔥',
      '/assets/decks/aggro_kittens.png'
    );
  }

  startingHandSize(): number {
    return 0; // Bài chia ban đầu lấy từ Bộ Tiêu Chuẩn
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 2 Super Skip
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(SUPER_SKIP.createCard(i, game));
    }

    // 3 Alter the Future (3x)
    for (let i = 0; i < 3; i++) {
      drawPile.addCard(ALTER_THE_FUTURE.createCard(i, game));
    }

    // 4 Reverse Attack (2x)
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(REVERSE_ATTACK.createCard(i, game));
    }

    // 1 Buried Treasure
    drawPile.addCard(BURIED_TREASURE.createCard(0, game));

    // 1 I'll Take It From Here (NOW)
    drawPile.addCard(ILL_TAKE_IT_FROM_HERE.createCard(0, game));
  }
}
