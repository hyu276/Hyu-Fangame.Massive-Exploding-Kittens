export interface IRecipeDefinition {
  slug: string;
  name: string;
  vietnameseName: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  cardCounts: Record<string, number>;
  bombFormula: (playerCount: number) => number;
  defusePerPlayer: number;
  extraDefusesInDeck: number;
  startingCardsPerPlayer: (playerCount: number) => number;
}

// Legacy digital fixtures. Only Sticky Fingers is reachable from new lobby setup;
// subtype Ingredients here have not been verified against the official recipe pages.
export const RECIPES: Record<string, IRecipeDefinition> = {
  sticky_fingers: {
    slug: 'sticky_fingers',
    name: 'Sticky Fingers',
    vietnameseName: 'Tay Nhanh Hơn Não (Sticky Fingers)',
    description: 'Chuyên cướp bài và đánh dấu! Có Streaking Kitten, I\'ll Take That, Mark và Feral Cat. Số bom bằng đúng số người chơi.',
    minPlayers: 2,
    maxPlayers: 5,
    cardCounts: {
      attack: 4,
      skip: 4,
      ill_take_that: 4,
      mark: 4,
      streaking_kitten: 1,
      cat_card: 16,
      feral_cat: 6,
    },
    bombFormula: (p: number) => p, // P Exploding Kittens (vì có Streaking Kitten)
    defusePerPlayer: 1,
    extraDefusesInDeck: 1,
    startingCardsPerPlayer: (p: number) => (p === 5 ? 5 : 7),
  },
  danger_mode: {
    slug: 'danger_mode',
    name: 'Danger Mode',
    vietnameseName: 'Chế Độ Nguy Hiểm (Danger Mode)',
    description: 'Hàng loạt lá tấn công và xem tương lai tốc độ cao. Cực kỳ nghẹt thở và kịch tính.',
    minPlayers: 2,
    maxPlayers: 5,
    cardCounts: {
      attack: 4,
      targeted_attack: 3,
      skip: 4,
      super_skip: 2,
      see_the_future: 6,
      alter_the_future: 3,
      cat_card: 12,
    },
    bombFormula: (p: number) => p - 1,
    defusePerPlayer: 1,
    extraDefusesInDeck: 1,
    startingCardsPerPlayer: () => 7,
  },
  lightning_kittens: {
    slug: 'lightning_kittens',
    name: 'Lightning Kittens',
    vietnameseName: 'Mèo Chớp Nhoáng (Lightning Kittens)',
    description: 'Tốc độ cực nhanh không có lá phòng thủ thừa, trận đấu kết thúc chỉ trong chớp mắt.',
    minPlayers: 2,
    maxPlayers: 5,
    cardCounts: {
      attack: 4,
      personal_attack_3x: 2,
      skip: 4,
      super_skip: 2,
      draw_from_the_bottom: 3,
      cat_card: 8,
    },
    bombFormula: (p: number) => p - 1,
    defusePerPlayer: 1,
    extraDefusesInDeck: 0,
    startingCardsPerPlayer: () => 6,
  },
};

export const DEFAULT_RECIPE = 'sticky_fingers';

/** Names/links verified from the official recipe hub; ingredients are NOT verified. */
export const RECIPE_CATALOG = [
  ['attack_of_the_attacks', 'Attack of the Attacks', 'attack-of-the-attacks'],
  ['black_hole', 'Black Hole', 'black-hole'],
  ['danger_mode', 'Danger Mode', 'danger-mode'],
  ['classic_mode', 'Exploding Kittens: Classic Mode', 'exploding-kittens-classic-mode'],
  ['eye_for_an_eye', 'Eye for an Eye', 'eye-for-an-eye'],
  ['lightning_kittens', 'Lightning Kittens', 'lightning-kittens'],
  ['meowsochist', 'Meowsochist', 'meowsochist'],
  ['nope_sauce', 'Nope Sauce', 'nope-sauce'],
  ['power_play', 'Power Play', 'power-play'],
  ['sharing_is_caring', 'Sharing is Caring', 'sharing-is-caring'],
  ['sticky_fingers', 'Sticky Fingers', 'sticky-fingers'],
  ['the_purrrge', 'The Purrrge', 'the-purrrge'],
  ['mind_games', 'Mind Games', 'mind-games'],
  ['card_hoarders', 'Card Hoarders', 'card-hoarders'],
  ['cat_fight', 'Cat Fight', 'cat-fight'],
].map(([slug, name, urlSlug]) => ({ slug, name,
  sourceUrl: `https://www.explodingkittens.com/pages/recipes?name=${urlSlug}`,
  availability: slug === DEFAULT_RECIPE ? 'playtest' as const : 'locked' as const,
  verification: 'name_only' as const,
}));

export function getRecipeDefinition(slug: string = DEFAULT_RECIPE): IRecipeDefinition {
  return RECIPES[slug] || RECIPES[DEFAULT_RECIPE];
}
