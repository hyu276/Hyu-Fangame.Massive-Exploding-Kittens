import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:net';
import { setTimeout as wait } from 'node:timers/promises';
import { Client } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { ExplodingKittens } from '../src/common';
import { BoardGame } from '../src/common/board-game/board-race';

async function until(predicate: () => boolean | Promise<boolean>) {
  for (let i = 0; i < 100; i++) { if (await predicate()) return; await wait(50); }
  throw new Error('Timed out waiting for server state');
}

test('production assets, lobby validation, authenticated multiplayer and persistent reconnect', async () => {
  const reservation = createServer();
  await new Promise<void>(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const storage = await mkdtemp(path.join(tmpdir(), 'ek-server-audit-'));
  const base = `http://127.0.0.1:${port}`;
  let logs = '';
  const start = () => {
    const child = spawn(process.execPath, ['dist/server/server/server.js'], {
      cwd: process.cwd(), windowsHide: true,
      env: { ...process.env, NODE_ENV: 'production', PORT: String(port), FLATFILE_DIR: storage },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', chunk => { logs += chunk; });
    child.stderr.on('data', chunk => { logs += chunk; });
    return child;
  };
  let server = start();
  const stopServer = async () => {
    if (server.exitCode !== null) return;
    const stopped = new Promise<void>(resolve => server.once('exit', () => resolve()));
    server.kill();
    await stopped;
  };
  const clients: ReturnType<typeof Client>[] = [];
  const post = (route: string, body: unknown) => fetch(`${base}${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  try {
    await until(async () => { try { return (await fetch(`${base}/health`)).ok; } catch { return false; } });
    const html = await (await fetch(base)).text();
    const asset = html.match(/src="([^"]+\.js)"/)?.[1];
    assert.ok(asset, 'build client before this integration test');
    const js = await fetch(`${base}${asset}`);
    assert.equal(js.status, 200);
    assert.match(js.headers.get('content-type')!, /javascript/);
    assert.equal((await fetch(`${base}/assets/missing.js`)).status, 404);
    assert.equal((await fetch(`${base}/server/server/server.js`)).status, 404);
    assert.equal((await fetch(`${base}/a-match-link`)).status, 200);
    assert.match((await fetch(`${base}/games/not-a-game`)).headers.get('content-type')!, /json/);
    for (const body of [{ numPlayers: 999 },
      { numPlayers: 2, setupData: { selectedDecks: 'original' } },
      { numPlayers: 2, setupData: { selectedDecks: ['unknown'] } }]) {
      const result = await post('/games/Exploding-Kittens/create', body);
      assert.ok(result.status >= 400 && result.status < 500, `reject invalid setup: ${JSON.stringify(body)}`);
    }
    const created = await post('/games/Exploding-Kittens/create', { numPlayers: 3,
      setupData: { matchName: 'Audit isolated match', maxPlayers: 3, selectedDecks: ['original'] } });
    assert.equal(created.status, 200);
    const { matchID } = await created.json() as { matchID: string };
    const seats = [];
    for (let i = 0; i < 3; i++) {
      const result = await post(`/games/Exploding-Kittens/${matchID}/join`, { playerName: `Audit ${i}`, playerID: String(i) });
      assert.equal(result.status, 200);
      seats.push(await result.json() as { playerID: string; playerCredentials: string });
    }
    for (const seat of seats) {
      const client = Client({ game: ExplodingKittens, multiplayer: SocketIO({ server: base }), matchID,
        playerID: seat.playerID, credentials: seat.playerCredentials, numPlayers: 3, debug: false });
      clients.push(client);
      client.start();
    }
    await until(() => clients.every(c => !!c.getState()));
    const lobby = await (await fetch(`${base}/games/Exploding-Kittens`)).json() as { matches: { matchID: string }[] };
    assert.ok(lobby.matches.some(match => match.matchID === matchID));
    clients[0].moves.startGame();
    await until(() => clients.every(c => c.getState()?.ctx.phase === 'play'));
    for (const client of clients) {
      const state = client.getState()!;
      assert.equal(state.G.piles.drawPile.cards.length, 0);
      assert.equal(state.plugins.player.data.players[client.playerID!].hand.length, 8);
    }
    const active = clients.find(c => c.playerID === c.getState()!.ctx.currentPlayer)!;
    const version = active.getState()!._stateID;
    // Simulate crafted packets through the actual socket, bypassing the UI dispatchers.
    const socket = (active as any).transport.socket;
    socket.emit('update', { type: 'GAME_EVENT', payload: { type: 'endGame', args: [{ winner: active.playerID }],
      playerID: active.playerID, credentials: seats[Number(active.playerID)].playerCredentials } }, version, matchID, active.playerID);
    socket.emit('update', { type: 'MAKE_MOVE', payload: { type: 'forfeit', args: [], playerID: '999',
      credentials: seats[Number(active.playerID)].playerCredentials } }, version, matchID, active.playerID);
    await wait(150);
    assert.equal(active.getState()!._stateID, version);
    assert.equal(active.getState()!.ctx.gameover, undefined);
    const hand = active.getState()!.plugins.player.data.players[active.playerID!].hand;
    const playable = hand.findIndex((c: { name: string }) => ['attack', 'skip', 'shuffle', 'see_the_future', 'favor'].includes(c.name));
    assert.ok(playable >= 0);
    active.moves.playCard(playable);
    await until(() => !!active.getState()!.G.piles.pendingCardPlay);
    const owner = active.playerID!;
    active.stop();
    clients.splice(clients.indexOf(active), 1);
    await until(() => clients.every(c => !c.getState()!.G.piles.pendingCardPlay));
    const resumed = Client({ game: ExplodingKittens, multiplayer: SocketIO({ server: base }), matchID,
      playerID: owner, credentials: seats[Number(owner)].playerCredentials, numPlayers: 3, debug: false });
    clients.push(resumed);
    resumed.start();
    await until(() => !!resumed.getState());
    const quitter = clients.find(c => c.playerID !== c.getState()!.ctx.currentPlayer)!;
    quitter.moves.forfeit();
    await until(() => clients.every(c => c.getState()!.G.deadPlayers.includes(quitter.playerID!)));
    const before = clients[0].getState()!._stateID;
    clients.splice(0).forEach(c => c.stop());
    await wait(150);
    await stopServer();
    server = start();
    await until(async () => { try { return (await fetch(`${base}/health`)).ok; } catch { return false; } });
    const restored = Client({ game: ExplodingKittens, multiplayer: SocketIO({ server: base }), matchID,
      playerID: seats[0].playerID, credentials: seats[0].playerCredentials, numPlayers: 3, debug: false });
    clients.push(restored);
    restored.start();
    await until(() => (restored.getState()?._stateID ?? -1) >= before);
    assert.ok(restored.getState()!.G.deadPlayers.includes(quitter.playerID!));
    assert.doesNotMatch(logs, /Move failed|TypeError|UnhandledPromiseRejection/);
  } catch (error) {
    console.error(error, logs);
    throw new Error(`${error instanceof Error ? error.stack : error}\nServer output:\n${logs}`);
  } finally {
    clients.splice(0).forEach(c => c.stop());
    await stopServer();
    // Only this test-created temporary directory is removed.
    assert.ok(path.resolve(storage).startsWith(path.resolve(tmpdir()) + path.sep));
    await rm(storage, { recursive: true, force: true });
  }
});

test('Board Game lobby uses separate 2–6-seat schema and filters secrets over SocketIO', async () => {
  const reservation = createServer();
  await new Promise<void>(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>(resolve => reservation.close(() => resolve()));
  const storage = await mkdtemp(path.join(tmpdir(), 'ek-board-audit-'));
  const base = `http://127.0.0.1:${port}`;
  let logs = '';
  const server = spawn(process.execPath, ['dist/server/server/server.js'], {
    cwd: process.cwd(), windowsHide: true,
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), FLATFILE_DIR: storage },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', chunk => { logs += chunk; });
  server.stderr.on('data', chunk => { logs += chunk; });
  const clients: ReturnType<typeof Client>[] = [];
  const post = (route: string, body: unknown) => fetch(`${base}${route}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  try {
    await until(async () => { try { return (await fetch(`${base}/health`)).ok; } catch { return false; } });
    for (const n of [1, 7]) {
      const bad = await post('/games/Exploding-Kittens-Board-Game/create', { numPlayers: n, setupData: { edition: 'classic' } });
      assert.ok(bad.status >= 400 && bad.status < 500);
    }
    const created = await post('/games/Exploding-Kittens-Board-Game/create', { numPlayers: 2,
      setupData: { edition: 'super_fan', maxPlayers: 2, matchName: 'Board server audit' } });
    assert.equal(created.status, 200);
    const { matchID } = await created.json() as { matchID: string };
    const seats = [];
    for (let i = 0; i < 2; i++) {
      const result = await post(`/games/Exploding-Kittens-Board-Game/${matchID}/join`, { playerName: `Board ${i}`, playerID: String(i) });
      assert.equal(result.status, 200);
      seats.push(await result.json() as { playerID: string; playerCredentials: string });
    }
    for (const seat of seats) {
      const client = Client({ game: BoardGame, multiplayer: SocketIO({ server: base }), matchID,
        playerID: seat.playerID, credentials: seat.playerCredentials, numPlayers: 2, debug: false });
      clients.push(client); client.start();
    }
    await until(() => clients.every(c => !!c.getState()));
    for (const client of clients) {
      const state = client.getState()!;
      assert.equal(state.G.edition, 'super_fan');
      assert.equal(state.G.players[Number(client.playerID)].hand.length, 5);
      assert.equal(state.G.players[1 - Number(client.playerID)].hand.length, 0);
      assert.ok(state.G.moveDrawPile.every(d => d.kind === 'hidden'));
      assert.equal(state.G.availableDangerMagnets.length, 10);
    }
    const actor = clients.find(c => c.playerID === c.getState()!.ctx.currentPlayer)!;
    const version = actor.getState()!._stateID;
    actor.moves.drawMove();
    await until(() => clients.every(c => c.getState()!._stateID > version));
    const drawn = actor.getState()!;
    actor.stop();
    clients.splice(clients.indexOf(actor), 1);
    const seat = seats[Number(actor.playerID)];
    const resumed = Client({ game: BoardGame, multiplayer: SocketIO({ server: base }), matchID,
      playerID: seat.playerID, credentials: seat.playerCredentials, numPlayers: 2, debug: false });
    clients.push(resumed); resumed.start();
    await until(() => (resumed.getState()?._stateID ?? -1) >= drawn._stateID);
    assert.equal(resumed.getState()!.G.phase, drawn.G.phase);
    assert.equal(resumed.getState()!.G.players[Number(seat.playerID)].position, drawn.G.players[Number(seat.playerID)].position);
    assert.doesNotMatch(logs, /Move failed|TypeError|UnhandledPromiseRejection/);
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.stack : error}\nServer output:\n${logs}`);
  } finally {
    clients.forEach(c => c.stop());
    const stopped = new Promise<void>(resolve => server.once('exit', () => resolve()));
    server.kill(); await stopped;
    assert.ok(path.resolve(storage).startsWith(path.resolve(tmpdir()) + path.sep));
    await rm(storage, { recursive: true, force: true });
  }
});
