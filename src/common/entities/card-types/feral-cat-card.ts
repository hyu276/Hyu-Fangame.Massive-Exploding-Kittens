import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {stealCard} from "../../moves/steal-card-move";
import {CHOOSE_PLAYER_TO_STEAL_FROM} from "../../constants/stages";
import {NAME_CAT_CARD, NAME_FERAL_CAT} from "../../constants/cards";

export class FeralCatCard extends CardType {
  constructor(name: string = NAME_FERAL_CAT) {
    super(name);
  }

  canBePlayed(game: TheGame, card: Card): boolean {
    const player = game.players.actingPlayer;

    // Cần có 1 lá CatCard khác HOẶC 1 lá FeralCat khác trên tay để ghép cặp
    const hasOtherCat = player.hand.some(c => c.id !== card.id && (c.name === NAME_CAT_CARD || c.name === NAME_FERAL_CAT));
    if (!hasOtherCat) {
      return false;
    }

    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);
    return candidates.length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);

    if (candidates.length === 1) {
      stealCard(game, candidates[0].id);
    } else if (candidates.length > 1) {
      game.turnManager.setStage(CHOOSE_PLAYER_TO_STEAL_FROM);
    }
  }

  afterPlay(game: TheGame, _card: Card) {
    const player = game.players.actingPlayer;
    // Ưu tiên tiêu thụ 1 lá cat_card trước, nếu không có thì tiêu thụ lá feral_cat thứ 2
    const catCardIdx = player.findCardIndex(NAME_CAT_CARD);
    if (catCardIdx !== -1) {
      player.hand[catCardIdx].moveTo(game.piles.discardPile, { delayMs: 150 });
      return;
    }

    const feralIdx = player.findCardIndex(NAME_FERAL_CAT);
    if (feralIdx !== -1) {
      player.hand[feralIdx].moveTo(game.piles.discardPile, { delayMs: 150 });
    }
  }

  sortOrder(): number {
    return 6;
  }
}
