export const GAME_MODE_NORMAL = 0;
export const GAME_MODE_QUICK_PLAY = 1;
export const GAME_MODE_COMBO = 2;
export const GAME_MODE_TEAM_UP = 3;
export const GAME_MODE_CAT_BURGLAR = 4;
export const GAME_MODE_ZOMBIE_STANDALONE = 5;
export const GAME_MODE_ZOMBIE_CARL = 6;
export const GAME_MODE_ZOMBIE_APOCALYPSE = 7;
export const GAME_MODE_RECIPES_FOR_DISASTER = 8;
export const GAME_MODE_GOOD_VS_EVIL = 9;
export const GAME_MODE_RAGE_MODE = 10;
export const GAME_MODE_CURSE_YOU = 11;
export const GAME_MODE_ANNIVERSARY_LEGACY = 12;
export const GAME_MODE_EXPLODING_MINIONS = 13;

export interface GameModeDefinition {
  id: number;
  slug: string;
  name: string;
  vietnameseName: string;
  icon: string;
  badge: string;
  badgeColor?: string;
  badgeBg?: string;
  description: string;
  rulesHint: string;
  minPlayers: number;
  maxPlayers: number;
  availability: 'stable' | 'experimental' | 'planned';
  setupKind: 'expansion_mix' | 'standalone' | 'recipe' | 'virtual_player';
  allowsExpansionSelection: boolean;
  avatarUrl?: string;
}

export type GameModeInfo = GameModeDefinition;

export const GAME_MODES: GameModeDefinition[] = [
  {
    id: GAME_MODE_NORMAL,
    slug: 'normal',
    name: 'Normal',
    vietnameseName: 'Tiêu Chuẩn',
    icon: '🎲',
    badge: 'Tiêu chuẩn',
    badgeColor: '#cbd5e1',
    badgeBg: 'rgba(255, 255, 255, 0.1)',
    description: 'Chế độ chơi tiêu chuẩn Exploding Kittens với đầy đủ các gói mở rộng tùy chọn.',
    rulesHint: '2 - 10 người chơi, áp dụng luật thông thường.',
    minPlayers: 2,
    maxPlayers: 10,
    availability: 'stable',
    setupKind: 'expansion_mix',
    allowsExpansionSelection: true,
  },
  {
    id: GAME_MODE_QUICK_PLAY,
    slug: 'quick_play',
    name: 'Quick Play',
    vietnameseName: 'Đấu Nhanh (1v1)',
    icon: '⚡',
    badge: 'Đấu Nhanh 1v1',
    badgeColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.25)',
    description: 'Dành riêng cho 2 người chơi với Bộ Tiêu Chuẩn rút gọn đúng 16 lá và 2 lá Mèo Nổ.',
    rulesHint: 'Cố định 2 người chơi, chỉ dùng Bộ Tiêu Chuẩn 16 lá (2 Mèo Nổ).',
    minPlayers: 2,
    maxPlayers: 2,
    availability: 'stable',
    setupKind: 'standalone',
    allowsExpansionSelection: false,
  },
  {
    id: GAME_MODE_COMBO,
    slug: 'combo',
    name: 'Combo Chain',
    vietnameseName: 'Liên Hoàn (x2 x3)',
    icon: '🔥',
    badge: 'Liên Hoàn x2-x3',
    badgeColor: '#f87171',
    badgeBg: 'rgba(239, 68, 68, 0.25)',
    description: 'Mỗi lá bài đánh ra (trừ Gỡ Bom) có cơ hội kích hoạt hiệu ứng nhân 2 (x2) hoặc nhân 3 (x3)!',
    rulesHint: 'Cơ hội x2, x3 số lượt đánh, số lá xin xỏ, số lá xem tương lai và cướp bài.',
    minPlayers: 2,
    maxPlayers: 10,
    availability: 'stable',
    setupKind: 'expansion_mix',
    allowsExpansionSelection: true,
  },
  {
    id: GAME_MODE_TEAM_UP,
    slug: 'team_up',
    name: 'Team-Up',
    vietnameseName: 'Đấu Đội (2 Team)',
    icon: '👥',
    badge: 'Đấu Đội',
    badgeColor: '#c084fc',
    badgeBg: 'rgba(168, 85, 247, 0.25)',
    description: 'Chia làm 2 đội: Đội Đỏ 🔴 và Đội Xanh 🔵. Đội chiến thắng khi toàn bộ thành viên đội đối phương bị loại.',
    rulesHint: 'Yêu cầu số người chơi chẵn (2, 4, 6, 8). Đồng đội sống sót cùng nhau chiến thắng.',
    minPlayers: 2,
    maxPlayers: 8,
    availability: 'stable',
    setupKind: 'expansion_mix',
    allowsExpansionSelection: true,
  },
  {
    id: GAME_MODE_CAT_BURGLAR,
    slug: 'cat_burglar',
    name: 'Cat Burglar',
    vietnameseName: 'Mèo Đạo Tặc (Cat Burglar)',
    icon: '🐱‍👤',
    badge: 'Mèo Đạo Tặc',
    badgeColor: '#34d399',
    badgeBg: 'rgba(16, 185, 129, 0.25)',
    description: 'Chế độ chơi cùng phụ kiện tượng Mèo Đạo Tặc. Người giữ tượng có thể chuyển tượng cho đối thủ và gọi tên chính xác 1 loại Cat Card để cướp bài!',
    rulesHint: '2 - 5 người chơi, chỉ dùng Bộ Tiêu Chuẩn. Giữ tượng có thể gọi tên 1 loại Cat Card để cướp.',
    minPlayers: 2,
    maxPlayers: 5,
    availability: 'stable',
    setupKind: 'standalone',
    allowsExpansionSelection: false,
    avatarUrl: '/assets/modes/cat-burglar.jpg',
  },
  {
    id: GAME_MODE_ZOMBIE_STANDALONE,
    slug: 'zombie_standalone',
    name: 'Zombie Kittens Standalone',
    vietnameseName: 'Zombie Kittens (Độc Lập)',
    icon: '🧟',
    badge: 'Zombie Độc Lập',
    badgeColor: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.25)',
    description: 'Hộp bài Zombie Kittens 61 lá độc lập. Người chết vẫn giữ bài trên tay, có thể dùng bài NOW và Nope, và được hồi sinh bằng Zombie Kitten!',
    rulesHint: '4 - 5 người chơi (toàn bộ 57 lá không bom). Không dùng Defuse, chỉ còn 1 người sống sót là thắng ngay.',
    minPlayers: 4,
    maxPlayers: 5,
    availability: 'stable',
    setupKind: 'standalone',
    allowsExpansionSelection: false,
    avatarUrl: '/assets/decks/zombie_kittens.png',
  },
  {
    id: GAME_MODE_ZOMBIE_CARL,
    slug: 'zombie_carl',
    name: 'Zombie Kittens with Carl',
    vietnameseName: 'Zombie 2 Người với Carl',
    icon: '💀',
    badge: 'Zombie Carl (2P)',
    badgeColor: '#64748b',
    badgeBg: 'rgba(100, 116, 139, 0.25)',
    description: 'Biến thể 2 người chơi thật cùng hệ thống người chơi ảo Carl. Carl giữ 1 Zombie Kitten ngửa và lật bài cọc rút mỗi lượt.',
    rulesHint: 'Đúng 2 người chơi thật + 1 Carl. Dùng 2 Mèo Nổ [CX].',
    minPlayers: 2,
    maxPlayers: 2,
    availability: 'stable',
    setupKind: 'virtual_player',
    allowsExpansionSelection: false,
    avatarUrl: '/assets/decks/zombie_kittens.png',
  },
  {
    id: GAME_MODE_ZOMBIE_APOCALYPSE,
    slug: 'zombie_apocalypse',
    name: 'Zombie Apocalypse',
    vietnameseName: 'Zombie Apocalypse (Ghép 2 Hộp)',
    icon: '☣️',
    badge: 'Zombie Apocalypse',
    badgeColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    description: 'Ghép hai hộp Original + Zombie theo bảng setup chuẩn xác cho 2-9 người chơi. Cân bằng số Defuse và Zombie Kitten nghiêm ngặt, người chết giữ bài.',
    rulesHint: '2 - 9 người chơi theo bảng quy định cụ thể. Defuse không hồi sinh, Zombie Kitten có hồi sinh.',
    minPlayers: 2,
    maxPlayers: 9,
    availability: 'stable',
    setupKind: 'standalone',
    allowsExpansionSelection: false,
    avatarUrl: '/assets/decks/zombie_kittens.png',
  },
  {
    id: GAME_MODE_RECIPES_FOR_DISASTER,
    slug: 'recipes_for_disaster',
    name: 'Recipes for Disaster',
    vietnameseName: 'Recipes for Disaster (Công Thức)',
    icon: '📜',
    badge: 'Recipes for Disaster',
    badgeColor: '#ec4899',
    badgeBg: 'rgba(236, 72, 153, 0.25)',
    description: 'Chơi theo các công thức bài chế tạo sẵn (Recipes), bắt đầu với công thức Sticky Fingers. Không trộn bừa bãi cả 121 lá.',
    rulesHint: '2 - 5 người chơi; chỉ Sticky Fingers có bản chơi thử, Ingredients chưa xác minh.',
    minPlayers: 2,
    maxPlayers: 5,
    availability: 'experimental',
    setupKind: 'recipe',
    allowsExpansionSelection: false,
  },
  {
    id: GAME_MODE_GOOD_VS_EVIL,
    slug: 'good_vs_evil',
    name: 'Good vs Evil',
    vietnameseName: 'Good vs Evil (Thiện vs Ác)',
    icon: '⚖️',
    badge: 'Good vs Evil',
    badgeColor: '#eab308',
    badgeBg: 'rgba(234, 179, 8, 0.25)',
    description: 'Cuộc chiến giữa Godcat và Devilcat trên sàn đấu playmat với cơ chế Armageddon rúng động.',
    rulesHint: '2 - 5 người chơi; bản số hóa thử nghiệm trong khi hoàn thiện lựa chọn bí mật Armageddon/Godcat.',
    minPlayers: 2,
    maxPlayers: 5,
    availability: 'experimental',
    setupKind: 'standalone',
    allowsExpansionSelection: false,
  },
  {
    id: GAME_MODE_RAGE_MODE,
    slug: 'rage_mode',
    name: 'Rage Mode',
    vietnameseName: 'Rage Mode (Cuồng Nộ)',
    icon: '💢',
    badge: 'Rage Mode',
    badgeColor: '#dc2626',
    badgeBg: 'rgba(220, 38, 38, 0.25)',
    description: 'Phụ kiện tượng Rage Cat di chuyển liên tục, cướp bài ngẫu nhiên và các lá bẫy Booby Trap.',
    rulesHint: '2 - 5 người chơi; bản số hóa thử nghiệm trong khi hoàn thiện các lựa chọn nhiều bước.',
    minPlayers: 2,
    maxPlayers: 5,
    availability: 'experimental',
    setupKind: 'standalone',
    allowsExpansionSelection: false,
  },
  {
    id: GAME_MODE_CURSE_YOU,
    slug: 'curse_you',
    name: 'Curse You!',
    vietnameseName: 'Curse You! (Bùa Chú & Nguyền Rủa)',
    icon: '🔮',
    badge: 'Curse You! [SC]',
    badgeColor: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.25)',
    description: 'Cơ chế Charm và Curse đặt thường trực trước mặt người chơi cùng chiến dịch mở khóa pack qua các ván.',
    rulesHint: '2 - 5 người chơi, bùa chú vĩnh viễn và tiến trình mở khóa [SC].',
    minPlayers: 2,
    maxPlayers: 5,
    availability: 'experimental',
    setupKind: 'standalone',
    allowsExpansionSelection: false,
  },
  {
    id: GAME_MODE_ANNIVERSARY_LEGACY,
    slug: 'anniversary_legacy',
    name: '10th Anniversary Legacy',
    vietnameseName: 'Kỷ Niệm 10 Năm (8 Lá Bonus)',
    icon: '🎂',
    badge: 'Anniversary [SC]',
    badgeColor: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.25)',
    description: '8 thẻ bài di sản kỷ niệm 10 năm với các cơ chế đặc biệt từ scan cộng đồng.',
    rulesHint: '2 - 5 người chơi, variant thử nghiệm [SC].',
    minPlayers: 2,
    maxPlayers: 5,
    availability: 'experimental',
    setupKind: 'standalone',
    allowsExpansionSelection: false,
  },
  {
    id: GAME_MODE_EXPLODING_MINIONS,
    slug: 'exploding_minions',
    name: 'Exploding Minions',
    vietnameseName: 'Exploding Minions (Minions)',
    icon: '🍌',
    badge: 'Exploding Minions',
    badgeColor: '#facc15',
    badgeBg: 'rgba(250, 204, 21, 0.25)',
    description: 'Phiên bản Minions độc lập với 3 loại nhân vật Character Cards và cơ chế Clone thẻ bài.',
    rulesHint: '2 - 5 người chơi, độc lập hoàn toàn với Exploding Kittens.',
    minPlayers: 2,
    maxPlayers: 5,
    availability: 'stable',
    setupKind: 'standalone',
    allowsExpansionSelection: false,
  },
];

export function getGameModeDefinition(gameMode: number = 0): GameModeDefinition {
  return GAME_MODES.find(m => m.id === gameMode) || GAME_MODES[0];
}

export function getGameModeBySlug(slug: string): GameModeDefinition | undefined {
  return GAME_MODES.find(m => m.slug === slug);
}

export function getGameModeInfo(gameMode: number = 0): GameModeDefinition {
  return getGameModeDefinition(gameMode);
}
