import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_CLAIRVOYANCE} from '../../constants/cards';

export class ClairvoyanceCard extends CardType {
  constructor(name: string = NAME_CLAIRVOYANCE) {
    super(name);
  }

  isNowCard(): boolean {
    return true;
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.gameState.lastDefuseInsertIndex !== undefined && game.gameState.lastDefuseInsertIndex !== null;
  }

  onPlayed(_game: TheGame, _card: Card) {
    // Thông tin lastDefuseInsertIndex đã được lưu trữ trong game.gameState
    // UI sẽ hiển thị popup soi vị trí cho người chơi đánh thẻ này
  }

  sortOrder(): number {
    return 29;
  }
}
