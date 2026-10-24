import {
  GAME_MODE_CAT_BURGLAR, GAME_MODE_QUICK_PLAY, GAME_MODE_TEAM_UP,
  GAME_MODE_ZOMBIE_APOCALYPSE, GAME_MODE_ZOMBIE_STANDALONE,
  type GameModeDefinition,
} from '../../../common/constants/game-modes';
import { deckRegistry } from '../../../common/registries/deck-registry';

export function getModeDeckSelection(mode: GameModeDefinition, previous: string[]): string[] {
  if (!mode.allowsExpansionSelection) {
    return mode.setupKind === 'standalone' || mode.setupKind === 'virtual_player' ? [mode.slug] : ['original'];
  }
  // Standalone identifiers must not leak into an expansion mix when returning to it.
  return ['original', ...previous.filter(name => name !== 'original' && deckRegistry.has(name))];
}

export function getModePlayerCount(mode: GameModeDefinition, count: number): number {
  if (mode.id === GAME_MODE_QUICK_PLAY) return 2;
  if (mode.id === GAME_MODE_CAT_BURGLAR && count > 5) return 5;
  if (mode.id === GAME_MODE_TEAM_UP && (count % 2 !== 0 || count > 8)) return 4;
  if (mode.id === GAME_MODE_ZOMBIE_STANDALONE && (count < 4 || count > 5)) return 4;
  if (mode.id === GAME_MODE_ZOMBIE_APOCALYPSE && (count < 2 || count > 9)) return 4;
  return count < mode.minPlayers || count > mode.maxPlayers ? mode.minPlayers : count;
}
