import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_SEARCH} from '../../constants/cards';
import {SEARCHING_DECK} from '../../constants/stages';

export class SearchCard extends CardType {
  constructor(name: string = NAME_SEARCH) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.piles.drawPile.size > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const drawPile = game.piles.drawPile;
    const topCards = drawPile.allCards.slice(0, 5);

    if (topCards.length === 0) return;

    // Lưu tạm danh sách lá bài để truyền xuống playerView
    game.gameState.searchTopCards = topCards.map(c => c.data);
    game.turnManager.setStage(SEARCHING_DECK);
  }

  sortOrder(): number {
    return 35;
  }
}
