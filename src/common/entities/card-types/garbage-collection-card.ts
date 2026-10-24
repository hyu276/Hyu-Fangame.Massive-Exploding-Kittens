import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_GARBAGE_COLLECTION} from "../../constants/cards";
import {CHOOSE_CARD_FOR_GARBAGE} from "../../constants/stages";

export class GarbageCollectionCard extends CardType {
  constructor(name: string = NAME_GARBAGE_COLLECTION) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const eligiblePlayers = game.players.alivePlayers.filter(p => p.handSize > 0);
    if (eligiblePlayers.length === 0) {
      return;
    }
    // Ghi nhận danh sách tất cả người chơi cần nộp bài
    game.gameState.garbageCollectionPending = eligiblePlayers.map(p => p.id);
    
    // Đặt stage cho TẤT CẢ người chơi đủ điều kiện cùng một lúc
    const activeObj: Record<string, string> = {};
    eligiblePlayers.forEach(p => {
      activeObj[p.id] = CHOOSE_CARD_FOR_GARBAGE;
    });
    game.turnManager.setActivePlayers({
      value: activeObj
    });
  }

  sortOrder(): number {
    return 15;
  }
}
