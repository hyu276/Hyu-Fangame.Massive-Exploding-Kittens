import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_SHARE_THE_FUTURE_3X} from '../../constants/cards';
import {ALTERING_FUTURE} from '../../constants/stages';

export class ShareTheFuture3xCard extends CardType {
  constructor(name: string = NAME_SHARE_THE_FUTURE_3X) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    // Đánh dấu hiệu ứng chia sẻ tương lai để chuyển lượt xem cho người chơi kế tiếp
    game.gameState.isSharingFuture = true;

    game.turnManager.setActivePlayers({
      value: {
        [actingPlayer.id]: ALTERING_FUTURE,
      },
    });
  }

  sortOrder(): number {
    return 20;
  }
}
