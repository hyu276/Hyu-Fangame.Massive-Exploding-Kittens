import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {
  NAME_COPYCAT,
  NAME_NOPE,
  NAME_DEFUSE,
  NAME_DEFUSE_TIMEBOMB,
  NAME_ZOMBIE_KITTEN,
  NAME_EXPLODING_KITTEN,
  NAME_IMPLODING_KITTEN,
  NAME_TIMEBOMB_KITTEN,
  NAME_BARKING_KITTEN,
  NAME_STREAKING_KITTEN,
  NAME_CAT_CARD,
  NAME_FERAL_CAT,
  NAME_CLONE
} from '../../constants/cards';
import {cardTypeRegistry} from '../../registries/card-registry';

const INVALID_COPY_NAMES = new Set([
  NAME_COPYCAT,
  NAME_NOPE,
  NAME_DEFUSE,
  NAME_DEFUSE_TIMEBOMB,
  NAME_ZOMBIE_KITTEN,
  NAME_EXPLODING_KITTEN,
  NAME_IMPLODING_KITTEN,
  NAME_TIMEBOMB_KITTEN,
  NAME_BARKING_KITTEN,
  NAME_STREAKING_KITTEN,
  NAME_CAT_CARD,
  NAME_FERAL_CAT,
  NAME_CLONE,
]);

export function findLastActionCardName(game: TheGame): string | null {
  // Ưu tiên kiểm tra gameState.lastActionCardName
  if (game.gameState.lastActionCardName && !INVALID_COPY_NAMES.has(game.gameState.lastActionCardName)) {
    return game.gameState.lastActionCardName;
  }

  // Quét chồng bài bỏ từ trên xuống dưới
  const discardCards = game.piles.discardPile.allCards;
  for (let i = discardCards.length - 1; i >= 0; i--) {
    const name = discardCards[i].name;
    if (!INVALID_COPY_NAMES.has(name)) {
      return name;
    }
  }

  return null;
}

export class CopycatCard extends CardType {
  constructor(name: string = NAME_COPYCAT) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return findLastActionCardName(game) !== null;
  }

  onPlayed(game: TheGame, card: Card) {
    const cardNameToCopy = findLastActionCardName(game);
    if (!cardNameToCopy) return;

    const targetCardType = cardTypeRegistry.get(cardNameToCopy);
    if (targetCardType) {
      targetCardType.onPlayed(game, card);
    }
  }

  sortOrder(): number {
    return 37;
  }
}
