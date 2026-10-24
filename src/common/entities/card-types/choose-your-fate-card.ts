import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_CHOOSE_YOUR_FATE} from '../../constants/cards';

export class ChooseYourFateCard extends CardType {
  constructor(name: string = NAME_CHOOSE_YOUR_FATE) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    // Đánh dấu cờ để khi lượt của người chơi tiếp theo bắt đầu, họ lập tức bị ép vào stage rút bài tùy ý
    game.gameState.mustDrawFromAnywhereNext = true;

    // Kết thúc lượt hiện tại ngay lập tức mà không rút bài
    game.turnManager.turnsRemaining = 1;
    game.turnManager.endTurn();
  }

  sortOrder(): number {
    return 21;
  }
}
