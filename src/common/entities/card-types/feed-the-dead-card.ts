import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_FEED_THE_DEAD} from '../../constants/cards';
import {CHOOSE_DEAD_PLAYER_FOR_FEED} from '../../constants/stages';

export class FeedTheDeadCard extends CardType {
  constructor(name: string = NAME_FEED_THE_DEAD) {
    super(name);
  }

  isNowCard(): boolean {
    // Có thể đánh bất kỳ lúc nào, kể cả người chết cũng có thể đánh
    return true;
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    // Chỉ có thể đánh khi trong bàn có ít nhất 1 người chơi đã chết
    return game.players.allPlayers.some(player => !player.isAlive && !player.hasLeft);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    game.turnManager.setStage(CHOOSE_DEAD_PLAYER_FOR_FEED);
  }

  sortOrder(): number {
    return 25;
  }
}
