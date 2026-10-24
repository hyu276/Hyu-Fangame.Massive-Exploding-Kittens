import {DeckType} from '../deck-type';
import {TheGame} from '../game';
import {
  ALTER_THE_FUTURE_5X,
  CATOMIC_BOMB,
  CURSE_OF_THE_CAT_BUTT,
  EXPLODING_KITTEN,
  GARBAGE_COLLECTION,
  MARK,
  SEE_THE_FUTURE_5X,
  STREAKING_KITTEN,
  SUPER_SKIP,
  SWAP_TOP_AND_BOTTOM,
} from '../../registries/card-registry';

export class StreakingKittensDeck extends DeckType {
  constructor() {
    super(
      'streaking_kittens',
      'Gói Mở Rộng: Streaking Kittens (15 lá)',
      'Bao gồm 15 lá: 1 Streaking Kitten, 1 Exploding Kitten, 1 Super Skip, 1 See the Future (5x), 1 Alter the Future (5x), 3 Swap Top and Bottom, 1 Garbage Collection, 1 Catomic Bomb, 3 Mark, 2 Curse of the Cat Butt.',
      false,
      '⚡',
      '/assets/decks/streaking_kittens.png'
    );
  }

  startingHandSize(): number {
    return 0; // Bài chia ban đầu lấy từ Bộ Tiêu Chuẩn
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 1 lá Streaking Kitten
    drawPile.addCard(STREAKING_KITTEN.createCard(0, game));

    // 1 lá Super Skip
    drawPile.addCard(SUPER_SKIP.createCard(0, game));

    // 1 lá See the Future (5x)
    drawPile.addCard(SEE_THE_FUTURE_5X.createCard(0, game));

    // 1 lá Alter the Future (5x)
    drawPile.addCard(ALTER_THE_FUTURE_5X.createCard(0, game));

    // 3 lá Swap Top and Bottom
    for (let i = 0; i < 3; i++) {
      drawPile.addCard(SWAP_TOP_AND_BOTTOM.createCard(i, game));
    }

    // 1 lá Garbage Collection
    drawPile.addCard(GARBAGE_COLLECTION.createCard(0, game));

    // 1 lá Catomic Bomb
    drawPile.addCard(CATOMIC_BOMB.createCard(0, game));

    // 3 lá Mark
    for (let i = 0; i < 3; i++) {
      drawPile.addCard(MARK.createCard(i, game));
    }

    // 2 lá Curse of the Cat Butt
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(CURSE_OF_THE_CAT_BUTT.createCard(i, game));
    }
  }

  addPostDealCards(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // Bổ sung thêm 1 lá Exploding Kitten sau khi đã chia bài xong
    // (nhằm cân bằng với việc 1 người chơi có thể giữ Exploding Kitten trên tay)
    drawPile.addCard(EXPLODING_KITTEN.createCard(0, game));
  }
}
