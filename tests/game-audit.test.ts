import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { ExplodingKittens } from '../src/common';
import { inGame } from '../src/common/moves/in-game';
import { TheGame } from '../src/common/entities/game';
import { startHandShuffleDefense } from '../src/common/moves/hand-shuffle-defense-move';
import { KittenBot } from '../src/common/bots/kitten-bot';
import * as S from '../src/common/constants/stages';
import { validateSetupData } from '../src/common/setup/game-setup';

async function fixture(prepare: (game: TheGame) => void = () => {}, count = 3) {
  const play = ExplodingKittens.phases!.play;
  const game = { ...ExplodingKittens, seed: 'audit', phases: { ...ExplodingKittens.phases,
    play: { ...play, moves: { ...play.moves,
      prepare: { client: false, move: inGame(prepare) },
      fail: { client: false, move: inGame(g => {
        g.players.actingPlayer.removeCardAt(0);
        g.piles.drawPile.removeCardAt(0);
        g.turnManager.endTurn();
        throw new Error('intentional rollback test');
      }) },
    } },
  } };
  const multiplayer = Local();
  const clients = [...Array.from({ length: count }, (_, i) => String(i)), undefined].map(playerID => Client({ game, multiplayer,
    playerID, numPlayers: count, matchID: 'audit', debug: false }));
  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();
  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  const beforePreparation = current().getState()!._stateID;
  current().moves.prepare();
  await setImmediate();
  assert.ok(current().getState()!._stateID > beforePreparation, 'fixture preparation must succeed');
  return { clients, current, spectator: clients[count], stop: () => clients.forEach(c => c.stop()) };
}

function safeCards(g: TheGame, hand: string[] = ['attack', 'skip', 'defuse']) {
  g.gameRules.pendingTimerMs = 3000; // Exercise the reaction window independently of the UI's default.
  for (const p of g.players.allPlayers) {
    p.removeAllCardsFromList();
    hand.forEach(name => p.addCard({ id: g.generateCardId(), name, index: 0 }));
  }
  g.piles.drawPile = Array.from({ length: 30 }, () => ({ id: g.generateCardId(), name: 'skip', index: 0 }));
}

test('invalid moves roll back deck, player plugin and queued turn events atomically', async () => {
  const f = await fixture(g => safeCards(g));
  const originalError = console.error;
  console.error = () => {};
  try {
    const before = structuredClone(f.current().getState()!);
    f.current().moves.fail();
    await setImmediate();
    const after = f.current().getState()!;
    assert.equal(after._stateID, before._stateID);
    assert.deepEqual(after.G, before.G);
    assert.deepEqual(after.plugins.player.data, before.plugins.player.data);
    assert.deepEqual(after.ctx, before.ctx);
  } finally { console.error = originalError; f.stop(); }
});

test('a departed zombie leaves no hand or interaction that can block Grave Robber', async () => {
  let target = '';
  const f = await fixture(g => {
    safeCards(g, ['feed_the_dead', 'zombie_kitten', 'skip']);
    g.gameState.selectedDecks = ['original', 'zombie_kittens'];
    const zombie = g.players.allPlayers.find(p => !p.isCurrentPlayer)!;
    target = zombie.id;
    zombie.eliminate(false);
    g.gameState.graveRobberPending = [target];
    g.turnManager.setActivePlayers({ value: { [target]: S.CHOOSE_CARD_FOR_GRAVE_ROBBER } });
  });
  try {
    const zombie = f.clients.find(c => c.playerID === target)!;
    zombie.moves.forfeit();
    await setImmediate();
    assert.equal(zombie.getState()!.plugins.player.data.players[target].hasLeft, true);
    assert.equal(zombie.getState()!.plugins.player.data.players[target].handSize, 0);
    assert.deepEqual(f.current().getState()!.G.graveRobberPending, []);
    assert.equal(f.current().getState()!.ctx.activePlayers?.[f.current().playerID!], null);
    const state = f.current().getState()!;
    const game = new TheGame({ G: state.G, ctx: state.ctx, playerID: f.current().playerID } as any);
    game.setPlayers(state.plugins.player.data.players);
    assert.equal(game.players.actingPlayer.hand[0].canPlay(), false, 'Feed the Dead needs a target who has not left');
    assert.equal(game.players.actingPlayer.hand[1].canPlay(), false, 'Zombie Kitten cannot revive a departed seat');
  } finally { f.stop(); }
});

test('large original-only tables keep a safe reserve without silently enabling expansions', async () => {
  const originalNames = new Set(['attack', 'skip', 'shuffle', 'favor', 'nope', 'cat_card', 'see_the_future', 'defuse', 'exploding_kitten']);
  const f = await fixture(g => {
    assert.ok(g.piles.drawPile.size >= 22);
    for (const card of [...g.piles.drawPile.allCards, ...g.players.allPlayers.flatMap(p => p.hand)]) {
      assert.ok(originalNames.has(card.name), `unselected expansion card: ${card.name}`);
    }
  }, 11);
  try { assert.deepEqual(f.current().getState()!.G.selectedDecks, ['original']); }
  finally { f.stop(); }
});

test('malformed deck selections are rejected in every mode without throwing', () => {
  for (const gameMode of [0, 1, 2, 3]) {
    assert.equal(validateSetupData({ gameMode, selectedDecks: 'original' as any }, 2), 'Danh sách bộ bài không hợp lệ');
  }
});

test('attack debt is exact, stacks, and keeps the final owed draw on the same player', async () => {
  const now = Date.now;
  let time = now();
  Date.now = () => time;
  const f = await fixture(g => safeCards(g));
  try {
    for (const expected of [2, 4]) {
      f.current().moves.playCard(0);
      await setImmediate();
      time += 3001;
      f.current().moves.resolvePendingCard();
      await setImmediate();
      assert.equal(f.current().getState()!.G.turnsRemaining, expected);
    }
    const attacked = f.current();
    for (let remaining = 4; remaining > 0; remaining--) {
      assert.equal(f.current(), attacked);
      assert.equal(attacked.getState()!.G.turnsRemaining, remaining);
      attacked.moves.drawCard();
      await setImmediate();
    }
    assert.notEqual(f.current(), attacked);
    assert.equal(f.current().getState()!.G.turnsRemaining, 1);
    assert.equal(f.current().getState()!.G.attackChain, false);
  } finally { Date.now = now; f.stop(); }
});

test('forfeit works off-turn without cancelling someone else’s pending card', async () => {
  const f = await fixture(g => safeCards(g));
  try {
    const owner = f.current();
    owner.moves.playCard(0);
    await setImmediate();
    const other = f.clients.find(c => c.playerID && c !== owner)!;
    other.moves.forfeit();
    await setImmediate();
    assert.equal(owner.getState()!.plugins.player.data.players[other.playerID!].isAlive, false);
    assert.ok(owner.getState()!.G.piles.pendingCardPlay);
    assert.equal(owner.getState()!.ctx.currentPlayer, owner.playerID);
  } finally { f.stop(); }
});

test('forfeit during hand defense releases the waiting attacker', async () => {
  let target = '';
  const f = await fixture(g => {
    safeCards(g);
    target = g.players.allPlayers.find(p => !p.isCurrentPlayer)!.id;
    startHandShuffleDefense(g, g.players.currentPlayerId, target, 'steal');
  });
  try {
    f.clients.find(c => c.playerID === target)!.moves.forfeit();
    await setImmediate();
    assert.equal(f.current().getState()!.G.handShuffleDefense, null);
    const before = f.current().getState()!._stateID;
    f.current().moves.drawCard();
    await setImmediate();
    assert.ok(f.current().getState()!._stateID > before);
  } finally { f.stop(); }
});

test('forfeit during a group contribution advances to the remaining participants', async () => {
  let ids: string[] = [];
  const f = await fixture(g => {
    safeCards(g);
    ids = g.players.allPlayers.filter(p => !p.isCurrentPlayer).map(p => p.id);
    g.gameState.potluckPending = ids;
    g.turnManager.setActivePlayers({ value: { [ids[0]]: S.CHOOSE_CARD_FOR_POTLUCK } });
  });
  try {
    f.clients.find(c => c.playerID === ids[0])!.moves.forfeit();
    await setImmediate();
    assert.equal(f.current().getState()!.ctx.activePlayers?.[ids[1]], S.CHOOSE_CARD_FOR_POTLUCK);
    f.clients.find(c => c.playerID === ids[1])!.moves.givePotluckCard(0);
    await setImmediate();
    assert.equal(f.current().getState()!.ctx.activePlayers?.[f.current().playerID!], null);
  } finally { f.stop(); }
});

test('secret Future permutations are redacted from opponent and spectator logs', async () => {
  const f = await fixture(g => {
    safeCards(g);
    g.turnManager.setStage(S.ALTERING_FUTURE, g.players.currentPlayerId);
  });
  try {
    const owner = f.current();
    owner.moves.reorderFuture([2, 0, 1]);
    await setImmediate();
    for (const client of f.clients.filter(c => c !== owner)) {
      const entry = client.getState()!.log.findLast(e => e.action.payload.type === 'reorderFuture');
      assert.equal(entry!.action.payload.args, null);
      assert.equal(client.getState()!.G.piles.drawPile.cards.length, 0);
    }
  } finally { f.stop(); }
});

test('Streaking Kitten protects the draw animation as well as the hand', async () => {
  const f = await fixture(g => {
    safeCards(g, ['streaking_kitten', 'defuse']);
    g.piles.drawPile.rawCards[0].name = 'exploding_kitten';
  });
  try {
    const owner = f.current();
    owner.moves.drawCard();
    await setImmediate();
    for (const client of f.clients.filter(c => c !== owner)) {
      assert.ok(Object.values(client.getState()!.G.animationsQueue).flat().every(animation => !animation.card));
      assert.equal(client.getState()!.plugins.player.data.players[owner.playerID!].hand.length, 0);
    }
  } finally { f.stop(); }
});

test('Imploding Kitten remains face-up after reinsertion and is publicly visible at the top', async () => {
  const f = await fixture(g => {
    safeCards(g);
    g.piles.drawPile.rawCards[0].name = 'imploding_kitten';
  });
  try {
    const owner = f.current();
    owner.moves.drawCard();
    await setImmediate();
    owner.moves.defuseExplodingKitten(0);
    await setImmediate();
    assert.equal(f.spectator.getState()!.G.topDrawCard?.isFaceUp, true);
    assert.equal(f.spectator.getState()!.G.topDrawCard?.name, 'imploding_kitten');
    const victim = f.current();
    victim.moves.drawCard();
    await setImmediate();
    assert.equal(victim.getState()!.plugins.player.data.players[victim.playerID!].isAlive, false);
  } finally { f.stop(); }
});

test('defuse announcements identify the actor and never expose the insertion position', async () => {
  const f = await fixture(g => {
    safeCards(g, ['defuse', 'skip']);
    g.piles.drawPile.rawCards[0].name = 'exploding_kitten';
  });
  try {
    for (const sequence of [1, 2]) {
      const actor = f.current();
      actor.moves.drawCard();
      await setImmediate();
      actor.moves.defuseExplodingKitten(0);
      await setImmediate();
      assert.deepEqual(f.spectator.getState()!.G.lastDefuseSuccess, { playerID: actor.playerID, sequence });
      assert.notEqual(f.current().playerID, actor.playerID);
      assert.equal(f.spectator.getState()!.G.lastDefuseInsertIndex, -1);
    }
  } finally { f.stop(); }
});

test('bots never select a locked Nope even when it precedes an unlocked Nope', async () => {
  const f = await fixture(g => {
    safeCards(g, ['attack', 'nope', 'nope']);
    for (const p of g.players.allPlayers) p.hand[1].setLocked(true);
  });
  try {
    f.current().moves.playCard(0);
    await setImmediate();
    const nextID = f.current().getState()!.ctx.playOrder[(f.current().getState()!.ctx.playOrderPos + 1) % 3];
    const responder = f.clients.find(c => c.playerID === nextID)!;
    const move = new KittenBot(nextID, 'asia', () => 0).decide(responder.getState());
    assert.equal(move?.move, 'playCard');
    assert.deepEqual(move.args, [2]);
  } finally { f.stop(); }
});

test('malformed hand indices cannot corrupt or skip a defense', async () => {
  const f = await fixture(g => { safeCards(g); startHandShuffleDefense(g, g.players.currentPlayerId,
    g.players.allPlayers.find(p => !p.isCurrentPlayer)!.id, 'steal'); });
  try {
    const target = f.current().getState()!.G.handShuffleDefense!.targetPlayerId;
    const defender = f.clients.find(c => c.playerID === target)!;
    const hand = structuredClone(defender.getState()!.plugins.player.data.players[target].hand);
    for (const index of [NaN, -1, 0.5, Infinity, '0']) {
      defender.moves.swapHandCards(index, 1);
      await setImmediate();
      assert.deepEqual(defender.getState()!.plugins.player.data.players[target].hand, hand);
    }
  } finally { f.stop(); }
});
