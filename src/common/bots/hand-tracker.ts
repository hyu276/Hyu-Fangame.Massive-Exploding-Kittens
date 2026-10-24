import type { ClientState } from 'boardgame.io/dist/types/src/client/client';
import type { ICard, IGameState } from '../models';
import type { Player } from '../entities/player';
import * as C from '../constants/cards';

export interface OpponentHandIntel {
  playerId: string;
  handSize: number;
  cardsDrawnTotal: number;
  cardsPlayedTotal: number;
  defusesUsed: number;
  hasInitialDefuse: boolean;
  defuseProbability: number;
  escapeProbability: number;
  nopeProbability: number;
  stealScore: number;
  attackScore: number;
  knownCards: string[];
}

interface PlayerStats {
  playerId: string;
  defusesUsed: number;
  hasInitialDefuse: boolean;
  cardsDrawnTotal: number;
  cardsPlayedTotal: number;
  nopeUsed: number;
  escapesUsed: number;
  attackedWithoutEscape: number;
  timesStolenFrom: number;
  timesStoleFromOthers: number;
  knownCards: string[];
}

const defenses = new Set<string>([
  C.NAME_DEFUSE, C.NAME_ZOMBIE_KITTEN, C.NAME_DEFUSE_TIMEBOMB, C.NAME_STREAKING_KITTEN,
]);

const escapes = new Set<string>([
  C.NAME_SKIP, C.NAME_SUPER_SKIP, C.NAME_ATTACK, C.NAME_TARGETED_ATTACK,
  C.NAME_REVERSE, C.NAME_REVERSE_ATTACK, C.NAME_CHOOSE_YOUR_FATE,
  C.NAME_SLAP_1X, C.NAME_SLAP_2X, C.NAME_SLAP_3X, C.NAME_ATTACK_OF_THE_DEAD,
]);

const bombs = new Set<string>([
  C.NAME_EXPLODING_KITTEN, C.NAME_TIMEBOMB_KITTEN, C.NAME_IMPLODING_KITTEN,
]);

/**
 * Tracks opponents' hand contents and computes probability distributions
 * based on public logs, card counting, and behavioral Bayesian updates.
 */
export class HandTracker {
  private stats: Map<string, PlayerStats> = new Map();
  private lastProcessedStateId = -1;
  private discardCounts: Map<string, number> = new Map();

  constructor(private readonly selfId: string) {}

  private getOrCreate(id: string): PlayerStats {
    let p = this.stats.get(id);
    if (!p) {
      p = {
        playerId: id,
        defusesUsed: 0,
        hasInitialDefuse: true,
        cardsDrawnTotal: 0,
        cardsPlayedTotal: 0,
        nopeUsed: 0,
        escapesUsed: 0,
        attackedWithoutEscape: 0,
        timesStolenFrom: 0,
        timesStoleFromOthers: 0,
        knownCards: [],
      };
      this.stats.set(id, p);
    }
    return p;
  }

  /**
   * Observe public game logs and sync stats for all players.
   */
  observe(state: NonNullable<ClientState<IGameState>>): void {
    // Process new log entries since last processed state
    const newLogs = state.log.filter(e => e._stateID > this.lastProcessedStateId);
    for (const entry of newLogs) {
      const { type, args = [], playerID } = entry.action.payload;
      if (!playerID) continue;
      const actor = this.getOrCreate(playerID);

      if (type === 'playCard') {
        actor.cardsPlayedTotal++;
      } else if (type === 'drawCard' || type === 'takeTopCard' || type === 'takeSecondCard' ||
                 type === 'drawFromAnywhere' || type === 'pickSearchCard') {
        actor.cardsDrawnTotal++;
      } else if (type === 'defuseExplodingKitten') {
        actor.defusesUsed++;
        actor.hasInitialDefuse = false;
      } else if (type === 'stealCard' || type === 'requestCard' || type === 'activateCatBurglar') {
        const targetId = args[0] as string | undefined;
        if (targetId) {
          const target = this.getOrCreate(targetId);
          target.timesStolenFrom++;
          actor.timesStoleFromOthers++;
        }
      }

      this.lastProcessedStateId = Math.max(this.lastProcessedStateId, entry._stateID);
    }

    // Recompute discard counts from public discard pile
    this.discardCounts.clear();
    for (const card of state.G.piles.discardPile.cards) {
      this.discardCounts.set(card.name, (this.discardCounts.get(card.name) ?? 0) + 1);
    }

    // Update confirmed known cards for players (e.g. marked cards from game state)
    const playersData = state.plugins.player.data.players;
    for (const id of Object.keys(playersData)) {
      const pData = playersData[id];
      const pStats = this.getOrCreate(id);
      if (Array.isArray(pData?.hand)) {
        pStats.knownCards = pData.hand
          .filter((c: ICard) => c.isMarked || (c.name === C.NAME_EXPLODING_KITTEN && !c.isFaceUp))
          .map((c: ICard) => c.name);
      }
    }
  }

  /**
   * Probability that player currently holds at least one Defuse (or equivalent save).
   */
  getDefuseProbability(playerId: string, handSize: number): number {
    if (playerId === this.selfId) return 1.0;
    if (handSize <= 0) return 0.0;
    const stats = this.getOrCreate(playerId);

    if (stats.knownCards.some(name => defenses.has(name))) {
      return 1.0;
    }

    if (stats.hasInitialDefuse) {
      // Started with 1 defuse. Each theft has a 1/handSize chance to steal it.
      const theftRetention = Math.pow(Math.max(0.2, 1 - 1 / Math.max(2, handSize + stats.timesStolenFrom)), stats.timesStolenFrom);
      return Math.min(0.98, Math.max(0.15, theftRetention));
    }

    // Initial defuse is spent; can only have one if drawn extra or stolen
    const extraDefusesInGame = 2; // Extra defuses typically seeded in the deck
    const discardedDefuses = (this.discardCounts.get(C.NAME_DEFUSE) ?? 0) +
      (this.discardCounts.get(C.NAME_ZOMBIE_KITTEN) ?? 0) +
      (this.discardCounts.get(C.NAME_DEFUSE_TIMEBOMB) ?? 0);
    const unseenDefuses = Math.max(0, extraDefusesInGame - discardedDefuses);

    const estimate = 1 - Math.pow(Math.max(0, 1 - unseenDefuses / Math.max(15, handSize * 4)), stats.cardsDrawnTotal);
    return Math.min(0.65, Math.max(0.05, estimate));
  }

  /**
   * Probability that player currently holds at least one Escape card (Skip/Attack/Reverse/etc).
   */
  getEscapeProbability(playerId: string, handSize: number): number {
    if (handSize <= 0) return 0.0;
    const stats = this.getOrCreate(playerId);

    if (stats.knownCards.some(name => escapes.has(name))) {
      return 1.0;
    }

    // Baseline: escape cards make up ~15-20% of an Exploding Kittens deck
    const escapeDensity = 0.18;
    let prob = 1 - Math.pow(1 - escapeDensity, handSize);

    // If opponent drew while under attack debt, they likely lacked escape cards
    if (stats.attackedWithoutEscape > 0) {
      prob *= Math.pow(0.4, stats.attackedWithoutEscape);
    }

    return Math.min(0.95, Math.max(0.05, prob));
  }

  /**
   * Probability that player currently holds at least one Nope card.
   */
  getNopeProbability(playerId: string, handSize: number): number {
    if (handSize <= 0) return 0.0;
    const stats = this.getOrCreate(playerId);

    if (stats.knownCards.some(name => name === C.NAME_NOPE)) {
      return 1.0;
    }

    const discardedNopes = this.discardCounts.get(C.NAME_NOPE) ?? 0;
    const remainingNopes = Math.max(0, 5 - discardedNopes);
    const nopeDensity = remainingNopes / 40;

    const prob = 1 - Math.pow(1 - nopeDensity, handSize);
    return Math.min(0.9, Math.max(0.02, prob));
  }

  /**
   * Calculate score for targeting a player to steal from (higher is better).
   */
  getStealTargetScore(player: Player): number {
    const handSize = player.handSize;
    if (handSize <= 0 || !player.isAlive) return -1000;

    const defuseProb = this.getDefuseProbability(player.id, handSize);
    const escapeProb = this.getEscapeProbability(player.id, handSize);
    const nopeProb = this.getNopeProbability(player.id, handSize);

    // Target players with high likelihood of Defuse, high card count, and good cards
    let score = defuseProb * 120 + escapeProb * 40 + nopeProb * 30 + Math.min(30, handSize * 6);

    // If player has marked Defuse, prioritize heavily
    const stats = this.getOrCreate(player.id);
    if (stats.knownCards.some(name => defenses.has(name))) {
      score += 150;
    }

    // Penalty if suspected of holding unprotected Exploding Kitten (trap)
    if (stats.knownCards.some(name => bombs.has(name))) {
      score -= 80;
    }

    return score;
  }

  /**
   * Calculate score for targeting a player with Attack / Disruption (higher is better).
   */
  getAttackTargetScore(player: Player, isNextPlayer: boolean): number {
    const handSize = player.handSize;
    if (handSize <= 0 || !player.isAlive) return -1000;

    const defuseProb = this.getDefuseProbability(player.id, handSize);
    const escapeProb = this.getEscapeProbability(player.id, handSize);

    // Target players who CANNOT defuse and CANNOT escape (most likely to explode)
    let score = (1 - defuseProb) * 110 + (1 - escapeProb) * 60 + (30 / Math.max(1, handSize));

    // Priority bonus if this is the next player in turn order
    if (isNextPlayer) {
      score += 20;
    }

    return score;
  }

  /**
   * Get full intelligence snapshot for an opponent seat.
   */
  getOpponentIntel(player: Player, isNextPlayer = false): OpponentHandIntel {
    const handSize = player.handSize;
    const stats = this.getOrCreate(player.id);
    const defuseProb = this.getDefuseProbability(player.id, handSize);
    const escapeProb = this.getEscapeProbability(player.id, handSize);
    const nopeProb = this.getNopeProbability(player.id, handSize);

    return {
      playerId: player.id,
      handSize,
      cardsDrawnTotal: stats.cardsDrawnTotal,
      cardsPlayedTotal: stats.cardsPlayedTotal,
      defusesUsed: stats.defusesUsed,
      hasInitialDefuse: stats.hasInitialDefuse,
      defuseProbability: defuseProb,
      escapeProbability: escapeProb,
      nopeProbability: nopeProb,
      stealScore: this.getStealTargetScore(player),
      attackScore: this.getAttackTargetScore(player, isNextPlayer),
      knownCards: [...stats.knownCards],
    };
  }
}
