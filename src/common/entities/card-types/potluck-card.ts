import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_POTLUCK} from '../../constants/cards';
import {CHOOSE_CARD_FOR_POTLUCK} from '../../constants/stages';

export class PotluckCard extends CardType {
  constructor(name: string = NAME_POTLUCK) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    // Lập danh sách những người chơi còn sống có bài trên tay theo vòng bắt đầu từ người đánh
    const playOrder = game.turnManager.playOrder;
    const startIndex = playOrder.indexOf(actingPlayer.id);
    const numPlayers = playOrder.length;

    const potluckPending: string[] = [];
    for (let i = 0; i < numPlayers; i++) {
      const idx = (startIndex + i) % numPlayers;
      const pId = playOrder[idx];
      const p = game.players.getPlayer(pId);
      if (p && p.isAlive && p.handSize > 0) {
        potluckPending.push(pId);
      }
    }

    if (potluckPending.length === 0) {
      return;
    }

    game.gameState.potluckPending = potluckPending;
    const firstPlayer = potluckPending[0];
    game.turnManager.setActivePlayers({
      value: {
        [firstPlayer]: CHOOSE_CARD_FOR_POTLUCK,
      },
    });
  }

  sortOrder(): number {
    return 22;
  }
}
