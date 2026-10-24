import {DeckType} from '../deck-type';
import type {ICard} from '../../models';
import {TheGame} from '../game';

import {
  ATTACK,
  CAT_CARD, DEFUSE,
  EXPLODING_KITTEN,
  FAVOR, NOPE,
  SEE_THE_FUTURE,
  SHUFFLE,
  SKIP,
  ZOMBIE_KITTEN,
} from '../../registries/card-registry';

const STARTING_HAND_SIZE = 7;
const TOTAL_DEFUSE_CARDS = 6;
const MAX_DECK_DEFUSE_CARDS = 2;

export class OriginalDeck extends DeckType {
  constructor() {
    super(
      'original',
      'Bộ Tiêu Chuẩn (Original)',
      'Bộ bài tiêu chuẩn đầy đủ các lá: Mèo Nổ, Gỡ Bom, Tấn Công, Bỏ Lượt, Xin Xỏ, Xáo Bài, Nhìn Trước Tương Lai, Chặn (Nope) và Thẻ Mèo Thường.',
      true,
      '🃏'
    );
  }

  startingHandSize(): number {
    return STARTING_HAND_SIZE;
  }

  startingHandForcedCards(game: TheGame, index: number): ICard[] {
    const isZombie = game.selectedDecks?.includes('zombie_kittens');
    if (isZombie) {
      return [ZOMBIE_KITTEN.createCard(index, game)];
    }
    return [DEFUSE.createCard(index, game)];
  }

  buildBaseDeck(game: TheGame): void {
    const drawPile = game.piles.drawPile;

    for (let i = 0; i < 4; i++) {
      drawPile.addCard(ATTACK.createCard(i, game));
      drawPile.addCard(SKIP.createCard(i, game));
      drawPile.addCard(SHUFFLE.createCard(i, game));
      drawPile.addCard(FAVOR.createCard(i, game));
      drawPile.addCard(NOPE.createCard(i, game));
      for (let j = 0; j < 5; j++) {
        drawPile.addCard(CAT_CARD.createCard(j, game));
      }
    }

    for (let i = 0; i < 5; i++) {
      drawPile.addCard(SEE_THE_FUTURE.createCard(i, game));
    }
  }

  addPostDealCards(game: TheGame): void {
    const playerCount = game.players.playerCount;
    const isZombie = game.selectedDecks?.includes('zombie_kittens');
    const drawPile = game.piles.drawPile;

    if (!isZombie) {
      const remaining = Math.min(TOTAL_DEFUSE_CARDS - playerCount, MAX_DECK_DEFUSE_CARDS);
      for (let i = 0; i < remaining; i++) {
        const cardIndex = (playerCount + i) % TOTAL_DEFUSE_CARDS;
        drawPile.addCard(DEFUSE.createCard(cardIndex, game));
      }
    }

    // add amount of players minus one exploding kitten
    for (let i = 0; i < playerCount - 1; i++) {
      // after index 3 restart at 0, since there are only 4 unique exploding kitten cards
      const cardIndex = i % 4;
      drawPile.addCard(EXPLODING_KITTEN.createCard(cardIndex, game));
    }
  }
}
