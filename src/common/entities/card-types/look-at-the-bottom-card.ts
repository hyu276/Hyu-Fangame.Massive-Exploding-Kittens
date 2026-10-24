import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_LOOK_AT_THE_BOTTOM} from '../../constants/cards';
import {STAGE_LOOK_AT_THE_BOTTOM} from '../../constants/stages';

export class LookAtTheBottomCard extends CardType {
  constructor(name: string = NAME_LOOK_AT_THE_BOTTOM) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    const drawPile = game.piles.drawPile;
    if (drawPile.size === 0) return;

    const bottomCard = drawPile.cards[drawPile.size - 1];
    if (!bottomCard) return;

    // Lưu thông tin lá bài dưới đáy để hiển thị riêng cho người chơi đang thực hiện
    game.gameState.bottomCard = bottomCard.data;
    game.turnManager.setStage(STAGE_LOOK_AT_THE_BOTTOM);
  }

  sortOrder(): number {
    return 19;
  }
}
