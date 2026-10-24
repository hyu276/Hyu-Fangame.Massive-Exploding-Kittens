import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_REVERSE_ATTACK} from '../../constants/cards';
import {findNextAlivePlayer} from '../../utils/turn-order';

export class ReverseAttackCard extends CardType {
  constructor(name: string = NAME_REVERSE_ATTACK) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const { turnManager } = game;
    const { ctx } = game.context;

    // 1. Đảo ngược chiều vòng chơi
    game.gameState.isReversed = !game.gameState.isReversed;

    // 2. Thêm 2 lượt tấn công cho người chơi kế tiếp (+3 để bù đắp việc onEnd decrement 1)
    turnManager.addAttackTurns(2);

    // 3. Tìm người chơi kế tiếp còn sống theo chiều mới
    const step = game.gameState.isReversed ? -1 : 1;
    const nextPlayerIndex = findNextAlivePlayer(game, ctx.playOrderPos + step);

    if (nextPlayerIndex !== undefined) {
      turnManager.endTurn({ next: turnManager.playOrder[nextPlayerIndex] });
    } else {
      turnManager.endTurn();
    }
  }

  sortOrder(): number {
    return 30;
  }
}
