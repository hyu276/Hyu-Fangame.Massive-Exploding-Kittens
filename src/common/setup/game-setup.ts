import type {IGameState} from '../models';
import { deckRegistry } from '../registries/deck-registry';
import {
  GAME_MODE_NORMAL,
  GAME_MODE_QUICK_PLAY,
  GAME_MODE_TEAM_UP,
  GAME_MODE_CAT_BURGLAR,
  GAME_MODE_ZOMBIE_STANDALONE,
  GAME_MODE_ZOMBIE_CARL,
  GAME_MODE_ZOMBIE_APOCALYPSE,
  GAME_MODE_RECIPES_FOR_DISASTER,
  GAME_MODE_GOOD_VS_EVIL,
  GAME_MODE_RAGE_MODE,
  GAME_MODE_CURSE_YOU,
  GAME_MODE_ANNIVERSARY_LEGACY,
  GAME_MODE_EXPLODING_MINIONS,
  GAME_MODES,
  getGameModeDefinition
} from '../constants/game-modes';

export function normalizeDecks(value: unknown): string[] {
  if (!Array.isArray(value) || value.some(id => typeof id !== 'string' || !deckRegistry.get(id))) {
    throw new Error('Danh sách bộ bài không hợp lệ');
  }
  return Array.from(new Set(['original', ...value]));
}

export function validateSetupData(setupData: SetupData | undefined, numPlayers: number): string | undefined {
  if (!Number.isInteger(numPlayers) || numPlayers < 2 || numPlayers > 11) return 'Số người chơi phải từ 2 đến 11';
  if (setupData === undefined) return;
  if (!setupData || typeof setupData !== 'object' || Array.isArray(setupData)) return 'Thiết lập phòng không hợp lệ';
  if (setupData.matchName !== undefined && (typeof setupData.matchName !== 'string' || !setupData.matchName.trim() || setupData.matchName.length > 100)) return 'Tên phòng phải có từ 1 đến 100 ký tự';
  if (setupData.maxPlayers !== undefined && setupData.maxPlayers !== numPlayers) return 'Số ghế không khớp';
  for (const flag of [setupData.openCards, setupData.spectatorsSeeCards]) {
    if (flag !== undefined && typeof flag !== 'boolean') return 'Thiết lập xem bài không hợp lệ';
  }
  const gameMode = setupData.gameMode ?? GAME_MODE_NORMAL;
  if (setupData.recipeSlug !== undefined && gameMode !== GAME_MODE_RECIPES_FOR_DISASTER)
    return 'Recipe chỉ áp dụng cho chế độ Recipes for Disaster';
  if (!GAME_MODES.some(m => m.id === gameMode)) {
    return 'Chế độ chơi không hợp lệ';
  }
  const def = getGameModeDefinition(gameMode);

  if (setupData.selectedDecks !== undefined) {
    if (!Array.isArray(setupData.selectedDecks) || setupData.selectedDecks.some(id => typeof id !== 'string')) {
      return 'Danh sách bộ bài không hợp lệ';
    }
    if (def.allowsExpansionSelection) {
      try { normalizeDecks(setupData.selectedDecks); } catch { return 'Danh sách bộ bài không hợp lệ'; }
    } else {
      // Older clients send `original`; current clients send the standalone mode slug.
      // Both describe the same locked ruleset. Any actual expansion remains invalid.
      const allowedIds = new Set(['original', def.slug]);
      if (setupData.selectedDecks.some(id => !allowedIds.has(id))) {
        return `${def.vietnameseName} không cho phép chọn expansion`;
      }
    }
  }

  if (setupData.gameMode !== undefined) {
    if (!GAME_MODES.some(m => m.id === setupData.gameMode)) {
      return 'Chế độ chơi không hợp lệ';
    }
    if (def.availability === 'planned') {
      return `${def.vietnameseName} đang trong quá trình phát triển (planned)`;
    }
    if (setupData.gameMode === GAME_MODE_QUICK_PLAY) {
      if (numPlayers !== 2) return 'Chế độ Đấu Nhanh chỉ dành riêng cho 2 người chơi';
    }
    if (setupData.gameMode === GAME_MODE_CAT_BURGLAR) {
      if (numPlayers < 2 || numPlayers > 5) return 'Chế độ Mèo Đạo Tặc (Cat Burglar) dành cho 2 đến 5 người chơi';
    }
    if (setupData.gameMode === GAME_MODE_TEAM_UP) {
      if (numPlayers % 2 !== 0) return 'Chế độ Đấu Đội yêu cầu số người chơi là số chẵn (2, 4, 6, 8)';
      if (numPlayers > 8) return 'Chế độ Đấu Đội hỗ trợ tối đa 8 người chơi';
    }
    if (setupData.gameMode === GAME_MODE_ZOMBIE_STANDALONE) {
      if (numPlayers < 4 || numPlayers > 5) return 'Chế độ Zombie Kittens Độc Lập hiện hỗ trợ bàn 4 đến 5 người chơi';
    }
    if (setupData.gameMode === GAME_MODE_ZOMBIE_APOCALYPSE) {
      if (numPlayers < 2 || numPlayers > 9) return 'Chế độ Zombie Apocalypse dành cho 2 đến 9 người chơi';
    }
    if (setupData.gameMode === GAME_MODE_ZOMBIE_CARL) {
      if (numPlayers !== 2) return 'Chế độ Zombie với Carl chỉ dành riêng cho 2 người chơi thật';
    }
    if (setupData.gameMode === GAME_MODE_RECIPES_FOR_DISASTER) {
      if (numPlayers < 2 || numPlayers > 5) return 'Chế độ Recipes for Disaster hỗ trợ từ 2 đến 5 người chơi';
      if (setupData.recipeSlug !== undefined && setupData.recipeSlug !== 'sticky_fingers')
        return 'Recipe này chưa được xác minh Ingredients và hiện bị khóa';
    }
    if (setupData.gameMode === GAME_MODE_GOOD_VS_EVIL) {
      if (numPlayers < 2 || numPlayers > 5) return 'Chế độ Good vs Evil hỗ trợ từ 2 đến 5 người chơi';
    }
    if (setupData.gameMode === GAME_MODE_RAGE_MODE) {
      if (numPlayers < 2 || numPlayers > 5) return 'Chế độ Rage Mode hỗ trợ từ 2 đến 5 người chơi';
    }
    if (setupData.gameMode === GAME_MODE_CURSE_YOU) {
      if (numPlayers < 2 || numPlayers > 5) return 'Chế độ Curse You! hỗ trợ từ 2 đến 5 người chơi';
    }
    if (setupData.gameMode === GAME_MODE_ANNIVERSARY_LEGACY) {
      if (numPlayers < 2 || numPlayers > 5) return 'Chế độ Kỷ Niệm 10 Năm hỗ trợ từ 2 đến 5 người chơi';
    }
    if (setupData.gameMode === GAME_MODE_EXPLODING_MINIONS) {
      if (numPlayers < 2 || numPlayers > 5) return 'Chế độ Exploding Minions hỗ trợ từ 2 đến 5 người chơi';
    }
    if (numPlayers < def.minPlayers || numPlayers > def.maxPlayers) {
      return `${def.vietnameseName} chỉ hỗ trợ từ ${def.minPlayers} đến ${def.maxPlayers} người chơi`;
    }
  }
}

export interface SetupData {
  matchName?: string;
  maxPlayers?: number;
  openCards?: boolean;
  spectatorsSeeCards?: boolean;
  deckType?: string;
  selectedDecks?: string[];
  gameMode?: number;
  recipeSlug?: string;
}

export const setupGame = (_context: any, setupData?: SetupData): IGameState => {
  const gameMode = setupData?.gameMode ?? GAME_MODE_NORMAL;
  const def = getGameModeDefinition(gameMode);

  // Standalone modes do not mix expansion decks
  let selectedDecks: string[];
  if (!def.allowsExpansionSelection) {
    selectedDecks = (gameMode === GAME_MODE_QUICK_PLAY || gameMode === GAME_MODE_CAT_BURGLAR)
      ? ['original']
      : [def.slug];
  } else {
    selectedDecks = normalizeDecks(setupData?.selectedDecks ?? []);
  }

  // Phân chia đội cho Chế độ Đấu Đội (Mode 3)
  const teams: Record<string, 'red' | 'blue'> = {};
  if (gameMode === GAME_MODE_TEAM_UP) {
    const totalSeats = setupData?.maxPlayers ?? 2;
    for (let i = 0; i < totalSeats; i++) {
      teams[String(i)] = (i % 2 === 0) ? 'red' : 'blue';
    }
  }

  return {
    nextCardId: 1,
    winner: null,
    deadPlayers: [],
    piles: {
      drawPile: {
        cards: [],
        size: 0,
      },
      discardPile: {
        cards: [],
        size: 0,
      },
      pendingCardPlay: null,
    },
    turnsRemaining: 1,
    gameRules: {
      spectatorsSeeCards: setupData?.spectatorsSeeCards ?? false,
      openCards: setupData?.openCards ?? false,
      pendingTimerMs: 0,
    },
    deckType: def.setupKind === 'standalone' ? def.slug : (setupData?.deckType ?? 'original'),
    selectedDecks,
    gameMode,
    teams: gameMode === GAME_MODE_TEAM_UP ? teams : undefined,
    winningTeam: null,
    comboMultiplier: 1,
    lastComboNotification: null,
    isReversed: false,
    implodingKittenFaceUp: false,
    bottomCard: null,
    mustDrawFromAnywhereNext: false,
    topDrawCard: null,
    handShuffleDefense: null,
    catBurglarHolderId: null,
    catBurglarUsedThisTurn: false,
    catBurglarInitialized: false,
    lastCatBurglarAction: null,
    animationsQueue: {},
  };
};
