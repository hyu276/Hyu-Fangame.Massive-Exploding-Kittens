import artworkMap from '../data/card-artwork-map.json';
import type { ICard } from '../../common/models';

export interface CardArtworkEntry {
  slots: string[];
  revision: string;
}
export const configuredArtworkTypes = new Set(Object.keys(artworkMap.cards));

/** Resolve a filename from the visual slot without changing gameplay card.index. */
export function resolveArtworkTexture(
  card: Pick<ICard, 'name' | 'index' | 'artworkSlot'> | null,
  config: { cards: Record<string, CardArtworkEntry> } = artworkMap,
): string | null {
  if (!card || !/^[a-z0-9_]+$/.test(card.name)) return null;
  const entry = config.cards[card.name];
  if (!entry || !Array.isArray(entry.slots) || entry.slots.length === 0) return null;
  const position = card.artworkSlot ?? card.index;
  if (!Number.isSafeInteger(position) || position < 0) return null;
  const filename = entry.slots[position % entry.slots.length];
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(png|jpe?g|webp)$/.test(filename)) return null;
  return `/assets/cards/${card.name}/${filename}?v=${encodeURIComponent(entry.revision)}`;
}
