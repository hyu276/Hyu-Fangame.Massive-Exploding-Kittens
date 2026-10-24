import { TheGame } from '../entities/game';
import {
  EXPLODING_KITTEN,
  DEFUSE,
  ZOMBIE_KITTEN,
  ATTACK,
  ATTACK_OF_THE_DEAD,
  NOPE,
  SKIP,
  SUPER_SKIP,
  SHUFFLE,
  SEE_THE_FUTURE,
  SHUFFLE_NOW,
  FEED_THE_DEAD,
  DIG_DEEPER,
  CLAIRVOYANCE,
  CLONE,
  GRAVE_ROBBER,
  FAVOR,
  CAT_CARD,
  FERAL_CAT,
  STREAKING_KITTEN,
  ILL_TAKE_THAT,
  MARK,
  TARGETED_ATTACK,
  PERSONAL_ATTACK_3X,
  DRAW_FROM_THE_BOTTOM,
  ALTER_THE_FUTURE,
  ALTER_THE_FUTURE_3X_NOW,
  REVERSE_ATTACK,
  ARMAGEDDON,
  RAISING_HECK,
  REVEAL_THE_FUTURE_3X,
  BOOBY_TRAP_KITTEN,
  SHARED_SUFFERING,
  REVEAL_AND_STEAL,
  BAD_DECISION,
  PEEK,
  AMATEUR_ARCHEOLOGY,
  CREEPY_PEEKY,
  HIP_CAT,
  HIP_BAT,
  PLUS_PLUS,
  ROBIN_HOOD,
  BATTLE_HAMSTER,
  THE_TWINS,
  EXPLODING_MINION,
  MINION_DEFUSE,
  MINION_CHARACTER_CARD,
} from '../registries/card-registry';
import { getRecipeDefinition, DEFAULT_RECIPE } from '../constants/recipes';

/**
 * Builds the 61-card standalone Zombie Kittens deck for 4-5 players according to official rules.
 */
export function setupZombieStandaloneDeck(game: TheGame): void {
  const allPlayers = game.players.allPlayers;
  const playerCount = allPlayers.length;

  if (playerCount < 4 || playerCount > 5) {
    throw new Error(`Zombie Kittens Standalone hiện hỗ trợ bàn 4-5 người chơi (nhận được: ${playerCount})`);
  }

  // 1. Tách Zombie Kittens: chia đúng 1 lá Zombie Kitten làm thẻ cứu mạng khởi đầu cho mỗi người chơi
  for (let i = 0; i < playerCount; i++) {
    allPlayers[i].addCard(ZOMBIE_KITTEN.createCard(i, game));
  }

  const drawPile = game.piles.drawPile;

  // 2. Với bàn 4 người: trộn lá Zombie Kitten thứ 5 trở lại vào cọc bài rút
  if (playerCount === 4) {
    drawPile.addCard(ZOMBIE_KITTEN.createCard(4, game));
  }

  // 3. Toàn bộ 52 lá thường của hộp Zombie Kittens Standalone
  for (let i = 0; i < 2; i++) drawPile.addCard(ATTACK.createCard(i, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(ATTACK_OF_THE_DEAD.createCard(i, game));
  for (let i = 0; i < 5; i++) drawPile.addCard(NOPE.createCard(i, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(SKIP.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(SUPER_SKIP.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(SEE_THE_FUTURE.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(SHUFFLE_NOW.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(FEED_THE_DEAD.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(DIG_DEEPER.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(CLAIRVOYANCE.createCard(i, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(CLONE.createCard(i, game));
  drawPile.addCard(GRAVE_ROBBER.createCard(0, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(FAVOR.createCard(i, game));
  for (let kind = 0; kind < 4; kind++) {
    for (let c = 0; c < 4; c++) {
      drawPile.addCard(CAT_CARD.createCard(kind, game));
    }
  }

  drawPile.shuffle();

  // 4. Chia 7 lá bài thường cho mỗi người chơi (tổng 8 lá/người)
  for (let r = 0; r < 7; r++) {
    for (let p = 0; p < playerCount; p++) {
      const drawn = drawPile.drawCard();
      if (drawn) allPlayers[p].addCard(drawn);
    }
  }

  // 5. Thêm P - 1 lá Exploding Kittens vào cọc bài rút
  const explodingKittensCount = playerCount - 1;
  for (let i = 0; i < explodingKittensCount; i++) {
    drawPile.addCard(EXPLODING_KITTEN.createCard(i, game));
  }

  drawPile.shuffle();
}

/**
 * Cấu hình thiết lập chính thức của Zombie Apocalypse (ghép hộp Original + Zombie) cho 2 đến 9 người chơi.
 */
export const ZOMBIE_APOCALYPSE_SETUP_TABLE: Record<number, {
  zombieCount: number;
  defuseCount: number;
  drawPileBeforeBombs: number;
  bombCount: number;
}> = {
  2: { zombieCount: 2, defuseCount: 0, drawPileBeforeBombs: 15, bombCount: 1 },
  3: { zombieCount: 3, defuseCount: 0, drawPileBeforeBombs: 20, bombCount: 2 },
  4: { zombieCount: 4, defuseCount: 0, drawPileBeforeBombs: 25, bombCount: 3 },
  5: { zombieCount: 5, defuseCount: 0, drawPileBeforeBombs: 30, bombCount: 4 },
  6: { zombieCount: 5, defuseCount: 1, drawPileBeforeBombs: 35, bombCount: 5 },
  7: { zombieCount: 5, defuseCount: 2, drawPileBeforeBombs: 35, bombCount: 6 },
  8: { zombieCount: 5, defuseCount: 3, drawPileBeforeBombs: 35, bombCount: 7 },
  9: { zombieCount: 5, defuseCount: 4, drawPileBeforeBombs: 35, bombCount: 8 },
};

/**
 * Thiết lập ván đấu Zombie Apocalypse (Mode 7).
 */
export function setupZombieApocalypseDeck(game: TheGame): void {
  const allPlayers = game.players.allPlayers;
  const playerCount = allPlayers.length;

  const table = ZOMBIE_APOCALYPSE_SETUP_TABLE[playerCount];
  if (!table) {
    throw new Error(`Chế độ Zombie Apocalypse hỗ trợ bàn từ 2 đến 9 người chơi (nhận được: ${playerCount})`);
  }

  const lifeSavers: ReturnType<typeof ZOMBIE_KITTEN.createCard>[] = [];
  for (let i = 0; i < table.zombieCount; i++) lifeSavers.push(ZOMBIE_KITTEN.createCard(i, game));
  for (let i = 0; i < table.defuseCount; i++) lifeSavers.push(DEFUSE.createCard(i, game));

  for (let i = lifeSavers.length - 1; i > 0; i--) {
    const j = Math.floor(game.random.Number() * (i + 1));
    [lifeSavers[i], lifeSavers[j]] = [lifeSavers[j], lifeSavers[i]];
  }

  for (let i = 0; i < playerCount; i++) {
    allPlayers[i].addCard(lifeSavers[i]);
  }

  const drawPile = game.piles.drawPile;

  // Lá thường từ Original (bỏ Cat Cards)
  for (let i = 0; i < 4; i++) drawPile.addCard(ATTACK.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(FAVOR.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(NOPE.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(SHUFFLE.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(SKIP.createCard(i, game));
  for (let i = 0; i < 5; i++) drawPile.addCard(SEE_THE_FUTURE.createCard(i, game));

  // Lá thường từ Zombie
  for (let i = 4; i < 6; i++) drawPile.addCard(ATTACK.createCard(i, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(ATTACK_OF_THE_DEAD.createCard(i, game));
  for (let i = 4; i < 9; i++) drawPile.addCard(NOPE.createCard(i, game));
  for (let i = 4; i < 7; i++) drawPile.addCard(SKIP.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(SUPER_SKIP.createCard(i, game));
  for (let i = 5; i < 9; i++) drawPile.addCard(SEE_THE_FUTURE.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(SHUFFLE_NOW.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(FEED_THE_DEAD.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(DIG_DEEPER.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(CLAIRVOYANCE.createCard(i, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(CLONE.createCard(i, game));
  drawPile.addCard(GRAVE_ROBBER.createCard(0, game));
  for (let i = 4; i < 7; i++) drawPile.addCard(FAVOR.createCard(i, game));
  for (let kind = 0; kind < 4; kind++) {
    for (let c = 0; c < 4; c++) {
      drawPile.addCard(CAT_CARD.createCard(kind, game));
    }
  }

  drawPile.shuffle();

  for (let r = 0; r < 7; r++) {
    for (let p = 0; p < playerCount; p++) {
      const drawn = drawPile.drawCard();
      if (drawn) allPlayers[p].addCard(drawn);
    }
  }

  while (drawPile.size > table.drawPileBeforeBombs) {
    drawPile.drawCard();
  }

  for (let i = 0; i < table.bombCount; i++) {
    drawPile.addCard(EXPLODING_KITTEN.createCard(i, game));
  }

  drawPile.shuffle();
}

/**
 * Mode 6: Zombie 2 Người với Carl (zombie_carl)
 * - 2 người chơi thật (0 và 1) + Carl (system actor).
 * - Dùng nhóm 24 lá có dấu chân: chia mỗi người thật 1 Zombie Kitten + 7 lá thường (tổng 16 lá phát cho 2 người).
 * - Carl có 1 Zombie Kitten không dấu đặt ngửa (trong G.carl), không có bài trên tay.
 * - 8 lá dấu chân còn lại + đúng 2 Exploding Kittens [CX] đưa vào cọc bài rút (tổng 10 lá).
 */
export function setupZombieCarlDeck(game: TheGame): void {
  const allPlayers = game.players.allPlayers;
  if (allPlayers.length !== 2) {
    throw new Error(`Chế độ Zombie với Carl yêu cầu đúng 2 người chơi (nhận được: ${allPlayers.length})`);
  }

  // Khởi tạo Carl trong gameState
  game.gameState.carl = {
    isAlive: true,
    hasZombieKitten: true,
    bombsHeld: 0,
    lastAction: null,
  };

  // 1. Chia đúng 1 lá Zombie Kitten cho mỗi người chơi thật
  allPlayers[0].addCard(ZOMBIE_KITTEN.createCard(0, game));
  allPlayers[1].addCard(ZOMBIE_KITTEN.createCard(1, game));

  // 2. Nhóm 22 lá bài thường có dấu chân cho 2 người
  const pawPrintPool = [
    ATTACK.createCard(0, game),
    ATTACK_OF_THE_DEAD.createCard(0, game),
    NOPE.createCard(0, game),
    NOPE.createCard(1, game),
    SKIP.createCard(0, game),
    SUPER_SKIP.createCard(0, game),
    SEE_THE_FUTURE.createCard(0, game),
    SEE_THE_FUTURE.createCard(1, game),
    SHUFFLE_NOW.createCard(0, game),
    FEED_THE_DEAD.createCard(0, game),
    DIG_DEEPER.createCard(0, game),
    DIG_DEEPER.createCard(1, game),
    CLAIRVOYANCE.createCard(0, game),
    CLONE.createCard(0, game),
    GRAVE_ROBBER.createCard(0, game),
    FAVOR.createCard(0, game),
    CAT_CARD.createCard(0, game),
    CAT_CARD.createCard(0, game),
    CAT_CARD.createCard(1, game),
    CAT_CARD.createCard(1, game),
    CAT_CARD.createCard(2, game),
    CAT_CARD.createCard(2, game),
  ];

  // Xáo trộn nhóm bài có dấu chân
  for (let i = pawPrintPool.length - 1; i > 0; i--) {
    const j = Math.floor(game.random.Number() * (i + 1));
    [pawPrintPool[i], pawPrintPool[j]] = [pawPrintPool[j], pawPrintPool[i]];
  }

  // Phát 7 lá cho người chơi 0 và 7 lá cho người chơi 1 (tổng 14 lá thường)
  for (let i = 0; i < 7; i++) allPlayers[0].addCard(pawPrintPool[i]);
  for (let i = 7; i < 14; i++) allPlayers[1].addCard(pawPrintPool[i]);

  // 8 lá bài thường còn lại đưa vào cọc bài rút
  const drawPile = game.piles.drawPile;
  for (let i = 14; i < pawPrintPool.length; i++) {
    drawPile.addCard(pawPrintPool[i]);
  }

  // Thêm 2 Exploding Kittens [CX] vào cọc rút
  drawPile.addCard(EXPLODING_KITTEN.createCard(0, game));
  drawPile.addCard(EXPLODING_KITTEN.createCard(1, game));

  drawPile.shuffle();
}

/**
 * Mode 8: Recipes for Disaster (recipes_for_disaster)
 * Xây dựng cọc bài dựa trên công thức (recipe) đã chọn (mặc định: Sticky Fingers).
 */
export function setupRecipesForDisasterDeck(game: TheGame, recipeSlug: string = DEFAULT_RECIPE): void {
  const recipe = getRecipeDefinition(recipeSlug);
  const allPlayers = game.players.allPlayers;
  const playerCount = allPlayers.length;

  if (playerCount < recipe.minPlayers || playerCount > recipe.maxPlayers) {
    throw new Error(`Công thức ${recipe.name} yêu cầu từ ${recipe.minPlayers} đến ${recipe.maxPlayers} người chơi (nhận được: ${playerCount})`);
  }

  game.gameState.recipeSlug = recipe.slug;

  // 1. Phát Defuse cho mỗi người chơi
  for (let i = 0; i < playerCount; i++) {
    allPlayers[i].addCard(DEFUSE.createCard(i, game));
  }

  // 2. Tập hợp bài theo recipe.cardCounts
  const pool: ReturnType<typeof ATTACK.createCard>[] = [];
  const counts = recipe.cardCounts;

  if (counts.attack) for (let i = 0; i < counts.attack; i++) pool.push(ATTACK.createCard(i, game));
  if (counts.skip) for (let i = 0; i < counts.skip; i++) pool.push(SKIP.createCard(i, game));
  if (counts.super_skip) for (let i = 0; i < counts.super_skip; i++) pool.push(SUPER_SKIP.createCard(i, game));
  if (counts.targeted_attack) for (let i = 0; i < counts.targeted_attack; i++) pool.push(TARGETED_ATTACK.createCard(i, game));
  if (counts.personal_attack_3x) for (let i = 0; i < counts.personal_attack_3x; i++) pool.push(PERSONAL_ATTACK_3X.createCard(i, game));
  if (counts.see_the_future) for (let i = 0; i < counts.see_the_future; i++) pool.push(SEE_THE_FUTURE.createCard(i, game));
  if (counts.alter_the_future) for (let i = 0; i < counts.alter_the_future; i++) pool.push(ALTER_THE_FUTURE.createCard(i, game));
  if (counts.draw_from_the_bottom) for (let i = 0; i < counts.draw_from_the_bottom; i++) pool.push(DRAW_FROM_THE_BOTTOM.createCard(i, game));
  if (counts.ill_take_that) for (let i = 0; i < counts.ill_take_that; i++) pool.push(ILL_TAKE_THAT.createCard(i, game));
  if (counts.mark) for (let i = 0; i < counts.mark; i++) pool.push(MARK.createCard(i, game));
  if (counts.streaking_kitten) for (let i = 0; i < counts.streaking_kitten; i++) pool.push(STREAKING_KITTEN.createCard(i, game));
  if (counts.feral_cat) for (let i = 0; i < counts.feral_cat; i++) pool.push(FERAL_CAT.createCard(i, game));
  if (counts.cat_card) {
    const kinds = Math.min(4, Math.ceil(counts.cat_card / 4));
    let added = 0;
    for (let k = 0; k < kinds && added < counts.cat_card; k++) {
      for (let c = 0; c < 4 && added < counts.cat_card; c++) {
        pool.push(CAT_CARD.createCard(k, game));
        added++;
      }
    }
  }

  // Xáo trộn pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(game.random.Number() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 3. Chia bài khởi đầu theo số lượng quy định của recipe
  const cardsPerPlayer = recipe.startingCardsPerPlayer(playerCount);
  let poolIndex = 0;
  for (let r = 0; r < cardsPerPlayer; r++) {
    for (let p = 0; p < playerCount; p++) {
      if (poolIndex < pool.length) {
        allPlayers[p].addCard(pool[poolIndex++]);
      }
    }
  }

  // 4. Đưa bài còn lại vào cọc bài rút
  const drawPile = game.piles.drawPile;
  while (poolIndex < pool.length) {
    drawPile.addCard(pool[poolIndex++]);
  }

  // 5. Thêm Defuse dư vào cọc rút nếu có
  for (let i = 0; i < recipe.extraDefusesInDeck; i++) {
    drawPile.addCard(DEFUSE.createCard(playerCount + i, game));
  }

  // 6. Thêm bom theo công thức của recipe
  const bombCount = recipe.bombFormula(playerCount);
  for (let i = 0; i < bombCount; i++) {
    drawPile.addCard(EXPLODING_KITTEN.createCard(i, game));
  }

  drawPile.shuffle();
}

/**
 * Mode 9: Good vs Evil (good_vs_evil)
 * Standalone 53 lá + Godcat + Devilcat (55 lá).
 */
export function setupGoodVsEvilDeck(game: TheGame): void {
  const allPlayers = game.players.allPlayers;
  const playerCount = allPlayers.length;

  if (playerCount < 2 || playerCount > 5) {
    throw new Error(`Good vs Evil hỗ trợ từ 2 đến 5 người chơi (nhận được: ${playerCount})`);
  }

  // Đặt Godcat và Devilcat lên playmat
  game.gameState.goodVsEvil = {
    godcatInPlaymat: true,
    devilcatInPlaymat: true,
    godcatHolderId: null,
  };

  // Chia 1 Defuse cho mỗi người chơi
  for (let i = 0; i < playerCount; i++) {
    allPlayers[i].addCard(DEFUSE.createCard(i, game));
  }

  const drawPile = game.piles.drawPile;

  // 2 Defuse dư vào cọc rút (nếu 5 người thì chỉ 1 Defuse dư)
  const extraDefuses = playerCount === 5 ? 1 : 2;
  for (let i = 0; i < extraDefuses; i++) {
    drawPile.addCard(DEFUSE.createCard(playerCount + i, game));
  }

  // Các lá của Good vs Evil (53 lá trừ 6 Defuse = 47 lá không bom)
  for (let i = 0; i < 3; i++) drawPile.addCard(ARMAGEDDON.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(ATTACK.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(TARGETED_ATTACK.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(FAVOR.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(RAISING_HECK.createCard(i, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(REVEAL_THE_FUTURE_3X.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(SHUFFLE.createCard(i, game));
  for (let i = 0; i < 5; i++) drawPile.addCard(NOPE.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(FERAL_CAT.createCard(i, game));
  for (let kind = 0; kind < 4; kind++) {
    for (let c = 0; c < 4; c++) {
      drawPile.addCard(CAT_CARD.createCard(kind, game));
    }
  }

  drawPile.shuffle();

  // Chia 7 lá thường cho mỗi người chơi
  for (let r = 0; r < 7; r++) {
    for (let p = 0; p < playerCount; p++) {
      const drawn = drawPile.drawCard();
      if (drawn) allPlayers[p].addCard(drawn);
    }
  }

  // Thêm P - 1 Exploding Kittens
  const bombCount = playerCount - 1;
  for (let i = 0; i < bombCount; i++) {
    drawPile.addCard(EXPLODING_KITTEN.createCard(i, game));
  }

  drawPile.shuffle();
}

/**
 * Mode 10: Rage Mode (rage_mode)
 * Standalone 65 lá + tượng Rage Cat.
 */
export function setupRageModeDeck(game: TheGame): void {
  const allPlayers = game.players.allPlayers;
  const playerCount = allPlayers.length;

  if (playerCount < 2 || playerCount > 5) {
    throw new Error(`Rage Mode hỗ trợ từ 2 đến 5 người chơi (nhận được: ${playerCount})`);
  }

  // Tượng Rage Cat bắt đầu trước người bên phải người đi đầu theo playOrder
  // thực tế (playOrder đã được xáo bởi boardgame.io, không nhất thiết là ghế 0).
  const playOrder = game.turnManager.playOrder;
  const initialHolderId = playOrder[playOrder.length - 1] ?? String(playerCount - 1);
  game.gameState.rageMode = {
    rageCatHolderId: initialHolderId,
    rageCatUsedThisTurn: false,
    rageCatInitialized: false,
  };

  for (let i = 0; i < playerCount; i++) {
    allPlayers[i].addCard(DEFUSE.createCard(i, game));
  }

  const drawPile = game.piles.drawPile;

  // 6 Defuse tổng cộng, số dư đưa vào cọc rút (2 người thì 2 dư)
  const extraDefuses = playerCount === 2 ? 2 : (6 - playerCount);
  for (let i = 0; i < extraDefuses; i++) {
    drawPile.addCard(DEFUSE.createCard(playerCount + i, game));
  }

  for (let i = 0; i < 4; i++) drawPile.addCard(ALTER_THE_FUTURE_3X_NOW.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(SHARED_SUFFERING.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(REVEAL_AND_STEAL.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(BAD_DECISION.createCard(i, game));
  for (let i = 0; i < 6; i++) drawPile.addCard(NOPE.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(BOOBY_TRAP_KITTEN.createCard(i, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(SHUFFLE.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(ATTACK.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(REVERSE_ATTACK.createCard(i, game));
  for (let kind = 0; kind < 4; kind++) {
    for (let c = 0; c < 5; c++) {
      drawPile.addCard(CAT_CARD.createCard(kind, game));
    }
  }

  drawPile.shuffle();

  for (let r = 0; r < 7; r++) {
    for (let p = 0; p < playerCount; p++) {
      const drawn = drawPile.drawCard();
      if (drawn) allPlayers[p].addCard(drawn);
    }
  }

  // 2 người: bỏ 1/3 bài còn lại trước khi thêm bom
  if (playerCount === 2) {
    const discardCount = Math.floor(drawPile.size / 3);
    for (let i = 0; i < discardCount; i++) drawPile.drawCard();
  }

  const bombCount = playerCount - 1;
  for (let i = 0; i < bombCount; i++) {
    drawPile.addCard(EXPLODING_KITTEN.createCard(i, game));
  }

  drawPile.shuffle();
}

/**
 * Mode 11: Curse You! (curse_you) [SC]
 * Standalone 54 lá khởi đầu + cơ chế Charm & Curse vĩnh viễn.
 */
export function setupCurseYouDeck(game: TheGame): void {
  const allPlayers = game.players.allPlayers;
  const playerCount = allPlayers.length;

  if (playerCount < 2 || playerCount > 5) {
    throw new Error(`Curse You! hỗ trợ từ 2 đến 5 người chơi (nhận được: ${playerCount})`);
  }

  game.gameState.curseYou = {
    charms: {},
    curses: {},
    disguiseUsedThisTurn: false,
  };

  for (let i = 0; i < playerCount; i++) {
    allPlayers[i].addCard(DEFUSE.createCard(i, game));
  }

  const drawPile = game.piles.drawPile;

  const extraDefuses = playerCount === 2 ? 2 : (6 - playerCount);
  for (let i = 0; i < extraDefuses; i++) {
    drawPile.addCard(DEFUSE.createCard(playerCount + i, game));
  }

  for (let i = 0; i < 3; i++) drawPile.addCard(ATTACK.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(TARGETED_ATTACK.createCard(i, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(SKIP.createCard(i, game));
  for (let i = 0; i < 1; i++) drawPile.addCard(ALTER_THE_FUTURE.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(SHUFFLE.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(DRAW_FROM_THE_BOTTOM.createCard(i, game));
  for (let i = 0; i < 3; i++) drawPile.addCard(FAVOR.createCard(i, game));
  for (let i = 0; i < 2; i++) drawPile.addCard(PEEK.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(SEE_THE_FUTURE.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(NOPE.createCard(i, game));
  for (let kind = 0; kind < 4; kind++) {
    for (let c = 0; c < 4; c++) {
      drawPile.addCard(CAT_CARD.createCard(kind, game));
    }
  }

  drawPile.shuffle();

  for (let r = 0; r < 7; r++) {
    for (let p = 0; p < playerCount; p++) {
      const drawn = drawPile.drawCard();
      if (drawn) allPlayers[p].addCard(drawn);
    }
  }

  if (playerCount === 2) {
    const discardCount = Math.floor(drawPile.size / 3);
    for (let i = 0; i < discardCount; i++) drawPile.drawCard();
  }

  const bombCount = playerCount - 1;
  for (let i = 0; i < bombCount; i++) {
    drawPile.addCard(EXPLODING_KITTEN.createCard(i, game));
  }

  drawPile.shuffle();
}

/**
 * Mode 12: 10th Anniversary Legacy (anniversary_legacy) [SC]
 * Bộ tiêu chuẩn kết hợp cùng 8 thẻ bài di sản kỷ niệm 10 năm.
 */
export function setupAnniversaryLegacyDeck(game: TheGame): void {
  const allPlayers = game.players.allPlayers;
  const playerCount = allPlayers.length;

  if (playerCount < 2 || playerCount > 5) {
    throw new Error(`10th Anniversary Legacy hỗ trợ từ 2 đến 5 người chơi (nhận được: ${playerCount})`);
  }

  game.gameState.anniversary = {
    plusPlusActive: false,
  };

  for (let i = 0; i < playerCount; i++) {
    allPlayers[i].addCard(DEFUSE.createCard(i, game));
  }

  const drawPile = game.piles.drawPile;

  // Lá thường tiêu chuẩn
  for (let i = 0; i < 4; i++) drawPile.addCard(ATTACK.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(FAVOR.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(NOPE.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(SHUFFLE.createCard(i, game));
  for (let i = 0; i < 4; i++) drawPile.addCard(SKIP.createCard(i, game));
  for (let i = 0; i < 5; i++) drawPile.addCard(SEE_THE_FUTURE.createCard(i, game));
  for (let kind = 0; kind < 4; kind++) {
    for (let c = 0; c < 4; c++) {
      drawPile.addCard(CAT_CARD.createCard(kind, game));
    }
  }

  // 8 thẻ bonus Anniversary
  drawPile.addCard(AMATEUR_ARCHEOLOGY.createCard(0, game));
  drawPile.addCard(CREEPY_PEEKY.createCard(0, game));
  drawPile.addCard(HIP_CAT.createCard(0, game));
  drawPile.addCard(HIP_BAT.createCard(0, game));
  drawPile.addCard(PLUS_PLUS.createCard(0, game));
  drawPile.addCard(ROBIN_HOOD.createCard(0, game));
  drawPile.addCard(BATTLE_HAMSTER.createCard(0, game));
  drawPile.addCard(THE_TWINS.createCard(0, game));

  drawPile.shuffle();

  for (let r = 0; r < 7; r++) {
    for (let p = 0; p < playerCount; p++) {
      const drawn = drawPile.drawCard();
      if (drawn) allPlayers[p].addCard(drawn);
    }
  }

  // Chỉ thêm tối đa hai Defuse dư; bàn 5 người chỉ còn một lá.
  const extraDefuses = Math.min(2, 6 - playerCount);
  for (let i = 0; i < extraDefuses; i++) {
    drawPile.addCard(DEFUSE.createCard(playerCount + i, game));
  }

  const bombCount = playerCount - 1;
  for (let i = 0; i < bombCount; i++) {
    drawPile.addCard(EXPLODING_KITTEN.createCard(i, game));
  }

  drawPile.shuffle();
}

/**
 * Mode 13: Exploding Minions (exploding_minions)
 * Standalone 72 lá Minions độc lập.
 */
export function setupExplodingMinionsDeck(game: TheGame): void {
  const allPlayers = game.players.allPlayers;
  const playerCount = allPlayers.length;

  if (playerCount < 2 || playerCount > 5) {
    throw new Error(`Exploding Minions hỗ trợ từ 2 đến 5 người chơi (nhận được: ${playerCount})`);
  }

  // Bộ 72 lá được chia thành 31 lá có dấu Gru Tech và 37 lá không dấu.
  // Các index đầu của từng loại đại diện nhóm có dấu; phần còn lại là nhóm không dấu.
  // 2P chỉ dùng nhóm có dấu, 3P chỉ dùng nhóm không dấu, 4-5P dùng cả hai.
  const markedCounts = {
    defuse: 3,
    attack: 2,
    nope: 3,
    seeFuture: 3,
    skip: 3,
    shuffle: 2,
    drawBottom: 2,
    clone: 1,
    characterPerKind: 4,
  };
  const totalCounts = {
    defuse: 7,
    attack: 5,
    nope: 7,
    seeFuture: 7,
    skip: 6,
    shuffle: 4,
    drawBottom: 5,
    clone: 3,
    characterPerKind: 8,
  };
  const useMarkedOnly = playerCount === 2;
  const useUnmarkedOnly = playerCount === 3;
  const countFor = (key: keyof typeof totalCounts) => useMarkedOnly
    ? markedCounts[key]
    : useUnmarkedOnly
      ? totalCounts[key] - markedCounts[key]
      : totalCounts[key];
  const startFor = (key: keyof typeof totalCounts) => useUnmarkedOnly ? markedCounts[key] : 0;

  const defuseCount = countFor('defuse');
  const defuseStart = startFor('defuse');
  for (let i = 0; i < playerCount; i++) {
    allPlayers[i].addCard(MINION_DEFUSE.createCard(defuseStart + i, game));
  }

  const drawPile = game.piles.drawPile;

  // Trộn các Defuse còn lại thuộc đúng nhóm setup vào cọc rút.
  const extraDefuses = defuseCount - playerCount;
  for (let i = 0; i < extraDefuses; i++) {
    drawPile.addCard(MINION_DEFUSE.createCard(defuseStart + playerCount + i, game));
  }

  for (let i = 0; i < countFor('attack'); i++) drawPile.addCard(ATTACK.createCard(startFor('attack') + i, game));
  for (let i = 0; i < countFor('nope'); i++) drawPile.addCard(NOPE.createCard(startFor('nope') + i, game));
  for (let i = 0; i < countFor('seeFuture'); i++) drawPile.addCard(SEE_THE_FUTURE.createCard(startFor('seeFuture') + i, game));
  for (let i = 0; i < countFor('skip'); i++) drawPile.addCard(SKIP.createCard(startFor('skip') + i, game));
  for (let i = 0; i < countFor('shuffle'); i++) drawPile.addCard(SHUFFLE.createCard(startFor('shuffle') + i, game));
  for (let i = 0; i < countFor('drawBottom'); i++) drawPile.addCard(DRAW_FROM_THE_BOTTOM.createCard(startFor('drawBottom') + i, game));
  for (let i = 0; i < countFor('clone'); i++) drawPile.addCard(CLONE.createCard(startFor('clone') + i, game));
  const characterCount = countFor('characterPerKind');
  const characterStart = startFor('characterPerKind');
  for (let kind = 0; kind < 3; kind++) {
    for (let c = 0; c < characterCount; c++) {
      // index keeps the three character families distinct while retaining their
      // marked/unmarked half inside each family.
      drawPile.addCard(MINION_CHARACTER_CARD.createCard(kind * 8 + characterStart + c, game));
    }
  }

  drawPile.shuffle();

  for (let r = 0; r < 7; r++) {
    for (let p = 0; p < playerCount; p++) {
      const drawn = drawPile.drawCard();
      if (drawn) allPlayers[p].addCard(drawn);
    }
  }

  const bombCount = playerCount - 1;
  for (let i = 0; i < bombCount; i++) {
    drawPile.addCard(EXPLODING_MINION.createCard(i, game));
  }

  drawPile.shuffle();
}
