/**
 * Utility functions for working with matchData
 */
import {PlayerID} from "boardgame.io";

const EMPTY_NAME = "Chỗ trống";

export interface MatchPlayer {
  id: PlayerID | number;
  name?: string;
  isConnected?: boolean;
}

/**
 * Get player name from matchData by player ID or MatchPlayer object.
 * Pure function with NO hooks!
 */
export function getPlayerName(
  player: MatchPlayer | string | number | null | undefined,
  matchData?: MatchPlayer[]
): string {
  if (player === null || player === undefined) return EMPTY_NAME;

  if (typeof player === 'object') {
    return player.name || EMPTY_NAME;
  }

  const pIdStr = String(player);
  if (matchData && Array.isArray(matchData)) {
    const playerObj = matchData.find(p => String(p.id) === pIdStr);
    if (playerObj?.name) return playerObj.name;
  }

  return `Người chơi ${pIdStr}`;
}
