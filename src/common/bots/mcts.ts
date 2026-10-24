import type { ICard } from '../models';
import type { TheGame } from '../entities/game';
import type { Player } from '../entities/player';
import type { HandTracker } from './hand-tracker';
import type { BotAction } from './kitten-bot';
import * as C from '../constants/cards';

export interface MCTSNodeEvaluation {
  action: BotAction;
  cardName?: string;
  visits: number;
  totalReward: number;
  averageReward: number;
}

const escapes = new Set<string>([
  C.NAME_SKIP, C.NAME_SUPER_SKIP, C.NAME_ATTACK, C.NAME_TARGETED_ATTACK,
  C.NAME_REVERSE, C.NAME_REVERSE_ATTACK, C.NAME_CHOOSE_YOUR_FATE,
  C.NAME_SLAP_1X, C.NAME_SLAP_2X, C.NAME_SLAP_3X, C.NAME_ATTACK_OF_THE_DEAD,
]);

const defenses = new Set<string>([
  C.NAME_DEFUSE, C.NAME_ZOMBIE_KITTEN, C.NAME_DEFUSE_TIMEBOMB, C.NAME_STREAKING_KITTEN,
]);

const visions = new Set<string>([
  C.NAME_SEE_THE_FUTURE, C.NAME_SEE_THE_FUTURE_1X, C.NAME_SEE_THE_FUTURE_5X,
  C.NAME_ALTER_THE_FUTURE, C.NAME_ALTER_THE_FUTURE_5X, C.NAME_ALTER_THE_FUTURE_3X_NOW,
  C.NAME_SHARE_THE_FUTURE_3X,
]);

const thefts = new Set<string>([
  C.NAME_FAVOR, C.NAME_CAT_CARD, C.NAME_FERAL_CAT, C.NAME_STEAL_A_CARD,
]);

const dangerousCards = new Set<string>([
  C.NAME_EXPLODING_KITTEN, C.NAME_TIMEBOMB_KITTEN,
]);

/**
 * Information-Set Monte Carlo Tree Search (ISMCTS) Rollout Evaluator.
 * Samples hidden deck permutations and opponent hands to simulate outcomes
 * of candidate moves before committing to an action.
 */
export class MCTSEvaluator {
  constructor(private readonly random: () => number = Math.random) {}

  private isDangerous(card?: ICard | null): boolean {
    return !!card && (dangerousCards.has(card.name) || (card.name === C.NAME_IMPLODING_KITTEN && !!card.isFaceUp));
  }

  /**
   * Run Monte Carlo rollouts for valid root actions (Play Card vs Draw Card).
   */
  evaluate(
    game: TheGame,
    self: Player,
    handTracker: HandTracker,
    knownTop: ICard[],
    iterations: number,
    cardsPlayedThisTurn: number
  ): BotAction | null {
    if (iterations <= 0) return null;

    // Collect distinct candidate actions
    const candidateActions: Array<{ action: BotAction; cardName?: string; cardIndex?: number }> = [];

    // Candidate 0: Draw Card (always a baseline choice)
    candidateActions.push({ action: { move: 'drawCard', args: [] } });

    // Distinct playable cards in hand
    const seenCardNames = new Set<string>();
    self.hand.forEach((card, idx) => {
      if (card.isLocked || defenses.has(card.name) || card.name === C.NAME_NOPE) return;
      if (!game.piles.canCardBePlayed(card)) return;

      if (!seenCardNames.has(card.name)) {
        seenCardNames.add(card.name);
        candidateActions.push({
          action: { move: 'playCard', args: [idx] },
          cardName: card.name,
          cardIndex: idx,
        });
      }
    });

    if (candidateActions.length === 1) {
      return candidateActions[0].action;
    }

    const evaluations: MCTSNodeEvaluation[] = candidateActions.map(c => ({
      action: c.action,
      cardName: c.cardName,
      visits: 0,
      totalReward: 0,
      averageReward: 0,
    }));

    const drawPileSize = Math.max(1, game.piles.drawPile.size);
    const aliveOpponents = game.players.alivePlayers.filter(p => p.id !== self.id);
    const turnsRemaining = Math.max(1, game.turnManager.turnsRemaining);
    const hasDefuseInHand = self.hand.some(c => defenses.has(c.name));
    const knownTopIsBomb = this.isDangerous(knownTop[0]);

    // Estimate number of bombs currently in draw pile
    const estimatedBombs = Math.max(1, Math.min(drawPileSize, aliveOpponents.length));

    // Internal PRNG ensures robust Monte Carlo sampling even when mock static RNG is passed in tests
    const seedBase = Math.floor((this.random() || 0.5) * 1000000000);
    let seed = seedBase + iterations * 1337;
    const simRandom = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    // Run Monte Carlo rollouts
    for (let it = 0; it < iterations; it++) {
      // Sample a simulated draw pile (Determinization)
      const simPile: boolean[] = []; // true = bomb, false = safe

      // Place known top cards
      for (const card of knownTop) {
        simPile.push(this.isDangerous(card));
      }

      // Fill remaining unseen deck
      const remainingSlots = Math.max(0, drawPileSize - simPile.length);
      const bombsAlreadyPlaced = simPile.filter(b => b).length;
      const bombsToPlace = Math.max(0, Math.min(remainingSlots, estimatedBombs - bombsAlreadyPlaced));

      const unseen: boolean[] = Array(remainingSlots).fill(false);
      for (let b = 0; b < bombsToPlace; b++) {
        unseen[b] = true;
      }
      // Shuffle unseen using simRandom
      for (let i = unseen.length - 1; i > 0; i--) {
        const j = Math.floor(simRandom() * (i + 1));
        const temp = unseen[i];
        unseen[i] = unseen[j];
        unseen[j] = temp;
      }
      simPile.push(...unseen);

      // Evaluate each candidate action in this determinized scenario
      for (let cIdx = 0; cIdx < candidateActions.length; cIdx++) {
        const candidate = candidateActions[cIdx];
        const reward = this.simulateRollout(
          candidate.action.move,
          candidate.cardName,
          simPile,
          turnsRemaining,
          hasDefuseInHand,
          aliveOpponents,
          handTracker,
          knownTopIsBomb,
          simRandom
        );

        evaluations[cIdx].visits++;
        evaluations[cIdx].totalReward += reward;
      }
    }

    // Compute average reward for each candidate
    for (const ev of evaluations) {
      ev.averageReward = ev.visits > 0 ? ev.totalReward / ev.visits : -Infinity;
    }

    // Sort evaluations by average reward descending
    evaluations.sort((a, b) => b.averageReward - a.averageReward);

    const drawEval = evaluations.find(e => e.action.move === 'drawCard');
    const bestPlay = evaluations.find(e => e.action.move === 'playCard');

    if (!bestPlay || !drawEval) {
      return evaluations[0].action;
    }

    // Resource conservation bias: only play card if utility significantly exceeds drawing
    const conservationThreshold = 0.04 + cardsPlayedThisTurn * 0.05;
    if (bestPlay.averageReward > drawEval.averageReward + conservationThreshold && cardsPlayedThisTurn < 8) {
      return bestPlay.action;
    }

    return drawEval.action;
  }

  /**
   * Fast rollout simulation for an action under a determinized world state.
   */
  private simulateRollout(
    move: string,
    cardName: string | undefined,
    pile: boolean[],
    turnsRemaining: number,
    hasDefuse: boolean,
    aliveOpponents: Player[],
    handTracker: HandTracker,
    knownTopIsBomb: boolean,
    simRandom: () => number
  ): number {
    if (move === 'drawCard') {
      let survived = true;
      let usedDefuse = false;

      // Bot draws for each turn remaining
      for (let t = 0; t < turnsRemaining; t++) {
        const cardIsBomb = pile[t] ?? false;
        if (cardIsBomb) {
          if (hasDefuse && !usedDefuse) {
            usedDefuse = true; // Consumed defuse
          } else {
            survived = false; // Exploded
            break;
          }
        }
      }

      if (!survived) return 0.0; // Death is worst outcome

      let baseReward = 0.72;
      if (usedDefuse) {
        baseReward = 0.52; // Survived via Defuse, but consumed key defense resource
      } else {
        baseReward += 0.06; // Successfully drew a safe card to expand hand
      }

      // Next player's turn: test if next player is threatened by the next card in deck
      const nextCardIsBomb = pile[turnsRemaining] ?? false;
      if (nextCardIsBomb && aliveOpponents.length > 0) {
        const nextOpponent = aliveOpponents[0];
        const nextDefuseProb = handTracker.getDefuseProbability(nextOpponent.id, nextOpponent.handSize);
        if (simRandom() > nextDefuseProb) {
          baseReward += 0.15; // High chance next opponent explodes!
        }
      }

      return Math.min(1.0, Math.max(0.0, baseReward));
    }

    // Move is 'playCard'
    if (!cardName) return 0.5;

    // 1. Escape cards (Skip, Super Skip, Attack, Reverse, Slap)
    if (escapes.has(cardName)) {
      if (knownTopIsBomb) {
        // Dodging a known bomb is exceptionally high value
        let reward = 0.95;
        if (cardName === C.NAME_ATTACK || cardName === C.NAME_TARGETED_ATTACK || cardName.startsWith('slap')) {
          reward += 0.04; // Passing bomb to opponent
        }
        return reward;
      }
      // Top is not known bomb: if bot has Defuse, wasting an escape card is suboptimal
      if (hasDefuse) {
        return cardName === C.NAME_SUPER_SKIP && turnsRemaining > 1 ? 0.65 : 0.45;
      }
      // Bot has NO Defuse: escaping unknown threat is crucial to avoid lethal draw
      return cardName === C.NAME_SUPER_SKIP && turnsRemaining > 1 ? 0.85 : 0.72;
    }

    // 2. Vision cards (See the Future, Alter the Future)
    if (visions.has(cardName)) {
      return knownTopIsBomb ? 0.40 : 0.65;
    }

    // 3. Deck manipulation (Shuffle, Swap Top & Bottom)
    if (cardName === C.NAME_SHUFFLE || cardName === C.NAME_SHUFFLE_NOW || cardName === C.NAME_SWAP_TOP_AND_BOTTOM) {
      if (knownTopIsBomb) {
        return 0.88; // Shuffling away a known bomb
      }
      return 0.38; // Shuffling when top is not known bomb is risky
    }

    // 4. Theft cards (Favor, Cat Cards, Steal a Card)
    if (thefts.has(cardName)) {
      if (aliveOpponents.length === 0) return 0.3;
      const bestTarget = [...aliveOpponents].sort((a, b) =>
        handTracker.getStealTargetScore(b) - handTracker.getStealTargetScore(a)
      )[0];
      const targetDefuseProb = handTracker.getDefuseProbability(bestTarget.id, bestTarget.handSize);
      return 0.62 + targetDefuseProb * 0.25;
    }

    // 5. Tactical attack / disruption cards (Blind, Annoy, Curse, Mark)
    if ([C.NAME_BLIND, C.NAME_DISCARD, C.NAME_ANNOY, C.NAME_CURSE_OF_THE_CAT_BUTT, C.NAME_MARK].includes(cardName)) {
      return 0.60;
    }

    // Default card play reward
    return 0.55;
  }
}
