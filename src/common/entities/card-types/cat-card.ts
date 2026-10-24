import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {stealCard} from "../../moves/steal-card-move";
import {CHOOSE_PLAYER_TO_STEAL_FROM} from "../../constants/stages";
import {NAME_FERAL_CAT} from "../../constants/cards";

export class CatCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  /**
   * Cat card-types can only be played in pairs (either with matching card or with feral cat)
   */
  canBePlayed(game: TheGame, card: Card): boolean {
    const player = game.players.actingPlayer;

    const matchingCards = player.getMatchingCards(card);
    const hasFeralCat = player.hasCard(NAME_FERAL_CAT);

    // Need at least 2 matching cat card-types or 1 matching + 1 feral cat
    if (matchingCards.length < 2 && !hasFeralCat) {
      return false;
    }

    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);
    return candidates.length > 0;
  }

  /**
   * Prompt player to choose a target after pair cost is already consumed.
   */
  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);

    if (candidates.length === 1) {
      // Automatically choose the only valid opponent
      stealCard(game, candidates[0].id);
    } else if (candidates.length > 1) {
      game.turnManager.setStage(CHOOSE_PLAYER_TO_STEAL_FROM);
    }
  }

  /**
   * Immediately consume the second matching cat card (or feral cat) after the first is played.
   */
  afterPlay(game: TheGame, card: Card) {
    const player = game.players.actingPlayer;
    const matchingCards = player.getMatchingCards(card);
    if (matchingCards.length > 0) {
      const secondCard = matchingCards[0];
      secondCard.moveTo(game.piles.discardPile, { delayMs: 150 });
      return;
    }

    // Fallback: consume a feral cat if matching normal cat card not found
    const feralIdx = player.findCardIndex(NAME_FERAL_CAT);
    if (feralIdx !== -1) {
      player.hand[feralIdx].moveTo(game.piles.discardPile, { delayMs: 150 });
    }
  }

  sortOrder(): number {
    return 6;
  }
}
