import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from 'boardgame.io/client';
import { BoardGame, BoardRace, boardPlayerView, createBoardState, type BoardRaceState } from '../src/common/board-game/board-race';
import { actionInventory, type ActionKind, type MoveKind } from '../src/common/board-game/manifest';
import { RIBBON_INDEX } from '../src/common/board-game/track';

const random = { Shuffle: <T>(items: T[]) => [...items], Number: () => .5 } as Parameters<typeof createBoardState>[2];
function fixture(edition: 'classic' | 'super_fan' = 'classic', players = 2) {
  const G = createBoardState(players, edition, random);
  const turns: Array<{ next?: string } | undefined> = [];
  const race = new BoardRace(G, random, arg => { turns.push(arg); }, '0');
  return { G, race, turns };
}
function card(G: BoardRaceState, kind: ActionKind) {
  let pile = G.actionDrawPile;
  let index = pile.findIndex(c => c.kind === kind);
  if (index < 0) {
    const holding = G.players.find(p => p.hand.some(c => c.kind === kind));
    assert.ok(holding, `missing ${kind}`);
    pile = holding.hand;
    index = pile.findIndex(c => c.kind === kind);
  }
  const [found] = pile.splice(index, 1);
  G.players[0].hand.push(found);
  return found;
}
function disc(G: BoardRaceState, kind: MoveKind) {
  const index = G.moveDrawPile.findIndex(d => d.kind === kind);
  assert.ok(index >= 0, `missing ${kind}`);
  const [found] = G.moveDrawPile.splice(index, 1);
  G.moveDrawPile.unshift(found);
  return found;
}

test('BG-01: 2–6 seats, five actions, ten magnets separate, editions have PDF totals', () => {
  assert.equal(actionInventory('classic').length, 64);
  assert.equal(actionInventory('super_fan').length, 72);
  for (const n of [2, 6]) for (const edition of ['classic', 'super_fan'] as const) {
    const { G } = fixture(edition, n);
    assert.equal(G.boardSide, 'calm');
    assert.ok(G.players.every(p => p.position === 0 && p.hand.length === 5));
    assert.equal(G.availableDangerMagnets.length, 10);
    assert.equal(G.moveDrawPile.length, 11);
    assert.equal(G.actionDrawPile.length + n * 5, edition === 'classic' ? 64 : 72);
    assert.equal(G.manifestStatus, 'unverified_manifest');
  }
});

test('BG-02/03/10/11: empty-hand refill, occupied landing, ribbon exact and loop', () => {
  const { G, race } = fixture();
  G.players[0].hand = [];
  race.startTurn();
  assert.equal(G.players[0].hand.length, 3);
  G.players[0].position = RIBBON_INDEX - 3;
  G.players[1].position = RIBBON_INDEX - 1;
  race.move(2);
  assert.equal(G.winnerId, '0'); // occupied predecessor skips into Ribbon
  const next = fixture();
  next.G.players[0].position = RIBBON_INDEX - 2;
  next.race.move(4);
  assert.equal(next.G.players[0].position, 2);
  assert.equal(next.G.winnerId, undefined);
});

test('BG-04/05/06: flip alone never triggers tile; flip-then-move and OR choice', () => {
  const { G, race } = fixture();
  G.players[0].position = 2; // chaos EK, calm number
  race.flip();
  assert.equal(G.phase, 'actions');
  assert.equal(G.players[0].position, 2);
  const d = disc(G, 'move_1_or_flip');
  race.resolveDisc(d);
  assert.equal(G.phase, 'move_choice');
  race.chooseMoveOption(false);
  assert.equal(G.boardSide, 'calm');
  assert.equal(G.players[0].position, 2);
  const later = fixture();
  later.G.players[0].position = 1;
  later.race.resolveDisc(disc(later.G, 'flip_then_move_2'));
  assert.equal(later.G.boardSide, 'chaos');
  assert.equal(later.G.players[0].position, 3);
});

test('BG-07/08/09: Defuse stays, explosion swaps last and discards to three', () => {
  const defused = fixture();
  defused.G.players[0].position = 2;
  defused.G.players[1].position = 0;
  card(defused.G, 'defuse');
  defused.race.move(1);
  assert.equal(defused.G.phase, 'ek_choice');
  assert.equal(defused.race.explosion(true), true);
  assert.equal(defused.G.players[0].position, 3);
  assert.equal(defused.G.actionDiscardPile[0].kind, 'defuse');
  const exploded = fixture();
  exploded.G.players[0].position = 2;
  exploded.G.players[0].hand = exploded.G.actionDrawPile.splice(0, 6);
  exploded.race.move(1);
  exploded.race.explosion(false);
  assert.equal(exploded.G.players[0].position, 0);
  assert.equal(exploded.G.players[1].position, 3);
  assert.equal(exploded.G.phase, 'discard_choice');
  const ids = exploded.G.players[0].hand.slice(0, 3).map(c => c.id);
  assert.equal(exploded.race.discardToThree(ids), true);
  assert.equal(exploded.G.players[0].hand.length, 3);
});

test('BG-12/13/14/15/16: Expose skips face-up; Alter preserves reveal; Shuffle permits empty discard; Ditto rejects; Magnet stays private', () => {
  const { G, race } = fixture();
  const expose = card(G, 'expose_3');
  assert.equal(race.proposeAction('0', expose.id), true); race.resolveAction();
  assert.equal(G.moveDrawPile.filter(d => d.faceUp).length, 3);
  const one = card(G, 'expose_1'); race.proposeAction('0', one.id); race.resolveAction();
  assert.equal(G.moveDrawPile.filter(d => d.faceUp).length, 4);
  const alter = card(G, 'alter_2_now'); race.proposeAction('0', alter.id); race.resolveAction();
  assert.equal(G.phase, 'alter_choice');
  const ids = G.privateReveal!.discIds;
  assert.equal(race.reorderFuture('0', [...ids].reverse()), true);
  assert.equal(G.moveDrawPile[0].faceUp, true);
  const ditto = card(G, 'ditto');
  assert.equal(race.proposeAction('0', ditto.id), false);
  const magnet = card(G, 'add_magnet_now');
  assert.equal(race.proposeAction('0', magnet.id, undefined, undefined, 1), true);
  race.resolveAction();
  assert.equal(G.availableDangerMagnets.length, 9);
  assert.equal(G.moveDrawPile[1].kind, 'danger_magnet');
  assert.equal(boardPlayerView(G, '1').moveDrawPile[1].kind, 'hidden');
  const shuffle = card(G, 'shuffle_now'); race.proposeAction('0', shuffle.id); race.resolveAction();
  assert.ok(G.moveDrawPile.every(d => !d.faceUp));
});

test('BG-17/19/21/22: Mega zero, Slow extra, Charity and Feral pair', () => {
  const mega = fixture();
  mega.G.moveDrawPile = [{ id: 'zero1', kind: 'cut_the_line', faceUp: false }, { id: 'zero2', kind: 'danger_magnet', faceUp: false }];
  mega.G.moveDiscardPile = [];
  const megaCard = card(mega.G, 'mega_move');
  mega.race.proposeAction('0', megaCard.id); mega.race.resolveAction();
  assert.equal(mega.G.players[0].position, 0);
  assert.equal(mega.turns.length, 1);
  const slow = fixture();
  slow.G.players[0].position = 2;
  disc(slow.G, 'move_1');
  const slowCard = card(slow.G, 'slow_steady');
  slow.race.proposeAction('0', slowCard.id); slow.race.resolveAction();
  assert.equal(slow.G.phase, 'ek_choice');
  slow.race.explosion(false);
  if (slow.G.phase === 'discard_choice') slow.race.discardToThree(slow.G.players[0].hand.slice(3).map(c => c.id));
  assert.deepEqual(slow.turns.at(-1), { next: '0' });
  const fan = fixture('super_fan', 3);
  fan.G.players[0].position = 0;
  fan.G.players[1].position = 0;
  fan.G.players[2].position = 4;
  const before = fan.G.players[0].hand.length;
  const charity = card(fan.G, 'charity_case'); fan.race.proposeAction('0', charity.id); fan.race.resolveAction();
  assert.equal(fan.G.players[0].hand.length, before + 1);
  const feral = card(fan.G, 'feral_cat');
  const cat = card(fan.G, 'cat_taco');
  assert.equal(fan.race.proposeAction('0', feral.id, cat.id, '1'), true);
  fan.race.resolveAction();
  assert.equal(fan.G.players[0].hand.some(c => c.id === feral.id), false);
});

test('BG-18/20: Fast Pass ignores skipped effects; three Nope cards toggle pending Action', () => {
  const fast = fixture();
  fast.G.moveDrawPile = [
    { id: 'fast1', kind: 'move_2', faceUp: false },
    { id: 'fast2', kind: 'danger_magnet', faceUp: false },
    { id: 'fast3', kind: 'move_5_or_flip', faceUp: false },
  ];
  fast.G.moveDiscardPile = [];
  const fastCard = card(fast.G, 'fast_pass');
  fast.race.proposeAction('0', fastCard.id); fast.race.resolveAction();
  assert.equal(fast.G.phase, 'move_choice');
  assert.equal(fast.G.pendingDisc?.id, 'fast3');
  assert.equal(fast.G.players[0].position, 0);
  const nopes = fixture();
  const effect = card(nopes.G, 'flip_now');
  const nopeCards = Array.from({ length: 3 }, () => card(nopes.G, 'nope_now'));
  nopes.race.proposeAction('0', effect.id);
  nopeCards.forEach(c => assert.equal(nopes.race.nope('0', c.id), true));
  nopes.race.resolveAction();
  assert.equal(nopes.G.boardSide, 'calm');
  assert.equal(nopes.race.nope('0', nopeCards[0].id), false);
});

test('BG-25/26: player view hides opponent hands, move order and secret insert', () => {
  const { G } = fixture();
  const publicView = boardPlayerView(G, '0');
  assert.equal(publicView.players[1].hand.length, 0);
  assert.equal(publicView.players[1].handCount, 5);
  assert.ok(publicView.moveDrawPile.every(d => d.kind === 'hidden'));
  assert.ok(publicView.actionDrawPile.every(c => c.kind === 'hidden'));
});

test('boardgame.io game accepts a complete normal move in local reducer', () => {
  const client = Client({ game: BoardGame, numPlayers: 2, playerID: '0', debug: false });
  client.start();
  const first = client.getState();
  assert.ok(first?.G);
  assert.equal(first!.G.players.length, 2);
  client.moves.drawMove();
  const after = client.getState();
  assert.ok(after && after._stateID > first!._stateID);
  client.stop();
});

for (const seats of [2, 6]) test(`BG-27: engine-driven ${seats}-seat bot smoke reaches a winner`, () => {
  const client = Client({ game: BoardGame, numPlayers: seats, playerID: '0', debug: false });
  client.start();
  for (let step = 0; step < 1000 && !client.getState()?.ctx.gameover; step++) {
    const before = client.getState()!;
    const G = before.G;
    const id = before.ctx.currentPlayer;
    client.updatePlayerID(id);
    if (G.pendingAction) client.moves.resolveAction();
    else if (G.phase === 'actions') client.moves.drawMove();
    else if (G.phase === 'move_choice') client.moves.chooseMoveOption(true);
    else if (G.phase === 'ek_choice') client.moves.chooseExplosion(G.players[Number(id)].hand.some(c => c.kind === 'defuse'));
    else if (G.phase === 'swap_choice') client.moves.chooseSwap(G.swapTargets![0]);
    else if (G.phase === 'discard_choice') client.moves.discardToThree(G.players[Number(id)].hand.slice(3).map(c => c.id));
    else assert.fail(`unexpected phase: ${G.phase}`);
    assert.ok(client.getState()!._stateID > before._stateID, `stalled at ${G.phase}`);
  }
  assert.ok(client.getState()?.ctx.gameover);
  client.stop();
});
