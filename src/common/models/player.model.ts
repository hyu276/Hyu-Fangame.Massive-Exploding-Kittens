import type {ICard} from './card.model';

export interface IPlayer {
  hand: ICard[];
  handSize: number;
  isAlive: boolean;
  hasLeft?: boolean;
  isBlinded?: boolean;
  activeTimebombs?: { id: string | number; turnsLeft: number }[];
  isCardPlayBlocked?: boolean;
}
