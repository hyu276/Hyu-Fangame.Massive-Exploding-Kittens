import { INVALID_MOVE } from 'boardgame.io/core';
import type { Game } from 'boardgame.io';
import type { RandomAPI } from 'boardgame.io/dist/types/src/plugins/random/random';
import {
  actionInventory, ACTION_LABELS, BOARD_GAME_NAME,
  MOVE_KINDS, NOW_ACTIONS,
  type ActionKind, type BoardEdition, type MoveKind,
} from './manifest';
import { BOARD_TRACK, flipSide, nextIndex, nodeAt, RIBBON_INDEX, type BoardSide } from './track';

export interface BoardAction { id: string; kind: ActionKind }
export interface BoardDisc { id: string; kind: MoveKind; faceUp: boolean }
export interface BoardPlayer { id: string; position: number; hand: BoardAction[]; handCount?: number; forfeited?: boolean }
type BoardPhase = 'actions' | 'move_choice' | 'alter_choice' | 'ek_choice' | 'swap_choice' | 'discard_choice' | 'finished';
interface PendingAction {
  owner: string; cardIds: string[]; kind: ActionKind; target?: string;
  magnetIndex?: number; canceled: boolean; nopeCount: number;
}
interface PrivateReveal { owner: string; discIds: string[]; discs: BoardDisc[] }
export interface BoardRaceState {
  ruleset: 'exploding_kittens_board_game'; edition: BoardEdition; boardSide: BoardSide;
  manifestStatus: 'unverified_manifest'; players: BoardPlayer[];
  actionDrawPile: BoardAction[]; actionDiscardPile: BoardAction[];
  moveDrawPile: BoardDisc[]; moveDiscardPile: BoardDisc[]; availableDangerMagnets: BoardDisc[];
  phase: BoardPhase; pendingAction?: PendingAction; pendingDisc?: BoardDisc;
  privateReveal?: PrivateReveal; swapTargets?: string[]; extraTurn: boolean;
  winnerId?: string; terminalDiagnostic?: string; turnCount: number; events: string[];
}
export interface BoardSetup { edition?: BoardEdition; matchName?: string; maxPlayers?: number }

const catKinds = new Set<ActionKind>(['cat_taco', 'cat_beard', 'cat_rainbow']);
const moveValue = (kind: MoveKind): number => {
  const match = kind.match(/(?:^move_|_move_)([1-5])/);
  return match ? Number(match[1]) : 0;
};
const hasSmallMove = (kind: MoveKind) => [1, 2, 3].includes(moveValue(kind));
const hasFastMove = (kind: MoveKind) => [4, 5].includes(moveValue(kind));

/** Entity wrapper over JSON state; all board-race mutations pass through here. */
export class BoardRace {
  constructor(public G: BoardRaceState, private random: RandomAPI,
    private endTurn: (arg?: { next: string }) => void, private current: string) {}

  get actor(): BoardPlayer { return this.G.players[Number(this.current)]; }
  player(id: string): BoardPlayer | undefined { return this.G.players.find(p => p.id === id); }
  note(message: string) { this.G.events.unshift(message); this.G.events = this.G.events.slice(0, 30); }
  canAct(id: string) { return id === this.current && !this.G.winnerId && !this.actor.forfeited; }

  drawActions(player: BoardPlayer, count: number) {
    for (let n = 0; n < count; n++) {
      if (!this.G.actionDrawPile.length && this.G.actionDiscardPile.length) {
        this.G.actionDrawPile = this.random.Shuffle(this.G.actionDiscardPile.splice(0));
        this.note('Action Discard được xáo lại thành Action Draw.');
      }
      const card = this.G.actionDrawPile.shift();
      if (!card) break;
      player.hand.push(card);
    }
  }

  refillMoves() {
    if (!this.G.moveDrawPile.length && this.G.moveDiscardPile.length) {
      this.G.moveDrawPile = this.random.Shuffle(this.G.moveDiscardPile.splice(0).map(d => ({ ...d, faceUp: false })));
      this.note('Move Discard được xáo lại thành Move Draw.');
    }
  }
  takeDisc(bottom = false, discard = true): BoardDisc | undefined {
    this.refillMoves();
    const disc = bottom ? this.G.moveDrawPile.pop() : this.G.moveDrawPile.shift();
    if (disc && discard) this.G.moveDiscardPile.unshift(disc);
    return disc;
  }

  startTurn() {
    this.G.phase = 'actions'; this.G.pendingAction = undefined; this.G.pendingDisc = undefined;
    this.G.swapTargets = undefined; this.G.privateReveal = undefined; this.G.extraTurn = false;
    this.G.turnCount++;
    if (this.actor.hand.length === 0) this.drawActions(this.actor, 3);
    this.note(`Bắt đầu lượt người chơi ${this.current}.`);
  }
  finishTurn() {
    if (this.G.winnerId) { this.G.phase = 'finished'; return; }
    const next = this.G.extraTurn ? this.current : undefined;
    this.G.extraTurn = false; this.G.phase = 'actions';
    this.endTurn(next ? { next } : undefined);
  }

  proposeAction(ownerId: string, cardId: string, secondCardId?: string, target?: string, magnetIndex?: number): boolean {
    if (typeof cardId !== 'string' || secondCardId !== undefined && typeof secondCardId !== 'string' ||
      target !== undefined && typeof target !== 'string') return false;
    if (this.G.phase !== 'actions' || this.G.pendingAction || this.G.winnerId) return false;
    const owner = this.player(ownerId);
    const card = owner?.hand.find(c => c.id === cardId);
    if (!owner || !card || card.kind === 'defuse' || card.kind === 'nope_now') return false;
    const isNow = NOW_ACTIONS.has(card.kind);
    if (!isNow && !this.canAct(ownerId)) return false;
    if (isNow && owner.forfeited) return false;
    if (card.kind === 'ditto' && !this.G.moveDiscardPile.length) return false;
    if (card.kind === 'add_magnet_now' && (!this.G.availableDangerMagnets.length ||
      !Number.isInteger(magnetIndex) || magnetIndex! < 0 || magnetIndex! > this.G.moveDrawPile.length)) return false;
    if (card.kind === 'fast_pass' && ![...this.G.moveDrawPile, ...this.G.moveDiscardPile].some(d => hasFastMove(d.kind))) return false;
    const pair = catKinds.has(card.kind) || card.kind === 'feral_cat';
    const second = secondCardId ? owner.hand.find(c => c.id === secondCardId && c.id !== cardId) : undefined;
    if (pair && (!second || !(second.kind === card.kind && catKinds.has(card.kind) ||
      card.kind === 'feral_cat' && catKinds.has(second.kind) ||
      second.kind === 'feral_cat' && catKinds.has(card.kind)))) return false;
    if (pair && (!target || target === ownerId || !this.player(target)?.hand.length)) return false;
    if (!pair && secondCardId) return false;
    if (card.kind === 'mega_move' && new Set([...this.G.moveDrawPile, ...this.G.moveDiscardPile].map(d => d.id)).size < 2) return false;
    const ids = second ? [cardId, second.id] : [cardId];
    owner.hand = owner.hand.filter(c => !ids.includes(c.id));
    this.G.actionDiscardPile.unshift(card, ...(second ? [second] : []));
    this.G.pendingAction = { owner: ownerId, cardIds: ids, kind: card.kind, target,
      magnetIndex, canceled: false, nopeCount: 0 };
    this.note(`Người chơi ${ownerId} đánh ${ACTION_LABELS[card.kind]}${pair ? ' (cặp)' : ''}; chờ Nope.`);
    return true;
  }

  nope(ownerId: string, cardId: string): boolean {
    const owner = this.player(ownerId);
    const card = owner?.hand.find(c => c.id === cardId);
    if (!this.G.pendingAction || !owner || !card || card.kind !== 'nope_now' || owner.forfeited) return false;
    owner.hand = owner.hand.filter(c => c.id !== cardId);
    this.G.actionDiscardPile.unshift(card);
    this.G.pendingAction.canceled = !this.G.pendingAction.canceled;
    this.G.pendingAction.nopeCount++;
    this.note(`Người chơi ${ownerId} đánh Nope NOW (${this.G.pendingAction.nopeCount}).`);
    return true;
  }

  resolveAction(): boolean {
    const pending = this.G.pendingAction;
    if (!pending || this.G.phase !== 'actions') return false;
    this.G.pendingAction = undefined;
    if (pending.canceled) { this.note('Action Card bị Nope.'); return true; }
    const owner = this.player(pending.owner)!;
    switch (pending.kind) {
      case 'expose_1': case 'expose_3': {
        let remaining = pending.kind === 'expose_1' ? 1 : 3;
        for (const disc of this.G.moveDrawPile) if (!disc.faceUp && remaining-- > 0) disc.faceUp = true;
        break;
      }
      case 'alter_2_now': {
        const discs = this.G.moveDrawPile.slice(0, 2);
        if (discs.length === 2) {
          this.G.privateReveal = { owner: pending.owner, discIds: discs.map(d => d.id), discs: discs.map(d => ({ ...d })) };
          this.G.phase = 'alter_choice';
        }
        break;
      }
      case 'swap_top_bottom_now': {
        const pile = this.G.moveDrawPile;
        if (pile.length > 1) [pile[0], pile[pile.length - 1]] = [pile[pile.length - 1], pile[0]];
        break;
      }
      case 'add_magnet_now': {
        const magnet = this.G.availableDangerMagnets.shift();
        if (magnet) this.G.moveDrawPile.splice(pending.magnetIndex!, 0, magnet);
        break;
      }
      case 'flip_now': this.flip(); break;
      case 'shuffle_now':
        this.G.moveDrawPile = this.random.Shuffle([...this.G.moveDrawPile, ...this.G.moveDiscardPile]
          .map(d => ({ ...d, faceUp: false })));
        this.G.moveDiscardPile = [];
        break;
      case 'draw_to_five': this.drawActions(owner, Math.max(0, 5 - owner.hand.length)); break;
      case 'charity_case': {
        const n = this.G.players.filter(p => p.id !== owner.id &&
          p.position > owner.position && p.position < RIBBON_INDEX).length;
        this.drawActions(owner, n); break;
      }
      case 'cat_taco': case 'cat_beard': case 'cat_rainbow': case 'feral_cat': {
        const victim = this.player(pending.target!)!;
        const index = Math.floor(this.random.Number() * victim.hand.length);
        const [stolen] = victim.hand.splice(index, 1);
        if (stolen) owner.hand.push(stolen);
        break;
      }
      case 'skip_draw_3': this.drawActions(owner, 3); this.finishTurn(); break;
      case 'one_small_step': this.move(1); break;
      case 'draw_bottom': this.drawAndResolve(true); break;
      case 'mega_move': {
        const a = this.takeDisc(false, false), b = this.takeDisc(false, false);
        if (!a || !b) { this.G.terminalDiagnostic = 'Không đủ Move Discs cho Mega Move.'; this.finishTurn(); break; }
        this.G.moveDiscardPile.unshift(b, a);
        this.note(`Mega Move: ${a.kind} + ${b.kind}.`);
        const sum = moveValue(a.kind) + moveValue(b.kind);
        if (sum) this.move(sum); else this.finishTurn();
        break;
      }
      case 'fast_pass': {
        let found: BoardDisc | undefined;
        const visited = new Set<string>();
        while (visited.size < 21) {
          const next = this.takeDisc();
          if (!next || visited.has(next.id)) break;
          visited.add(next.id);
          if (hasFastMove(next.kind)) { found = next; break; }
        }
        if (found) this.resolveDisc(found);
        else { this.G.terminalDiagnostic = 'Fast Pass không tìm thấy Move 4/5.'; this.finishTurn(); }
        break;
      }
      case 'slow_steady': {
        const disc = this.takeDisc();
        if (!disc) { this.G.terminalDiagnostic = 'Move Deck cạn.'; this.finishTurn(); break; }
        this.G.extraTurn = hasSmallMove(disc.kind);
        this.resolveDisc(disc);
        break;
      }
      case 'ditto': {
        const disc = this.G.moveDiscardPile[0];
        if (disc) this.resolveDisc(disc); else this.finishTurn();
        break;
      }
    }
    this.note(`${ACTION_LABELS[pending.kind]} được giải quyết.`);
    return true;
  }

  reorderFuture(ownerId: string, ids: string[]): boolean {
    const reveal = this.G.privateReveal;
    if (this.G.phase !== 'alter_choice' || !reveal || reveal.owner !== ownerId ||
      !Array.isArray(ids) || ids.length !== 2 || ids.some(id => typeof id !== 'string') ||
      new Set(ids).size !== 2 || ids.some(id => !reveal.discIds.includes(id))) return false;
    const discs = this.G.moveDrawPile.slice(0, 2);
    if (discs.some(d => !reveal.discIds.includes(d.id))) return false;
    this.G.moveDrawPile.splice(0, 2, ...ids.map(id => discs.find(d => d.id === id)!));
    this.G.privateReveal = undefined; this.G.phase = 'actions';
    this.note('Thứ tự 2 Move Discs đầu đã được thay đổi bí mật.');
    return true;
  }

  flip() { this.G.boardSide = flipSide(this.G.boardSide); this.note(`Bàn lật sang ${this.G.boardSide}.`); }
  drawAndResolve(bottom = false): boolean {
    if (this.G.phase !== 'actions' || this.G.pendingAction) return false;
    const disc = this.takeDisc(bottom);
    if (!disc) { this.G.terminalDiagnostic = 'Move Deck và Move Discard đều cạn.'; return false; }
    this.resolveDisc(disc);
    return true;
  }
  resolveDisc(disc: BoardDisc) {
    this.note(`Move Disc ${disc.kind} (${disc.id}) được rút.`);
    if (disc.kind.endsWith('_or_flip')) {
      this.G.pendingDisc = disc; this.G.phase = 'move_choice'; return;
    }
    if (disc.kind.startsWith('flip_then_move_')) this.flip();
    if (disc.kind === 'cut_the_line') { this.cutTheLine(); return; }
    if (disc.kind === 'danger_magnet') { this.dangerMagnet(); return; }
    this.move(moveValue(disc.kind));
  }
  chooseMoveOption(move: boolean): boolean {
    if (this.G.phase !== 'move_choice' || !this.G.pendingDisc || typeof move !== 'boolean') return false;
    const disc = this.G.pendingDisc;
    this.G.pendingDisc = undefined;
    this.G.phase = 'actions';
    if (move) this.move(moveValue(disc.kind));
    else { this.flip(); this.finishTurn(); }
    return true;
  }
  move(steps: number) {
    if (steps <= 0) { this.finishTurn(); return; }
    let pos = this.actor.position;
    for (let i = 0; i < steps; i++) pos = nextIndex(pos);
    this.landAt(pos);
  }
  landAt(pos: number) {
    const start = this.actor.position;
    const occupied = new Set(this.G.players.filter(p => p.id !== this.current && !p.forfeited).map(p => p.position));
    let skipped = 0;
    while (occupied.has(pos) && skipped < BOARD_TRACK.length) { pos = nextIndex(pos); skipped++; }
    if (skipped) this.note(`Ô dự kiến có người; tiến thêm ${skipped} ô đến ô trống.`);
    if (pos === start && !skipped) { this.finishTurn(); return; }
    this.actor.position = pos;
    this.note(`Người chơi ${this.current} đến ${nodeAt(pos).id}.`);
    const node = nodeAt(pos);
    const kind = node.kindBySide[this.G.boardSide];
    if (kind === 'ribbon') { this.G.winnerId = this.current; this.G.phase = 'finished'; this.note(`Người chơi ${this.current} thắng tại Ribbon!`); return; }
    if (kind === 'exploding_kitten') { this.G.phase = 'ek_choice'; return; }
    if (kind === 'number') this.drawActions(this.actor, node.actionDrawCountBySide[this.G.boardSide]);
    this.finishTurn();
  }
  cutTheLine() {
    const ahead = this.G.players.filter(p => p.id !== this.current && !p.forfeited && p.position > this.actor.position)
      .sort((a, b) => a.position - b.position)[0];
    if (!ahead) { this.finishTurn(); return; }
    this.landAt(nextIndex(ahead.position));
  }
  dangerMagnet() {
    let pos = this.actor.position;
    for (let n = 0; n < BOARD_TRACK.length * 2; n++) {
      pos = nextIndex(pos);
      if (nodeAt(pos).kindBySide[this.G.boardSide] === 'exploding_kitten') { this.landAt(pos); return; }
    }
    this.G.terminalDiagnostic = 'Không có ô Exploding Kitten trên mặt bàn.'; this.finishTurn();
  }
  explosion(useDefuse: boolean): boolean {
    if (this.G.phase !== 'ek_choice' || typeof useDefuse !== 'boolean') return false;
    if (useDefuse) {
      const card = this.actor.hand.find(c => c.kind === 'defuse');
      if (!card) return false;
      this.actor.hand = this.actor.hand.filter(c => c.id !== card.id);
      this.G.actionDiscardPile.unshift(card);
      this.note(`Người chơi ${this.current} dùng Defuse và ở nguyên ô.`);
      this.finishTurn(); return true;
    }
    const min = Math.min(...this.G.players.filter(p => !p.forfeited).map(p => p.position));
    if (this.actor.position === min) { this.afterSwap(); return true; }
    const targets = this.G.players.filter(p => !p.forfeited && p.id !== this.current && p.position === min).map(p => p.id);
    if (targets.length > 1) { this.G.swapTargets = targets; this.G.phase = 'swap_choice'; return true; }
    if (targets.length) this.swapWith(targets[0]);
    this.afterSwap(); return true;
  }
  chooseSwap(targetId: string): boolean {
    if (this.G.phase !== 'swap_choice' || !this.G.swapTargets?.includes(targetId)) return false;
    this.swapWith(targetId); this.G.swapTargets = undefined; this.afterSwap(); return true;
  }
  swapWith(targetId: string) {
    const target = this.player(targetId)!;
    [this.actor.position, target.position] = [target.position, this.actor.position];
    this.note(`Người chơi ${this.current} đổi vị trí với ${targetId}; không kích hoạt ô sau đổi.`);
  }
  afterSwap() {
    this.G.phase = this.actor.hand.length > 3 ? 'discard_choice' : 'actions';
    if (this.G.phase === 'actions') this.finishTurn();
  }
  discardToThree(cardIds: string[]): boolean {
    if (this.G.phase !== 'discard_choice' || !Array.isArray(cardIds) ||
      cardIds.some(id => typeof id !== 'string') || cardIds.length !== this.actor.hand.length - 3 ||
      new Set(cardIds).size !== cardIds.length || cardIds.some(id => !this.actor.hand.some(c => c.id === id))) return false;
    const discarded = this.actor.hand.filter(c => cardIds.includes(c.id));
    this.actor.hand = this.actor.hand.filter(c => !cardIds.includes(c.id));
    this.G.actionDiscardPile.unshift(...discarded);
    this.note(`Người chơi ${this.current} bỏ ${discarded.length} Action Cards sau nổ.`);
    this.finishTurn(); return true;
  }
  forfeit(id: string): boolean {
    const player = this.player(id);
    if (!player || player.forfeited || this.G.winnerId) return false;
    player.forfeited = true;
    this.G.actionDiscardPile.unshift(...player.hand); player.hand = [];
    this.note(`Người chơi ${id} rời trận.`);
    const active = this.G.players.filter(p => !p.forfeited);
    if (active.length === 1) { this.G.winnerId = active[0].id; this.G.phase = 'finished'; }
    else if (id === this.current) this.finishTurn();
    return true;
  }
}

export function createBoardState(numPlayers: number, edition: BoardEdition, random: RandomAPI): BoardRaceState {
  const actions = random.Shuffle(actionInventory(edition).map((kind, i) => ({ id: `a${i}`, kind })));
  const players = Array.from({ length: numPlayers }, (_, i) => ({ id: String(i), position: 0,
    hand: actions.splice(0, 5) }));
  const moves = random.Shuffle(MOVE_KINDS.map((kind, i) => ({ id: `m${i}`, kind, faceUp: false })));
  const magnets: BoardDisc[] = Array.from({ length: 10 }, (_, i) => ({ id: `magnet${i}`, kind: 'danger_magnet', faceUp: false }));
  return { ruleset: 'exploding_kittens_board_game', edition, boardSide: 'calm', manifestStatus: 'unverified_manifest',
    players, actionDrawPile: actions, actionDiscardPile: [], moveDrawPile: moves, moveDiscardPile: [],
    availableDangerMagnets: magnets, phase: 'actions', extraTurn: false, turnCount: 0, events: [] };
}

export function boardPlayerView(G: BoardRaceState, playerID: string | null): BoardRaceState {
  return {
    ...G,
    players: G.players.map(p => p.id === playerID ? { ...p, hand: [...p.hand], handCount: p.hand.length } :
      { ...p, hand: [], handCount: p.hand.length }),
    actionDrawPile: G.actionDrawPile.map(() => ({ id: 'hidden', kind: 'hidden' as ActionKind })),
    moveDrawPile: G.moveDrawPile.map((d, i) => d.faceUp ? { ...d } :
      { id: `hidden-${i}`, kind: 'hidden' as MoveKind, faceUp: false }),
    availableDangerMagnets: G.availableDangerMagnets.map(() => ({ id: 'hidden', kind: 'danger_magnet', faceUp: false })),
    privateReveal: G.privateReveal?.owner === playerID ? G.privateReveal : undefined,
    pendingAction: G.pendingAction ? { ...G.pendingAction, magnetIndex: undefined } : undefined,
  };
}

export function validateBoardSetup(data: BoardSetup | undefined, numPlayers: number): string | undefined {
  if (!Number.isInteger(numPlayers) || numPlayers < 2 || numPlayers > 6) return 'Board Game cần 2–6 người chơi.';
  if (data === undefined) return;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'Thiết lập Board Game không hợp lệ.';
  if (data.edition !== undefined && data.edition !== 'classic' && data.edition !== 'super_fan') return 'Edition không hợp lệ.';
  if (data.maxPlayers !== undefined && data.maxPlayers !== numPlayers) return 'Số ghế không khớp.';
  if (data.matchName !== undefined && (typeof data.matchName !== 'string' || !data.matchName.trim() || data.matchName.length > 100)) return 'Tên phòng không hợp lệ.';
}

export const BoardGame: Game<BoardRaceState, Record<string, never>, BoardSetup> = {
  name: BOARD_GAME_NAME, minPlayers: 2, maxPlayers: 6, disableUndo: true,
  validateSetupData: validateBoardSetup,
  setup: ({ ctx, random }, data) => createBoardState(ctx.numPlayers, data?.edition ?? 'classic', random),
  playerView: ({ G, playerID }) => boardPlayerView(G, playerID),
  turn: {
    activePlayers: { all: 'play' },
    order: {
      first: () => 0,
      next: ({ G, ctx }) => {
        for (let offset = 1; offset <= ctx.numPlayers; offset++) {
          const pos = (ctx.playOrderPos + offset) % ctx.numPlayers;
          if (!G.players[Number(ctx.playOrder[pos])].forfeited) return pos;
        }
        return undefined;
      },
    },
    onBegin: ({ G, ctx, random, events }) => { new BoardRace(G, random, events.endTurn, ctx.currentPlayer).startTurn(); },
    stages: { play: { moves: {} } },
  },
  endIf: ({ G }) => G.winnerId ? { winner: G.winnerId } : undefined,
};

// The active-player stage accepts moves from all seats so NOW/Nope works over the network.
// Each handler receives the authenticated action's playerID from boardgame.io.
const playMoves: Record<string, any> = BoardGame.turn!.stages!.play.moves!;
const checked = <A extends unknown[]>(fn: (r: BoardRace, playerID: string, ...args: A) => boolean) =>
  (context: any, ...args: A) => {
    const r = new BoardRace(context.G, context.random, context.events.endTurn, context.ctx.currentPlayer);
    return fn(r, context.playerID, ...args) ? undefined : INVALID_MOVE;
  };
playMoves.playAction = { move: checked((r, id: string, cardId: string, secondId?: string, target?: string, magnetIndex?: number) =>
  r.proposeAction(id, cardId, secondId, target, magnetIndex)), client: false, redact: true };
playMoves.nope = { move: checked((r, id: string, cardId: string) => r.nope(id, cardId)), client: false, redact: true };
playMoves.resolveAction = { move: checked((r, id: string) => r.canAct(id) && r.resolveAction()), client: false };
playMoves.drawMove = { move: checked((r, id: string) => r.canAct(id) && r.drawAndResolve()), client: false };
playMoves.chooseMoveOption = { move: checked((r, id: string, move: boolean) => r.canAct(id) && r.chooseMoveOption(move)), client: false };
playMoves.reorderFuture = { move: checked((r, id: string, ids: string[]) => r.reorderFuture(id, ids)), client: false, redact: true };
playMoves.chooseExplosion = { move: checked((r, id: string, defuse: boolean) => r.canAct(id) && r.explosion(defuse)), client: false };
playMoves.chooseSwap = { move: checked((r, id: string, target: string) => r.canAct(id) && r.chooseSwap(target)), client: false };
playMoves.discardToThree = { move: checked((r, id: string, ids: string[]) => r.canAct(id) && r.discardToThree(ids)), client: false, redact: true };
playMoves.forfeit = { move: checked((r, id: string) => r.forfeit(id)), client: false };
