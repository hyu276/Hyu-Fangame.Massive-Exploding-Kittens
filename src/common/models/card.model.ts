export interface ICard {
  id: number;
  name: string;
  index: number;
  /** Visual index independent of the gameplay card index. */
  artworkSlot?: number;
  isMarked?: boolean;
  isFaceUp?: boolean;
  isLocked?: boolean;
}
