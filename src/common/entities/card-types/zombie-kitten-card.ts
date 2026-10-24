import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_ZOMBIE_KITTEN} from '../../constants/cards';
import {CHOOSE_DEAD_PLAYER_FOR_RESURRECTION} from '../../constants/stages';

export class ZombieKittenCard extends CardType {
  constructor(name: string = NAME_ZOMBIE_KITTEN) {
    super(name);
  }

  isNowCard(): boolean {
    // Có thể đánh bất kỳ lúc nào, kể cả bởi người chơi đã chết để tự hồi sinh
    return true;
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return !game.players.actingPlayer.isAlive || game.players.allPlayers.some(player => !player.isAlive && !player.hasLeft);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    // Trường hợp 1: Người chơi đã chết đánh lá này để tự hồi sinh chính mình
    if (!actingPlayer.isAlive) {
      actingPlayer.resurrect();
      return;
    }

    // Trường hợp 2: Người chơi đang sống đánh ra để hồi sinh người chết
    const deadPlayers = game.players.allPlayers.filter(player => !player.isAlive && !player.hasLeft);
    if (deadPlayers && deadPlayers.length > 0) {
      game.turnManager.setStage(CHOOSE_DEAD_PLAYER_FOR_RESURRECTION);
    }
  }

  sortOrder(): number {
    return 0; // Tương đương vị trí Defuse
  }
}
