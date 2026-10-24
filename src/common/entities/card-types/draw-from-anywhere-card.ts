import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_DRAW_FROM_ANYWHERE} from '../../constants/cards';
import {STAGE_DRAW_FROM_ANYWHERE} from '../../constants/stages';

export class DrawFromAnywhereCard extends CardType {
  constructor(name: string = NAME_DRAW_FROM_ANYWHERE) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    if (game.piles.drawPile.size === 0) {
      actingPlayer.eliminate();
      return;
    }

    // Đưa người chơi vào stage chọn vị trí để rút bài từ Chồng bài rút
    game.turnManager.setStage(STAGE_DRAW_FROM_ANYWHERE);
  }

  sortOrder(): number {
    return 20;
  }
}
