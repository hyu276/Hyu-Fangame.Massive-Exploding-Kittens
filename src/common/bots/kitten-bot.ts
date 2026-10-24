import type { ClientState } from 'boardgame.io/dist/types/src/client/client';
import type { ICard, IContext, IGameState } from '../models';
import { TheGame } from '../entities/game';
import type { Player } from '../entities/player';
import * as S from '../constants/stages';
import * as C from '../constants/cards';
import { GAME_MODE_CAT_BURGLAR } from '../constants/game-modes';
import { BOT_DIFFICULTIES, type BotDifficulty } from './difficulty';
import { decideHandDefense } from './hand-defense-policy';
import { HandTracker, type OpponentHandIntel } from './hand-tracker';
import { MCTSEvaluator } from './mcts';

export type { OpponentHandIntel };
export { HandTracker, MCTSEvaluator };

export interface BotFutureIntel {
  revision: number;
  cards: ICard[];
}

export interface BotAction {
  move: string;
  args: unknown[];
  delay?: number;
}

const action = (move: string, ...args: unknown[]): BotAction => ({ move, args });
const escapes = new Set<string>([C.NAME_SKIP, C.NAME_SUPER_SKIP, C.NAME_ATTACK,
  C.NAME_TARGETED_ATTACK, C.NAME_REVERSE, C.NAME_REVERSE_ATTACK, C.NAME_CHOOSE_YOUR_FATE,
  C.NAME_SLAP_1X, C.NAME_SLAP_2X, C.NAME_SLAP_3X, C.NAME_ATTACK_OF_THE_DEAD]);
const visions = new Set<string>([C.NAME_SEE_THE_FUTURE, C.NAME_SEE_THE_FUTURE_1X,
  C.NAME_SEE_THE_FUTURE_5X, C.NAME_ALTER_THE_FUTURE, C.NAME_ALTER_THE_FUTURE_5X,
  C.NAME_ALTER_THE_FUTURE_3X_NOW, C.NAME_SHARE_THE_FUTURE_3X]);
const theft = new Set<string>([C.NAME_FAVOR, C.NAME_CAT_CARD, C.NAME_FERAL_CAT, C.NAME_STEAL_A_CARD]);
const defenses = new Set<string>([C.NAME_DEFUSE, C.NAME_ZOMBIE_KITTEN, C.NAME_DEFUSE_TIMEBOMB,
  C.NAME_STREAKING_KITTEN]);

/** Filtered seat state, plus optional private intelligence supplied by the local session. */
export class KittenBot {
  private readonly level: number;
  private knownTop: ICard[] = [];
  private lastLogState = -1;
  private lastPendingName?: string;
  private turn = -1;
  private cardsPlayed = 0;
  private intelRevision = 0;
  private lastDefenseAction?: string;
  public readonly handTracker: HandTracker;
  private readonly mcts: MCTSEvaluator;

  constructor(readonly playerID: string, difficulty: BotDifficulty, private random = Math.random,
    private readFutureIntel?: () => BotFutureIntel | undefined) {
    this.level = BOT_DIFFICULTIES[difficulty].level;
    this.handTracker = new HandTracker(this.playerID);
    this.mcts = new MCTSEvaluator(this.random);
  }

  private pick<T>(items: T[]): T | undefined {
    return items[Math.floor(this.random() * items.length)];
  }

  private dangerous(card?: ICard | null): boolean {
    return !!card && (card.name === C.NAME_EXPLODING_KITTEN ||
      card.name === C.NAME_TIMEBOMB_KITTEN || (card.name === C.NAME_IMPLODING_KITTEN && !!card.isFaceUp));
  }

  private value(card: ICard): number {
    if (this.dangerous(card)) return -100;
    if (defenses.has(card.name)) return 100;
    if (card.name === C.NAME_NOPE) return 65;
    if (escapes.has(card.name)) return 75;
    if (visions.has(card.name)) return 45;
    if (theft.has(card.name)) return 30;
    return 20;
  }

  private observe(state: NonNullable<ClientState<IGameState>>) {
    // Sync hand tracking model from state and logs
    this.handTracker.observe(state);

    // Logs describe public moves; hidden card arguments are never inferred.
    for (const entry of state.log.filter(e => e._stateID > this.lastLogState)) {
      const { type, args = [], playerID } = entry.action.payload;
      if (type === 'drawCard' || type === 'takeTopCard') this.knownTop.shift();
      else if (type === 'takeSecondCard') this.knownTop.splice(this.knownTop.length > 1 ? 1 : 0, 1);
      else if (type === 'reorderFuture') {
        this.knownTop = playerID === this.playerID && Array.isArray(args?.[0])
          ? (args[0] as number[]).map(i => this.knownTop[i]).filter(Boolean) : [];
      } else if (type === 'resolvePendingCard') {
        if (!this.lastPendingName || ![...escapes, ...visions, ...theft,
          C.NAME_NOPE, C.NAME_BLIND, C.NAME_ANNOY, C.NAME_MARK, C.NAME_DISCARD,
          C.NAME_CURSE_OF_THE_CAT_BUTT, C.NAME_CURSE_OF_CRYSTAL_CORN,
          C.NAME_TOWER_OF_POWER, C.NAME_ILL_TAKE_THAT].includes(this.lastPendingName)) this.knownTop = [];
      } else if (!['playCard', 'closeFutureView', 'requestCard', 'giveCard', 'stealCard',
        'targetedAttack', 'markPlayer', 'cursePlayer', 'annoyPlayer', 'blindPlayer',
        'discardPlayerCards', 'selectPlayerForIllTakeThat', 'swapHandCards',
        'randomShuffleHand', 'publishHandShuffleSnapshot', 'finishHandShuffleDefense'].includes(type)) this.knownTop = [];
      if (type === 'finishHandShuffleDefense' && this.lastDefenseAction === 'buried_treasure') this.knownTop = [];
      if (type === 'playCard' && state.G.piles.discardPile.cards.slice(-1)[0]?.name === C.NAME_SHUFFLE_NOW) this.knownTop = [];
      if (type === 'playCard' && playerID === this.playerID) this.cardsPlayed++;
      this.lastLogState = Math.max(this.lastLogState, entry._stateID);
    }
    this.lastPendingName = state.G.piles.pendingCardPlay?.card.name;
    this.lastDefenseAction = state.G.handShuffleDefense?.actionType;
    if (state.ctx.turn !== this.turn) {
      if (this.level < 2) this.knownTop = [];
      this.turn = state.ctx.turn;
      this.cardsPlayed = 0;
    }
    if (this.level >= 1 && state.G.piles.drawPile.cards.length) {
      this.knownTop = [...state.G.piles.drawPile.cards];
    }
    const intel = this.level === 4 ? this.readFutureIntel?.() : undefined;
    if (intel && intel.revision > this.intelRevision) {
      this.knownTop = intel.cards.map(card => ({ ...card }));
      this.intelRevision = intel.revision;
    }
  }

  private target(game: TheGame, targets: Player[], stealing = false): Player | undefined {
    if (this.level < 2) return this.pick(targets);
    return [...targets].sort((a, b) => {
      const score = (p: Player) => stealing
        ? this.handTracker.getStealTargetScore(p)
        : this.handTracker.getAttackTargetScore(p, p.id === this.nextPlayer(game));
      return score(b) - score(a);
    })[0];
  }

  private nextPlayer(game: TheGame): string | undefined {
    const order = game.turnManager.playOrder;
    const step = game.gameState.isReversed ? -1 : 1;
    const pos = order.indexOf(game.players.currentPlayerId);
    for (let i = 1; i < order.length; i++) {
      const id = order[(pos + step * i + order.length) % order.length];
      if (game.players.getPlayer(id).isAlive) return id;
    }
  }

  private planFuture(game: TheGame, cards: ICard[]): number[] {
    const alive = game.turnManager.playOrder.filter(id => game.players.getPlayer(id).isAlive);
    if (game.gameState.isReversed) alive.reverse();
    const start = alive.indexOf(this.playerID);
    const ownDraws = Math.max(1, game.turnManager.turnsRemaining);
    const owners = cards.map((_, i) => i < ownDraws ? this.playerID :
      alive[(start + 1 + i - ownDraws) % alive.length]);
    let best: number[] = [];
    let bestScore = -Infinity;
    // At most five cards: examine all 120 possible orders using public turn order.
    const search = (order: number[], remaining: number[]) => {
      if (remaining.length) {
        for (const i of remaining) search([...order, i], remaining.filter(j => j !== i));
        return;
      }
      const score = order.reduce((sum, index, position) => {
        const card = cards[index];
        const owner = owners[position];
        const weight = 1 / (position + 1);
        if (owner === this.playerID) return sum + weight * (this.dangerous(card) ? -10000 : this.value(card));
        const opponent = game.players.getPlayer(owner);
        const defuseProb = this.handTracker.getDefuseProbability(owner, opponent.handSize);
        const bombValue = 200 + (1 - defuseProb) * 80 + 50 / Math.max(1, opponent.handSize);
        return sum + weight * (this.dangerous(card) ? bombValue : -this.value(card) / 5);
      }, 0);
      if (score > bestScore) { bestScore = score; best = order; }
    };
    search([], cards.map((_, i) => i));
    return best;
  }

  decide(state: ClientState<IGameState>): BotAction | null {
    if (!state || state.ctx.gameover || state.ctx.phase !== 'play') return null;
    this.observe(state);
    const game = new TheGame({ G: state.G, ctx: state.ctx, playerID: this.playerID } as IContext);
    game.setPlayers(state.plugins.player.data.players);
    const self = game.players.getPlayer(this.playerID);
    const stage = state.ctx.activePlayers?.[this.playerID];
    const pending = game.piles.pendingCard;

    if (pending) {
      const owns = pending.playedBy === this.playerID;
      const attackOnSelf = escapes.has(pending.card.name) && this.nextPlayer(game) === this.playerID;
      const threatens = attackOnSelf || theft.has(pending.card.name) ||
        [C.NAME_BLIND, C.NAME_DISCARD, C.NAME_ANNOY, C.NAME_CURSE_OF_THE_CAT_BUTT].includes(pending.card.name);
      const shouldNope = owns ? pending.isNoped : !pending.isNoped && threatens;
      if (state.isActive && self.canNope && shouldNope &&
          this.random() < [0.05, 0.3, 0.65, 0.9, 1][this.level]) {
        return { ...action('playCard', self.hand.findIndex(c => c.name === C.NAME_NOPE && !c.isLocked)),
          delay: Math.max(0, Math.min(650, pending.expiresAtMs - Date.now() - 25)) };
      }
      if (this.playerID === state.ctx.currentPlayer || owns) {
        const remainingDelay = Math.max(0, pending.expiresAtMs - Date.now());
        return { ...action('resolvePendingCard'), delay: Math.min(remainingDelay, 50) };
      }
      return null;
    }
    if (!state.isActive) return null;
    if (stage === S.RESPOND_WITH_NOW_CARD || stage === S.AWAITING_NOW_CARDS) {
      if (!pending && stage === S.RESPOND_WITH_NOW_CARD && this.level >= 3) {
        // Opportunistic Shuffle NOW by Asia / Hell bots
        const lastCard = state.G.lastActionCardName;
        if (lastCard && [C.NAME_SEE_THE_FUTURE, C.NAME_SEE_THE_FUTURE_5X, C.NAME_ALTER_THE_FUTURE, C.NAME_ALTER_THE_FUTURE_5X].includes(lastCard)) {
          const shuffleNowIdx = self.hand.findIndex(c => c.name === C.NAME_SHUFFLE_NOW && !c.isLocked);
          if (shuffleNowIdx !== -1 && this.random() < 0.75) {
            return action('playCard', shuffleNowIdx);
          }
        }
      }
      return null;
    }

    const targets = game.players.getValidCardActionTargets(self);
    const targetMoves: Record<string, string> = {
      [S.CHOOSE_PLAYER_TO_STEAL_FROM]: 'stealCard', [S.CHOOSE_PLAYER_TO_REQUEST_FROM]: 'requestCard',
      [S.CHOOSE_PLAYER_FOR_TARGETED_ATTACK]: 'targetedAttack', [S.CHOOSE_PLAYER_FOR_MARK]: 'markPlayer',
      [S.CHOOSE_PLAYER_FOR_CURSE]: 'cursePlayer', [S.CHOOSE_PLAYER_FOR_ILL_TAKE_THAT]: 'selectPlayerForIllTakeThat',
      [S.CHOOSE_PLAYER_FOR_ANNOY]: 'annoyPlayer', [S.CHOOSE_PLAYER_FOR_BLIND]: 'blindPlayer',
      [S.CHOOSE_PLAYER_FOR_DISCARD]: 'discardPlayerCards',
    };
    if (stage && targetMoves[stage]) {
      const target = this.target(game, targets, [S.CHOOSE_PLAYER_TO_STEAL_FROM, S.CHOOSE_PLAYER_TO_REQUEST_FROM].includes(stage));
      return target ? action(targetMoves[stage], target.id) : null;
    }
    const giveMoves: Record<string, string> = {
      [S.CHOOSE_CARD_TO_GIVE]: 'giveCard', [S.CHOOSE_CARD_FOR_GARBAGE]: 'giveGarbageCard',
      [S.CHOOSE_CARD_FOR_POTLUCK]: 'givePotluckCard', [S.GIVE_CARD_TO_FEED_DEAD]: 'giveCardToFeedDead',
      [S.CHOOSE_CARD_FOR_GRAVE_ROBBER]: 'giveCardForGraveRobber',
    };
    if (stage && giveMoves[stage]) {
      const cards = self.hand.map((card, i) => ({ i, value: this.value(card.data) }));
      const chosen = this.level === 0 ? this.pick(cards) : cards.sort((a, b) => a.value - b.value)[0];
      return chosen ? action(giveMoves[stage], chosen.i) : null;
    }
    if (stage === S.CHOOSE_DEAD_PLAYER_FOR_RESURRECTION || stage === S.CHOOSE_DEAD_PLAYER_FOR_FEED) {
      const dead = game.players.allPlayers.filter(p => !p.isAlive && !p.hasLeft);
      const target = this.level >= 2 ? dead.sort((a, b) => a.handSize - b.handSize)[0] : this.pick(dead);
      return target ? action(stage === S.CHOOSE_DEAD_PLAYER_FOR_RESURRECTION ? 'resurrectPlayer' : 'selectDeadPlayerForFeed', target.id) : null;
    }
    if (stage === S.DEFUSE_EXPLODING_KITTEN) {
      const size = game.piles.drawPile.size;
      // With multiple draws left, inserting at the top would kill us next turn.
      const depth = this.level >= 2 ? (game.turnManager.turnsRemaining > 1 ? size : 0) : Math.floor(this.random() * (size + 1));
      return action('defuseExplodingKitten', depth);
    }
    if ([S.VIEWING_FUTURE, S.VIEWING_FUTURE_5X, S.VIEWING_FUTURE_1X].includes(stage ?? '')) return action('closeFutureView');
    if ([S.ALTERING_FUTURE, S.ALTERING_FUTURE_5X].includes(stage ?? '')) {
      const cards = game.piles.drawPile.rawCards;
      if (this.level === 4) return action('reorderFuture', this.planFuture(game, cards));
      const order = cards.map((_, i) => i);
      if (this.level > 0) {
        const safeDraws = 1;
        order.sort((a, b) => Number(this.dangerous(cards[a])) - Number(this.dangerous(cards[b])));
        // Place bombs just after our expected draws, before safe cards for opponents.
        const safe = order.filter(i => !this.dangerous(cards[i]));
        const bombs = order.filter(i => this.dangerous(cards[i]));
        order.splice(0, order.length, ...safe.slice(0, safeDraws), ...bombs, ...safe.slice(safeDraws));
      } else order.sort(() => this.random() - 0.5);
      return action('reorderFuture', order);
    }
    if (stage === S.BURY_CARD) return action('buryCard', this.dangerous(state.G.buryingCard) ? game.piles.drawPile.size : 0);
    if (stage === S.DIG_DEEPER) return action(this.level > 0 && this.dangerous(state.G.digDeeperCard) && game.piles.drawPile.size > 1 ? 'takeSecondCard' : 'takeTopCard');
    if (stage === S.STAGE_LOOK_AT_THE_BOTTOM) return action(this.level > 0 && this.dangerous(state.G.bottomCard) ? 'keepAtBottom' : 'moveBottomToTop');
    if (stage === S.STAGE_DRAW_FROM_ANYWHERE) return action('drawFromAnywhere', this.level >= 2 && !this.dangerous(this.knownTop[0]) && this.knownTop.length ? 0 : Math.floor(this.random() * Math.max(1, game.piles.drawPile.size)));
    if (stage === S.STAGE_HAND_SHUFFLE_DEFENSE) {
      return state.G.handShuffleDefense ? decideHandDefense(state.G.handShuffleDefense, this.level) : action('finishHandShuffleDefense');
    }
    if (stage === S.SEARCHING_DECK) {
      const cards = state.G.searchTopCards ?? game.piles.drawPile.rawCards;
      const choices = cards.map((card, i) => ({ i, value: this.value(card) }));
      const choice = this.level === 0 ? this.pick(choices) : choices.sort((a, b) => b.value - a.value)[0];
      return choice ? action('pickSearchCard', choice.i) : null;
    }
    if (stage || this.playerID !== state.ctx.currentPlayer || !self.isAlive) return null;

    // Chế độ Mèo Đạo Tặc (Cat Burglar): nếu bot đang giữ tượng Cat Burglar thì kích hoạt cướp bài
    if (state.G.gameMode === GAME_MODE_CAT_BURGLAR && state.G.catBurglarHolderId === this.playerID && !state.G.catBurglarUsedThisTurn) {
      const opponents = game.players.alivePlayers.filter(p => p.id !== this.playerID);
      if (opponents.length > 0) {
        const target = this.level >= 2
          ? [...opponents].sort((a, b) => this.handTracker.getStealTargetScore(b) - this.handTracker.getStealTargetScore(a))[0]
          : this.pick(opponents);
        if (target) {
          const botCatCard = self.hand.find(c => c.name === C.NAME_CAT_CARD);
          const catIndex = botCatCard ? botCatCard.index : Math.floor(this.random() * 5);
          return action('activateCatBurglar', target.id, catIndex);
        }
      }
    }

    if (self.isBlinded || self.isCardPlayBlocked) return action('drawCard');

    // For higher difficulty bots (Level >= 2), use Information-Set MCTS rollout simulation
    if (this.level >= 2) {
      const iterations = [0, 0, 20, 35, 50][this.level];
      const mctsDecision = this.mcts.evaluate(
        game,
        self,
        this.handTracker,
        this.knownTop,
        iterations,
        this.cardsPlayed
      );
      if (mctsDecision) return mctsDecision;
    }

    const known = state.G.topDrawCard ?? this.knownTop[0];
    const hasSave = self.hand.some(c => defenses.has(c.name));
    const risk = known ? Number(this.dangerous(known)) :
      Math.min(0.95, Math.max(1, game.players.alivePlayers.length - 1) / Math.max(1, game.piles.drawPile.size));
    const danger = risk * (hasSave ? 0.6 : 1) + Math.min(0.5, (game.turnManager.turnsRemaining - 1) * 0.15);
    const playable = self.hand.map((card, i) => ({ card, i }))
      .filter(({ card }) => !card.isLocked && game.piles.canCardBePlayed(card));
    if (this.level === 0) {
      const choice = this.pick(playable.filter(({ card }) => !defenses.has(card.name) && card.name !== C.NAME_NOPE));
      return choice && this.cardsPlayed < 2 && this.random() < 0.3 ? action('playCard', choice.i) : action('drawCard');
    }
    const ranked = playable.map(({ card, i }) => {
      let score = -100;
      if (escapes.has(card.name)) score = danger * 100 - [0, 15, 22, 27, 30][this.level];
      if (card.name === C.NAME_SUPER_SKIP) score += (game.turnManager.turnsRemaining - 1) * 20;
      if (visions.has(card.name)) score = known ? -40 : 20 + danger * 25;
      if (theft.has(card.name)) score = targets.length ? 20 + (hasSave ? 0 : 15) : -100;
      if ([C.NAME_BLIND, C.NAME_DISCARD, C.NAME_ANNOY, C.NAME_CURSE_OF_THE_CAT_BUTT,
        C.NAME_MARK, C.NAME_BARKING_KITTEN, C.NAME_ILL_TAKE_THAT, C.NAME_TOWER_OF_POWER].includes(card.name)) score = 18;
      if ([C.NAME_SHUFFLE, C.NAME_SHUFFLE_NOW, C.NAME_SWAP_TOP_AND_BOTTOM].includes(card.name)) score = known && this.dangerous(known) ? 45 : -30;
      if ([C.NAME_DRAW_FROM_THE_BOTTOM, C.NAME_DIG_DEEPER, C.NAME_LOOK_AT_THE_BOTTOM,
        C.NAME_DRAW_FROM_ANYWHERE, C.NAME_BURY].includes(card.name)) score = danger * 65 - 10;
      if (card.name === C.NAME_SEARCH) score = 35;
      // Higher levels conserve resources once the immediate threat is resolved.
      score -= this.cardsPlayed * [0, 4, 6, 8, 10][this.level];
      score += this.random() * [0, 30, 12, 4, 1][this.level];
      return { i, score };
    }).sort((a, b) => b.score - a.score);
    return ranked[0]?.score > 0 && this.cardsPlayed < 8 ? action('playCard', ranked[0].i) : action('drawCard');
  }
}
