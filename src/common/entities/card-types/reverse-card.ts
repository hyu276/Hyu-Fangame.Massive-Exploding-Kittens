import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class ReverseCard extends CardType {
  constructor(name: string = 'reverse') {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    // Đảo ngược chiều vòng chơi
    game.gameState.isReversed = !game.gameState.isReversed;
    // Kết thúc lượt hiện tại mà không cần rút bài
    game.turnManager.endTurn();
  }

  sortOrder(): number {
    return 7;
  }
}
