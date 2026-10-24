import type { IHandShuffleDefense } from '../models';
import type { BotAction } from './kitten-bot';

/** Internal timing policy. Deadlines stay anchored to the start of this defense. */
export function decideHandDefense(defense: IHandShuffleDefense, level: number, now = Date.now()): BotAction {
  if (level < 2) return { move: 'finishHandShuffleDefense', args: [] };
  const interval = level === 2 ? 2000 : level === 3 ? 1000 : 500;
  const start = defense.startedAtMs;
  const lastShuffle = defense.lastRandomShuffleAtMs ?? start;
  const shuffleAt = lastShuffle >= defense.expiresAtMs ? Infinity :
    start + (Math.floor((lastShuffle - start) / interval) + 1) * interval;
  const publishAt = [3000, 6000, 9000].map(offset => start + offset)
    .find(time => time > (defense.snapshotAtMs ?? start)) ?? Infinity;
  if (shuffleAt <= publishAt && shuffleAt <= defense.expiresAtMs) {
    return { move: 'randomShuffleHand', args: [], delay: Math.max(0, shuffleAt - now) };
  }
  if (publishAt < defense.expiresAtMs) {
    return { move: 'publishHandShuffleSnapshot', args: [], delay: Math.max(0, publishAt - now) };
  }
  return { move: 'finishHandShuffleDefense', args: [], delay: Math.max(0, defense.expiresAtMs - now) };
}
