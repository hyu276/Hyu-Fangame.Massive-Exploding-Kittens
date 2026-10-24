import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_SWAP_TOP_AND_BOTTOM} from "../../constants/cards";

export class SwapTopAndBottomCard extends CardType {
  constructor(name: string = NAME_SWAP_TOP_AND_BOTTOM) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const drawPile = game.piles.drawPile;
    if (drawPile.length >= 2) {
      drawPile.swap(0, drawPile.length - 1);
    }
  }

  sortOrder(): number {
    return 14;
  }
}
