import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_TOWER_OF_POWER} from '../../constants/cards';

export class TowerOfPowerCard extends CardType {
  constructor(name: string = NAME_TOWER_OF_POWER) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    // Đội Vương miện Tower of Power nếu kho dự trữ vẫn còn bài
    if (game.gameState.towerOfPowerStash && game.gameState.towerOfPowerStash.length > 0) {
      game.gameState.towerOfPowerCrownBearer = actingPlayer.id;
    }
  }

  sortOrder(): number {
    return 16;
  }
}
