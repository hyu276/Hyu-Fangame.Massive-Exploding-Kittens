export interface ICard {
  id: number;
  name: string;
  index: number;
  isMarked?: boolean;
  isFaceUp?: boolean;
  isLocked?: boolean;
}
