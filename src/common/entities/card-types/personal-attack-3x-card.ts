import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_PERSONAL_ATTACK_3X} from '../../constants/cards';

export class PersonalAttack3xCard extends CardType {
  constructor(name: string = NAME_PERSONAL_ATTACK_3X) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const { turnManager } = game;

    // Tự cộng thêm 3 lượt cho bản thân và kết thúc lượt hiện tại mà không cần rút bài
    const multiplier = game.gameState.comboMultiplier || 1;
    turnManager.addAttackTurns(3 * multiplier);
    game.gameState.comboMultiplier = 1;

    turnManager.endTurn({ next: turnManager.playOrder[turnManager.playOrderPos] });
  }

  sortOrder(): number {
    return 19;
  }
}
