import {DeckType} from '../deck-type';
import {TheGame} from '../game';
import {
  ZOMBIE_KITTEN,
  CLONE,
  DIG_DEEPER,
  FEED_THE_DEAD,
  GRAVE_ROBBER,
  ATTACK_OF_THE_DEAD,
  SHUFFLE_NOW,
  CLAIRVOYANCE,
  SUPER_SKIP
} from '../../registries/card-registry';

const TOTAL_ZOMBIE_KITTEN_CARDS = 5;

export class ZombieKittensDeck extends DeckType {
  constructor() {
    super(
      'zombie_kittens',
      'Gói Mở Rộng: Zombie Kittens (22 lá)',
      'Gói mở rộng mang đến cơ chế Undead: Người chơi chết không bị loại khỏi ván đấu mà vẫn giữ bài trên tay và có thể đánh các thẻ bài NOW! Zombie Kitten thay thế Defuse và cho phép hồi sinh người chơi đã chết.',
      false,
      '🧟',
      '/assets/decks/zombie_kittens.png'
    );
  }

  startingHandSize(): number {
    return 0; // Bài chia ban đầu lấy từ Bộ Tiêu Chuẩn (kết hợp Zombie Kitten chia thay Defuse)
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    // 2 Clone
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(CLONE.createCard(i, game));
    }

    // 4 Dig Deeper
    for (let i = 0; i < 4; i++) {
      drawPile.addCard(DIG_DEEPER.createCard(i, game));
    }

    // 2 Feed the Dead
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(FEED_THE_DEAD.createCard(i, game));
    }

    // 1 Grave Robber
    drawPile.addCard(GRAVE_ROBBER.createCard(0, game));

    // 3 Attack of the Dead
    for (let i = 0; i < 3; i++) {
      drawPile.addCard(ATTACK_OF_THE_DEAD.createCard(i, game));
    }

    // 1 Shuffle (NOW)
    drawPile.addCard(SHUFFLE_NOW.createCard(0, game));

    // 2 Clairvoyance
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(CLAIRVOYANCE.createCard(i, game));
    }

    // 2 Super Skip
    for (let i = 0; i < 2; i++) {
      drawPile.addCard(SUPER_SKIP.createCard(i, game));
    }
  }

  addPostDealCards(game: TheGame): void {
    const playerCount = game.players.playerCount;
    // Số lá Zombie Kitten còn lại sau khi đã phát cho mỗi người chơi 1 lá ở starting hand
    const remaining = Math.max(0, TOTAL_ZOMBIE_KITTEN_CARDS - playerCount);
    const drawPile = game.piles.drawPile;

    for (let i = 0; i < remaining; i++) {
      const cardIndex = playerCount + i;
      drawPile.addCard(ZOMBIE_KITTEN.createCard(cardIndex, game));
    }
  }
}
