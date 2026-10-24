import type { GameModeDefinition } from '../../../common/constants/game-modes';

// Existing card illustrations / mode avatars, cropped for the approved selection screen.
const visuals: Record<string, { title: string; scene: string }> = {
  normal: { title: 'Tiêu chuẩn', scene: 'normal' },
  quick_play: { title: 'Đấu nhanh 1v1', scene: 'quick' },
  combo: { title: 'Liên hoàn', scene: 'combo' },
  team_up: { title: 'Đấu đội', scene: 'team' },
  cat_burglar: { title: 'Mèo đạo tặc', scene: 'burglar' },
  zombie_standalone: { title: 'Zombie độc lập', scene: 'zombie' },
  zombie_carl: { title: 'Zombie với Carl', scene: 'zombie' },
  zombie_apocalypse: { title: 'Zombie Apocalypse', scene: 'zombie' },
  recipes_for_disaster: { title: 'Recipes for Disaster', scene: 'recipes' },
  good_vs_evil: { title: 'Good vs Evil', scene: 'good-evil' },
  rage_mode: { title: 'Rage Mode', scene: 'rage' },
  curse_you: { title: 'Curse You!', scene: 'curse' },
  anniversary_legacy: { title: 'Kỷ niệm 10 năm', scene: 'legacy' },
  exploding_minions: { title: 'Exploding Minions', scene: 'minions' },
};

export function getModePresentation(mode: GameModeDefinition) {
  const visual = visuals[mode.slug];
  return {
    title: visual?.title ?? mode.vietnameseName,
    scene: visual ? `/assets/modes/scenes/${visual.scene}.webp` : (mode.avatarUrl ?? '/assets/cards/back/0.jpg'),
  };
}
