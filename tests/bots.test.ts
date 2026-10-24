import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate, setTimeout as wait } from 'node:timers/promises';
import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { ExplodingKittens, deckRegistry } from '../src/common';
import { setupGame } from '../src/common/setup/game-setup';
import { KittenBot } from '../src/common/bots/kitten-bot';
import { BOT_DIFFICULTIES, type BotDifficulty } from '../src/common/bots/difficulty';
import * as S from '../src/common/constants/stages';
import type { ClientState } from 'boardgame.io/dist/types/src/client/client';
import type { IGameState } from '../src/common/models';
import { createBotSession } from '../src/client/bots/bot-session';

function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function match(count: number, decks: string[], seed: number) {
  const multiplayer = Local();
  const game = { ...ExplodingKittens, seed: String(seed),
    setup: (context: Parameters<typeof setupGame>[0]) => setupGame(context, { selectedDecks: decks }) };
  const clients = Array.from({ length: count }, (_, i) => Client({
    game, multiplayer, numPlayers: count, matchID: `test-${seed}`, playerID: String(i), debug: false,
  }));
  clients.forEach(c => c.start());
  return clients;
}

test('bots complete games through real engine moves at all difficulties and table sizes', async t => {
  const realNow = Date.now;
  let now = realNow();
  Date.now = () => now;
  try {
    for (const difficulty of Object.keys(BOT_DIFFICULTIES) as BotDifficulty[]) {
      for (const count of [2, 5, 11]) {
        for (const decks of [['original'], deckRegistry.getAll().map(d => d.name)]) {
          await t.test(`${difficulty}, ${count} seats, ${decks.length} decks`, async () => {
            const clients = match(count, decks, count * 31 + BOT_DIFFICULTIES[difficulty].level);
            const bots = clients.map((_, i) => new KittenBot(String(i), difficulty, random(i * 19 + count)));
            const trace: unknown[] = [];
            try {
              await setImmediate();
              clients[0].moves.startGame();
              await setImmediate();
              const initial = clients[0].getState()!;
              for (const player of Object.values(initial.plugins.player.data.players) as { handSize: number }[]) {
                assert.equal(player.handSize, 8, 'every seat starts with eight cards');
              }
              for (let step = 0; step < 3000; step++) {
                if (clients[0].getState()!.ctx.gameover) break;
                const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
                const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
                assert.ok(choice?.next, `stuck at ${JSON.stringify(clients[0].getState()!.ctx)}`);
                const previous = choice.client.getState()!._stateID;
                trace.push({ id: choice.client.playerID, ...choice.next, stage: choice.client.getState()!.ctx.activePlayers });
                if (trace.length > 8) trace.shift();
                if (choice.next.delay) now += choice.next.delay + 1;
                choice.client.moves[choice.next.move](...choice.next.args);
                await setImmediate();
                assert.ok(choice.client.getState()!._stateID > previous,
                  `move rejected: ${JSON.stringify(choice.next)}, ${JSON.stringify(choice.client.getState()!.ctx)}`);
                const raw = (clients[0] as any).transport.master.storageAPI.fetch(`test-${count * 31 + BOT_DIFFICULTIES[difficulty].level}`, { state: true }).state;
                const cards = [...raw.G.piles.drawPile.cards, ...raw.G.piles.discardPile.cards,
                  ...Object.values(raw.plugins.player.data.players).flatMap((p: any) => p.hand), ...(raw.G.towerOfPowerStash ?? [])];
                assert.equal(new Set(cards.map((c: any) => c.id)).size, cards.length,
                  `duplicate card after ${JSON.stringify(trace)}`);
              }
              assert.ok(clients[0].getState()!.ctx.gameover, `game must reach a winner: ${JSON.stringify(trace)}`);
            } finally { clients.forEach(c => c.stop()); }
          });
        }
      }
    }
  } finally { Date.now = realNow; }
});

test('the live bot scheduler plays automatically and cancels work when stopped', async () => {
  const session = createBotSession({ botCount: 10, difficulty: 'asia', playerName: 'Test', selectedDecks: ['original'] });
  const human = Client({ game: session.game, multiplayer: session.multiplayer, numPlayers: session.numPlayers,
    matchID: session.matchID, playerID: '0', debug: false });
  try {
    human.start();
    session.start();
    await setImmediate();
    human.moves.startGame();
    await setImmediate();
    if (human.getState()!.ctx.currentPlayer === '0') {
      // Advance the human seat to isolate automatic scheduling from draw hazards.
      human.events.endTurn!();
      await setImmediate();
    }
    const before = human.getState()!._stateID;
    await wait(900);
    assert.ok(human.getState()!._stateID > before, 'a bot makes its move without human dispatch');
    session.stop();
    const stopped = human.getState()!._stateID;
    await wait(900);
    assert.equal(human.getState()!._stateID, stopped, 'stopping cancels scheduled moves');
  } finally { session.stop(); human.stop(); }
});

test('every interactive stage has an automatic bot response', async () => {
  const clients = match(3, ['original'], 101);
  try {
    await setImmediate();
    clients[0].moves.startGame();
    await setImmediate();
    const original = clients[0].getState()!;
    const expected: Record<string, string> = {
      [S.DEFUSE_EXPLODING_KITTEN]: 'defuseExplodingKitten',
      [S.CHOOSE_PLAYER_TO_STEAL_FROM]: 'stealCard', [S.CHOOSE_PLAYER_TO_REQUEST_FROM]: 'requestCard',
      [S.CHOOSE_PLAYER_FOR_TARGETED_ATTACK]: 'targetedAttack', [S.CHOOSE_PLAYER_FOR_MARK]: 'markPlayer',
      [S.CHOOSE_PLAYER_FOR_CURSE]: 'cursePlayer', [S.CHOOSE_PLAYER_FOR_ILL_TAKE_THAT]: 'selectPlayerForIllTakeThat',
      [S.CHOOSE_PLAYER_FOR_ANNOY]: 'annoyPlayer', [S.CHOOSE_PLAYER_FOR_BLIND]: 'blindPlayer',
      [S.CHOOSE_PLAYER_FOR_DISCARD]: 'discardPlayerCards',
      [S.CHOOSE_CARD_TO_GIVE]: 'giveCard', [S.CHOOSE_CARD_FOR_GARBAGE]: 'giveGarbageCard',
      [S.CHOOSE_CARD_FOR_POTLUCK]: 'givePotluckCard', [S.GIVE_CARD_TO_FEED_DEAD]: 'giveCardToFeedDead',
      [S.CHOOSE_CARD_FOR_GRAVE_ROBBER]: 'giveCardForGraveRobber',
      [S.VIEWING_FUTURE]: 'closeFutureView', [S.VIEWING_FUTURE_5X]: 'closeFutureView',
      [S.VIEWING_FUTURE_1X]: 'closeFutureView', [S.ALTERING_FUTURE]: 'reorderFuture',
      [S.ALTERING_FUTURE_5X]: 'reorderFuture', [S.BURY_CARD]: 'buryCard',
      [S.DIG_DEEPER]: 'takeTopCard', [S.STAGE_LOOK_AT_THE_BOTTOM]: 'moveBottomToTop',
      [S.STAGE_DRAW_FROM_ANYWHERE]: 'drawFromAnywhere', [S.STAGE_HAND_SHUFFLE_DEFENSE]: 'finishHandShuffleDefense',
      [S.SEARCHING_DECK]: 'pickSearchCard',
      [S.CHOOSE_DEAD_PLAYER_FOR_RESURRECTION]: 'resurrectPlayer',
      [S.CHOOSE_DEAD_PLAYER_FOR_FEED]: 'selectDeadPlayerForFeed',
    };
    for (const [stage, move] of Object.entries(expected)) {
      const state: NonNullable<ClientState<IGameState>> = structuredClone(original);
      state.ctx.activePlayers = { '0': stage };
      state.isActive = true;
      state.plugins.player.data.players['2'].isAlive = false;
      state.G.deadPlayers = ['2'];
      state.G.piles.drawPile.cards = [{ id: 999, name: 'skip', index: 0 }];
      state.G.searchTopCards = state.G.piles.drawPile.cards;
      const next = new KittenBot('0', 'asia', () => 0.5).decide(state);
      assert.equal(next?.move, move, stage);
    }
  } finally { clients.forEach(c => c.stop()); }
});

test('Asia plans safe forced draws and bots receive filtered private information', async () => {
  const clients = match(3, ['original'], 202);
  try {
    await setImmediate();
    clients[0].moves.startGame();
    await setImmediate();
    const original = clients[0].getState()!;
    assert.equal(original.G.piles.drawPile.cards.length, 0, 'unseen deck is hidden');
    assert.equal(original.plugins.player.data.players['1'].hand.length, 0, 'opponent hand is hidden');
    assert.equal(original.plugins.player.data.players['0'].hand.length, 8, 'own hand is visible');
    const state = structuredClone(original);
    state.ctx.currentPlayer = '0';
    state.ctx.activePlayers = { '0': S.ALTERING_FUTURE_5X };
    state.G.turnsRemaining = 2;
    state.isActive = true;
    state.G.piles.drawPile.cards = ['exploding_kitten', 'skip', 'defuse', 'exploding_kitten', 'favor']
      .map((name, id) => ({ name, id: 900 + id, index: 0 }));
    const next = new KittenBot('0', 'asia').decide(state)!;
    const order = next.args[0] as number[];
    assert.equal(order.length, 5);
    assert.equal(new Set(order).size, 5);
    assert.ok(order.slice(0, 2).every(i => state.G.piles.drawPile.cards[i].name !== 'exploding_kitten'));
    assert.equal(state.G.piles.drawPile.cards[order[2]].name, 'exploding_kitten', 'trap follows safe draws');
  } finally { clients.forEach(c => c.stop()); }
});
