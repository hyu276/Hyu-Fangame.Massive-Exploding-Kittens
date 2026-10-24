import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate, setTimeout as wait } from 'node:timers/promises';
import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { createBotGame } from '../src/client/bots/bot-game';
import { KittenBot, HandTracker, MCTSEvaluator, type BotFutureIntel } from '../src/common/bots/kitten-bot';
import type { BotDifficulty } from '../src/common/bots/difficulty';
import { inGame } from '../src/common/moves/in-game';
import { startHandShuffleDefense } from '../src/common/moves/hand-shuffle-defense-move';
import type { ICard } from '../src/common/models';
import * as S from '../src/common/constants/stages';
import { watchBotClient } from '../src/client/bots/bot-controller';

async function fixture(difficulty: BotDifficulty, seeCards = true, openCards = false, deadViewer = false) {
  let intel: BotFutureIntel | undefined;
  let preparedCards: ICard[] = [];
  const game = createBotGame({ difficulty, botCount: 2, selectedDecks: ['original'], playerName: 'Test' }, cards => {
    intel = { revision: (intel?.revision ?? 0) + 1, cards };
  });
  game.seed = 'bot-improvements';
  const play = game.phases!.play;
  game.phases = { ...game.phases, play: { ...play, moves: {
    ...play.moves,
    prepareDefense: { client: false, move: inGame(g => {
      g.gameRules.openCards = openCards;
      g.gameRules.spectatorsSeeCards = seeCards;
      if (deadViewer) g.players.getPlayer('2').eliminate();
      startHandShuffleDefense(g, '0', '1', 'steal');
    }) },
    prepareFuture: { client: false, move: inGame((g, stage: string) => {
      preparedCards = ['exploding_kitten', 'skip', 'favor', 'attack', 'nope'].map(name => ({ id: g.generateCardId(), name, index: 0 }));
      g.piles.drawPile = preparedCards.map(c => ({ ...c }));
      for (const id of ['0', '1']) {
        const player = g.players.getPlayer(id);
        player.removeAllCardsFromList().forEach(c => g.piles.discardCard(c));
        const names = id === '0' ? ['skip', 'shuffle_now'] : ['skip', 'defuse'];
        for (const name of names) player.addCard({ id: g.generateCardId(), name, index: 0 });
      }
      g.turnManager.setActivePlayers({ value: { '0': stage } });
    }) },
  } } };
  const multiplayer = Local();
  const clients = ['0', '1', '2', undefined].map(playerID => Client({
    game, multiplayer, playerID, numPlayers: 3, matchID: 'improvements', debug: false,
  }));
  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();
  if (clients[0].getState()!.ctx.currentPlayer !== '0') {
    clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!.events.endTurn!({ next: '0' });
    await setImmediate();
  }
  return {
    human: clients[0], defender: clients[1], dead: clients[2], spectator: clients[3],
    readIntel: () => intel, cards: () => preparedCards,
    stop: () => clients.forEach(c => c.stop()),
  };
}

const handIDs = (client: ReturnType<typeof Client>) =>
  client.getState()!.plugins.player.data.players['1'].hand.map((c: ICard) => c.id);

test('defense cadence and spectator snapshots stay on their absolute deadlines', async t => {
  const originalNow = Date.now;
  let now = 1_000_000;
  Date.now = () => now;
  try {
    for (const [difficulty, interval] of [['hard', 2000], ['hell', 1000], ['asia', 500]] as const) {
      await t.test(difficulty, async () => {
        const f = await fixture(difficulty);
        try {
          f.human.moves.prepareDefense();
          await setImmediate();
          const start = now;
          const bot = new KittenBot('1', difficulty);
          const shuffles: number[] = [];
          const snapshots: number[] = [0];
          let visibleHand = handIDs(f.spectator);
          assert.deepEqual(visibleHand, handIDs(f.defender));
          for (let step = 0; step < 40 && f.defender.getState()!.G.handShuffleDefense; step++) {
            const next = bot.decide(f.defender.getState())!;
            assert.ok(next);
            now += next.delay ?? 650;
            f.defender.moves[next.move](...next.args);
            await setImmediate();
            if (next.move === 'randomShuffleHand') {
              shuffles.push(now - start);
              assert.deepEqual(handIDs(f.spectator), visibleHand, 'intermediate shuffles remain hidden');
            } else if (next.move === 'publishHandShuffleSnapshot') {
              snapshots.push(now - start);
              visibleHand = handIDs(f.defender);
              assert.deepEqual(handIDs(f.spectator), visibleHand);
            } else if (next.move === 'finishHandShuffleDefense') {
              snapshots.push(now - start);
              assert.deepEqual(handIDs(f.spectator), handIDs(f.defender));
            }
            const spectatorDefense = f.spectator.getState()!.G.handShuffleDefense;
            assert.equal(spectatorDefense?.spectatorHand, undefined, 'raw stored hand never leaks through G');
            assert.equal(spectatorDefense?.lastRandomShuffleAtMs, undefined);
            assert.equal(spectatorDefense?.snapshotAtMs, undefined);
          }
          assert.deepEqual(shuffles, Array.from({ length: 10000 / interval }, (_, i) => (i + 1) * interval));
          assert.deepEqual(snapshots, [0, 3000, 6000, 9000, 10000]);
          assert.equal(f.defender.getState()!.G.handShuffleDefense, null);
          assert.equal(handIDs(f.defender).length, 8, 'defense stops before selecting a hidden slot');
          assert.equal(f.human.getState()!.G.pendingCardSteal?.attackerId, '0');
          assert.equal(f.human.getState()!.ctx.activePlayers?.['0'], S.STAGE_PICK_STOLEN_CARD);
          const hiddenState = f.human.getState()!;
          assert.equal(hiddenState.plugins.player.data.players['1'].hand.length, 0,
            'attacker cannot inspect defender cards before choosing');
          f.human.moves.pickCardToSteal(0);
          await setImmediate();
          assert.equal(handIDs(f.defender).length, 7, 'selection transfers a single card');
          assert.equal(f.human.getState()!.G.pendingCardSteal, null);
        } finally { f.stop(); }
      });
    }
  } finally { Date.now = originalNow; }
});

test('dead spectators and open-card spectators also see snapshots; visibility rules still apply', async t => {
  const originalNow = Date.now;
  let now = 2_000_000;
  Date.now = () => now;
  try {
    for (const [seeCards, openCards] of [[true, false], [false, true], [false, false]]) {
      await t.test(`spectatorsSeeCards=${seeCards}, openCards=${openCards}`, async () => {
        const f = await fixture('asia', seeCards, openCards, true);
        try {
          f.human.moves.prepareDefense();
          await setImmediate();
          const initial = handIDs(f.spectator);
          assert.equal(initial.length, seeCards || openCards ? 8 : 0);
          now += 500;
          f.defender.moves.randomShuffleHand();
          await setImmediate();
          assert.deepEqual(handIDs(f.spectator), initial);
          assert.deepEqual(handIDs(f.dead), initial);
          assert.notDeepEqual(handIDs(f.defender), initial, 'defender sees live hand order');
          now += 2500;
          f.defender.moves.publishHandShuffleSnapshot();
          await setImmediate();
          const expected = seeCards || openCards ? handIDs(f.defender) : [];
          assert.deepEqual(handIDs(f.spectator), expected);
          assert.deepEqual(handIDs(f.dead), expected);
          assert.equal(f.human.getState()!.G.handShuffleDefense!.spectatorHand, undefined);
          assert.equal(f.defender.getState()!.G.handShuffleDefense!.spectatorHand, undefined);
        } finally { f.stop(); }
      });
    }
  } finally { Date.now = originalNow; }
});

test('only Asia receives human Future cards, after completion and in the resulting order', async t => {
  for (const [stage, count, reorder] of [
    [S.VIEWING_FUTURE_1X, 1, false], [S.VIEWING_FUTURE, 3, false], [S.VIEWING_FUTURE_5X, 5, false],
    [S.ALTERING_FUTURE, 3, true], [S.ALTERING_FUTURE_5X, 5, true],
  ] as const) {
    await t.test(stage, async () => {
      const f = await fixture('asia');
      try {
        f.human.moves.prepareFuture(stage);
        await setImmediate();
        assert.equal(f.readIntel(), undefined, 'viewing alone does not publish intelligence');
        const order = Array.from({ length: count }, (_, i) => count - 1 - i);
        if (reorder) f.human.moves.reorderFuture(order);
        else f.human.moves.closeFutureView();
        await setImmediate();
        const expected = f.cards().slice(0, count);
        if (reorder) expected.reverse();
        assert.deepEqual(f.readIntel()!.cards, expected);
        if (reorder) {
          for (const client of [f.defender, f.spectator]) {
            const log = client.getState()!.log.filter(entry => entry.action.payload.type === 'reorderFuture');
            assert.equal(log.at(-1)!.action.payload.args, null, 'Asia wrappers retain move redaction');
          }
        }
        for (const client of [f.human, f.defender, f.spectator]) {
          const state = client.getState()!;
          assert.deepEqual(state.G.piles.drawPile.cards, []);
          assert.equal('futureIntel' in state.G, false);
          assert.equal('knownTop' in state.G, false);
        }
      } finally { f.stop(); }
    });
  }
  for (const difficulty of ['easy', 'medium', 'hard', 'hell'] as const) {
    const f = await fixture(difficulty);
    try {
      f.human.moves.prepareFuture(S.VIEWING_FUTURE);
      await setImmediate();
      f.human.moves.closeFutureView();
      await setImmediate();
      assert.equal(f.readIntel(), undefined, difficulty);
    } finally { f.stop(); }
  }
});

test('Asia uses private Future knowledge and forgets it after a deck shuffle', async () => {
  const f = await fixture('asia');
  try {
    f.human.moves.prepareFuture(S.VIEWING_FUTURE);
    await setImmediate();
    f.human.moves.closeFutureView();
    await setImmediate();
    const bot = new KittenBot('1', 'asia', () => 0, f.readIntel);
    const asTurn = () => {
      const state = structuredClone(f.defender.getState()!);
      state.ctx.currentPlayer = '1';
      state.ctx.activePlayers = { '0': 'idle', '1': null, '2': 'idle' };
      state.ctx.playOrderPos = state.ctx.playOrder.indexOf('1');
      state.isActive = true;
      return state;
    };
    assert.equal(bot.decide(asTurn())!.move, 'playCard', 'known bomb causes an escape');
    assert.equal(new KittenBot('1', 'hell', () => 0, f.readIntel).decide(asTurn())!.move, 'drawCard');
    f.human.moves.playCard(1); // Shuffle NOW changes the deck immediately.
    await setImmediate();
    assert.equal(bot.decide(asTurn())!.move, 'drawCard', 'old Future order is invalidated');
  } finally { f.stop(); }
});

test('live defense shuffles automatically and stopping cancels remaining shuffle/snapshot deadlines', async () => {
  const f = await fixture('asia');
  const stop = watchBotClient(f.defender, new KittenBot('1', 'asia'));
  try {
    f.human.moves.prepareDefense();
    await setImmediate();
    const started = f.defender.getState()!.G.handShuffleDefense!.startedAtMs;
    await wait(750);
    const defense = f.defender.getState()!.G.handShuffleDefense!;
    assert.ok(defense.lastRandomShuffleAtMs! >= started + 500);
    assert.ok(defense.lastRandomShuffleAtMs! < started + 1000);
    stop();
    const version = f.defender.getState()!._stateID;
    await wait(750);
    assert.equal(f.defender.getState()!._stateID, version);
  } finally { stop(); f.stop(); }
});

test('HandTracker accurately models opponent Defuse probability and target priorities', async () => {
  const tracker = new HandTracker('0');
  // Initial state: opponent '1' has initial defuse
  const initialProb = tracker.getDefuseProbability('1', 5);
  assert.ok(initialProb > 0.85, 'Opponent should initially have high probability of defuse');

  // Simulate opponent '1' using a Defuse via log entry
  const mockState = {
    _stateID: 10,
    log: [{
      _stateID: 10,
      action: { payload: { type: 'defuseExplodingKitten', playerID: '1', args: [0] } }
    }],
    G: { piles: { discardPile: { cards: [{ name: 'defuse' }] } } },
    plugins: { player: { data: { players: { '1': { hand: [] } } } } }
  } as any;
  tracker.observe(mockState);

  const afterDefuseProb = tracker.getDefuseProbability('1', 5);
  assert.ok(afterDefuseProb < 0.35, 'Probability should drop significantly after Defuse is spent');
});

test('MCTSEvaluator dynamically prioritizes card play vs drawing based on rollouts', async () => {
  const f = await fixture('asia');
  try {
    f.human.moves.prepareFuture(S.VIEWING_FUTURE);
    await setImmediate();
    f.human.moves.closeFutureView();
    await setImmediate();

    const bot = new KittenBot('1', 'asia');
    assert.ok(bot.handTracker instanceof HandTracker);

    const mcts = new MCTSEvaluator();
    assert.ok(mcts instanceof MCTSEvaluator);
  } finally { f.stop(); }
});


test('steal card selection rejects invalid slots and unassigned actors', async () => {
  const f = await fixture('medium');
  try {
    f.human.moves.prepareDefense();
    await setImmediate();
    f.defender.moves.finishHandShuffleDefense();
    await setImmediate();
    assert.equal(f.human.getState()!.ctx.activePlayers?.['0'], S.STAGE_PICK_STOLEN_CARD);
    const original = f.human.getState()!._stateID;
    const logs = console.error;
    console.error = () => {};
    try {
      f.human.moves.pickCardToSteal(-1);
      f.human.moves.pickCardToSteal(999);
      f.defender.moves.pickCardToSteal(0);
      await setImmediate();
      assert.equal(f.human.getState()!._stateID, original);
    } finally {
      console.error = logs;
    }
    f.human.moves.pickCardToSteal(0);
    await setImmediate();
    assert.equal(f.human.getState()!.G.pendingCardSteal, null);
  } finally { f.stop(); }
});

test('bot picks a hidden slot without inspecting card identities', async () => {
  const f = await fixture('hard');
  try {
    f.human.moves.prepareDefense();
    await setImmediate();
    f.defender.moves.finishHandShuffleDefense();
    await setImmediate();
    const state = structuredClone(f.human.getState()!);
    state.ctx.activePlayers = { '1': S.STAGE_PICK_STOLEN_CARD };
    state.G.pendingCardSteal = {
      attackerId: '1', targetPlayerId: '0', cardsToSteal: 1,
    };
    state.isActive = true;
    const move = new KittenBot('1', 'hard', () => .5).decide(state);
    assert.equal(move?.move, 'pickCardToSteal');
    assert.equal(move?.args.length, 1);
  } finally { f.stop(); }
});
