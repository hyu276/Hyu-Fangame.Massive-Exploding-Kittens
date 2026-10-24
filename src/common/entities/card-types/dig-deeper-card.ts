import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_DIG_DEEPER} from '../../constants/cards';
import {DIG_DEEPER} from '../../constants/stages';

export class DigDeeperCard extends CardType {
  constructor(name: string = NAME_DIG_DEEPER) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    const cards = game.piles.drawPile.allCards;
    if (cards.length === 0) {
      game.turnManager.endTurn();
      return;
    }

    // Lấy thông tin lá bài đầu tiên để người chơi xem bí mật và đưa ra lựa chọn
    const topCard = cards[0];
    game.gameState.digDeeperCard = topCard.data;

    game.turnManager.setStage(DIG_DEEPER);
  }

  sortOrder(): number {
    return 24;
  }
}
