import {DeckType} from '../deck-type';
import {TheGame} from '../game';
import {
  ALTER_THE_FUTURE_3X_NOW,
  BARKING_KITTEN,
  BURY,
  ILL_TAKE_THAT,
  PERSONAL_ATTACK_3X,
  POTLUCK,
  SHARE_THE_FUTURE_3X,
  SUPER_SKIP,
  TOWER_OF_POWER,
} from '../../registries/card-registry';

export class BarkingKittensDeck extends DeckType {
  constructor() {
    super(
      'barking_kittens',
      'Gói Mở Rộng: Barking Kittens (20 lá)',
      'Bao gồm 20 lá và Phụ kiện Vương miện Tower of Power: 2 Barking Kitten, 1 Tower of Power, 2 Alter the Future (3x, NOW), 2 Bury, 4 Personal Attack (3x), 2 Share the Future (3x), 4 I\'ll Take That, 1 Super Skip, 2 Potluck.',
      false,
      '🐶',
      '/assets/decks/barking_kittens.png'
    );
  }

  startingHandSize(): number {
    return 0; // Bài chia ban đầu lấy từ Bộ Tiêu Chuẩn
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 2 lá Barking Kitten
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(BARKING_KITTEN.createCard(i, game));
    }

    // 1 lá Tower of Power
    drawPile.addCard(TOWER_OF_POWER.createCard(0, game));

    // 2 lá Alter the Future (3x, NOW)
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(ALTER_THE_FUTURE_3X_NOW.createCard(i, game));
    }

    // 2 lá Bury
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(BURY.createCard(i, game));
    }

    // 4 lá Personal Attack (3x)
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(PERSONAL_ATTACK_3X.createCard(i, game));
    }

    // 2 lá Share the Future (3x)
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(SHARE_THE_FUTURE_3X.createCard(i, game));
    }

    // 4 lá I'll Take That
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(ILL_TAKE_THAT.createCard(i, game));
    }

    // 1 lá Super Skip
    drawPile.addCard(SUPER_SKIP.createCard(0, game));

    // 2 lá Potluck
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(POTLUCK.createCard(i, game));
    }
  }

  addPostDealCards(_game: TheGame): void {
    // Không thêm bài sau chia (bộ bài 20 lá đã được thêm đủ ở base deck)
  }
}
