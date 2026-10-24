export type BoardSide = 'calm' | 'chaos';
export type BoardNodeKind = 'litter_box' | 'number' | 'exploding_kitten' | 'ribbon';
export interface BoardNode {
  id: string;
  ordinal: number;
  kindBySide: Record<BoardSide, BoardNodeKind>;
  actionDrawCountBySide: Record<BoardSide, number>;
  nextNodeBySide: Record<BoardSide, string>;
}

/** Experimental digital geometry; source PDFs do not show both complete board faces legibly. */
const calm = [0, 1, 2, -1, 1, 3, 2, -1, 1, 2, 3, -1, 2, 1, 3, -1, 2, 0];
const chaos = [0, 2, -1, 1, 3, -1, 2, 1, -1, 3, 1, 2, -1, 3, 2, 1, -1, 0];
export const RIBBON_INDEX = calm.length - 1;
export const LITTER_BOX_ID = 'litter_box';
export const RIBBON_ID = 'ribbon';

export const BOARD_TRACK: BoardNode[] = calm.map((value, index) => {
  const id = index === 0 ? LITTER_BOX_ID : index === RIBBON_INDEX ? RIBBON_ID : `space_${index}`;
  const next = index === RIBBON_INDEX ? 'space_1' : index === RIBBON_INDEX - 1 ? RIBBON_ID : `space_${index + 1}`;
  const kind = (v: number): BoardNodeKind => index === 0 ? 'litter_box' :
    index === RIBBON_INDEX ? 'ribbon' : v < 0 ? 'exploding_kitten' : 'number';
  return {
    id, ordinal: index,
    kindBySide: { calm: kind(value), chaos: kind(chaos[index]) },
    actionDrawCountBySide: { calm: Math.max(0, value), chaos: Math.max(0, chaos[index]) },
    nextNodeBySide: { calm: next, chaos: next },
  };
});

export function nodeAt(index: number): BoardNode { return BOARD_TRACK[index]; }
export function nextIndex(index: number): number { return index >= RIBBON_INDEX ? 1 : index + 1; }
export function flipSide(side: BoardSide): BoardSide { return side === 'calm' ? 'chaos' : 'calm'; }
