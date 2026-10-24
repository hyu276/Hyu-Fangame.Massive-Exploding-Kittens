import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_BURY} from '../../constants/cards';
import {BURY_CARD} from '../../constants/stages';

export class BuryCard extends CardType {
  constructor(name: string = NAME_BURY) {
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

    // Lưu lá bài đầu tiên để người chơi xem trước và chọn vị trí chôn, không rút mất khỏi cọc trước
    const topCard = cards[0];
    game.gameState.buryingCard = topCard.data;
    game.turnManager.setStage(BURY_CARD);
  }

  sortOrder(): number {
    return 18;
  }
}
