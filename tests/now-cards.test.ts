import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import {
  ExplodingKittens,
  NAME_SHUFFLE_NOW,
  NAME_ALTER_THE_FUTURE_3X_NOW,
  NAME_ATTACK,
  ALTERING_FUTURE,
  RESPOND_WITH_NOW_CARD,
  GAME_MODE_ZOMBIE_STANDALONE,
} from '../src/common';
import { inGame } from '../src/common/moves/in-game';
import { TheGameClient } from '../src/client/entities/game-client';

test('NOW cards: Off-turn player can play Shuffle NOW at any time', async () => {
  const play = ExplodingKittens.phases!.play as any;
  const game = {
    ...ExplodingKittens,
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          giveShuffleNow: {
            client: false,
            move: inGame(g => {
              const offTurn = g.players.allPlayers.find(p => p.id !== g.players.currentPlayerId)!;
              offTurn.addCard({ id: g.generateCardId(), name: NAME_SHUFFLE_NOW, index: 0 });
            }),
          },
        },
      },
    },
  };

  const multiplayer = Local();
  const clients = ['0', '1'].map(playerID =>
    Client({
      game,
      multiplayer,
      playerID,
      numPlayers: 2,
      matchID: 'test-shuffle-now',
      debug: false,
    })
  );

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.giveShuffleNow();
  await setImmediate();

  const currentTurn = clients[0].getState()!.ctx.currentPlayer;
  const offTurnClient = clients.find(c => c.playerID !== currentTurn)!;
  const offTurnId = offTurnClient.playerID!;

  // Lấy chỉ số lá bài Shuffle NOW trên tay người ngoài lượt
  const offTurnHand = offTurnClient.getState()!.plugins.player.data.players[offTurnId].hand;
  const shuffleNowIdx = offTurnHand.findIndex((c: any) => c.name === NAME_SHUFFLE_NOW);
  assert.ok(shuffleNowIdx !== -1, 'Player must have Shuffle NOW in hand');

  // Người ngoài lượt thực hiện đánh lá Shuffle NOW
  offTurnClient.moves.playCard(shuffleNowIdx);
  await setImmediate();

  const stateAfter = clients[0].getState()!;
  // Lượt chơi vẫn thuộc về currentTurn ban đầu
  assert.equal(stateAfter.ctx.currentPlayer, currentTurn);

  // Lá bài Shuffle NOW đã được đưa vào chồng bài bỏ
  const discardTop = stateAfter.G.piles.discardPile.cards.slice(-1)[0];
  assert.equal(discardTop.name, NAME_SHUFFLE_NOW);

  clients.forEach(c => c.stop());
});

test('NOW cards: Off-turn player is rejected when attempting to play non-NOW card', async () => {
  const play = ExplodingKittens.phases!.play as any;
  const game = {
    ...ExplodingKittens,
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          giveAttack: {
            client: false,
            move: inGame(g => {
              const offTurn = g.players.allPlayers.find(p => p.id !== g.players.currentPlayerId)!;
              offTurn.addCard({ id: g.generateCardId(), name: NAME_ATTACK, index: 0 });
            }),
          },
        },
      },
    },
  };

  const multiplayer = Local();
  const clients = ['0', '1'].map(playerID =>
    Client({
      game,
      multiplayer,
      playerID,
      numPlayers: 2,
      matchID: 'test-reject-non-now',
      debug: false,
    })
  );

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.giveAttack();
  await setImmediate();

  const currentTurn = clients[0].getState()!.ctx.currentPlayer;
  const offTurnClient = clients.find(c => c.playerID !== currentTurn)!;
  const offTurnId = offTurnClient.playerID!;

  const offTurnHandBefore = offTurnClient.getState()!.plugins.player.data.players[offTurnId].hand;
  const attackIdx = offTurnHandBefore.findIndex((c: any) => c.name === NAME_ATTACK);
  assert.ok(attackIdx !== -1, 'Player must have Attack in hand');

  const discardLenBefore = clients[0].getState()!.G.piles.discardPile.cards.length;

  // Cố gắng đánh ngoài lượt
  offTurnClient.moves.playCard(attackIdx);
  await setImmediate();

  // Bị từ chối: Chồng bài bỏ không tăng thêm và lá bài vẫn còn trên tay
  const stateAfter = clients[0].getState()!;
  assert.equal(stateAfter.G.piles.discardPile.cards.length, discardLenBefore);
  const handAfter = offTurnClient.getState()!.plugins.player.data.players[offTurnId].hand;
  assert.equal(handAfter.length, offTurnHandBefore.length);

  clients.forEach(c => c.stop());
});

test('NOW cards: Off-turn player can play Alter the Future (3x) NOW and reorder', async () => {
  const play = ExplodingKittens.phases!.play as any;
  const game = {
    ...ExplodingKittens,
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          prepareAlter: {
            client: false,
            move: inGame(g => {
              const offTurn = g.players.allPlayers.find(p => p.id !== g.players.currentPlayerId)!;
              offTurn.addCard({ id: g.generateCardId(), name: NAME_ALTER_THE_FUTURE_3X_NOW, index: 0 });
              g.piles.drawPile.state.cards[0] = { id: 101, name: 'skip', index: 0 };
              g.piles.drawPile.state.cards[1] = { id: 102, name: 'attack', index: 1 };
              g.piles.drawPile.state.cards[2] = { id: 103, name: 'favor', index: 2 };
              g.piles.drawPile.updateSize();
            }),
          },
        },
      },
    },
  };

  const multiplayer = Local();
  const clients = ['0', '1'].map(playerID =>
    Client({
      game,
      multiplayer,
      playerID,
      numPlayers: 2,
      matchID: 'test-alter-now',
      debug: false,
    })
  );

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.prepareAlter();
  await setImmediate();

  const currentTurn = clients[0].getState()!.ctx.currentPlayer;
  const offTurnClient = clients.find(c => c.playerID !== currentTurn)!;
  const offTurnId = offTurnClient.playerID!;

  const offTurnHand = offTurnClient.getState()!.plugins.player.data.players[offTurnId].hand;
  const alterIdx = offTurnHand.findIndex((c: any) => c.name === NAME_ALTER_THE_FUTURE_3X_NOW);
  assert.ok(alterIdx !== -1, 'Player must have Alter the Future (3x) NOW');

  // Đánh Alter the Future 3x NOW
  offTurnClient.moves.playCard(alterIdx);
  await setImmediate();

  // Người ngoài lượt phải bước vào giai đoạn alteringFuture
  let state = offTurnClient.getState()!;
  assert.equal(state.ctx.activePlayers?.[offTurnId], ALTERING_FUTURE);

  // Sắp xếp lại thứ tự thành [2, 1, 0]
  offTurnClient.moves.reorderFuture([2, 1, 0]);
  await setImmediate();

  state = offTurnClient.getState()!;
  // Giai đoạn kết thúc, lượt tiếp tục cho currentTurn ban đầu
  assert.equal(state.ctx.currentPlayer, currentTurn);
  assert.equal(state.ctx.activePlayers?.[offTurnId], RESPOND_WITH_NOW_CARD);

  // Người chơi hiện tại rút bài: phải rút đúng lá có id = 103 (do đã được đảo lên đỉnh)
  const currentClient = current();
  currentClient.moves.drawCard();
  await setImmediate();

  const currentHand = currentClient.getState()!.plugins.player.data.players[currentTurn].hand;
  const drawnCard = currentHand.slice(-1)[0];
  assert.equal(drawnCard.id, 103, 'The drawn card must be the reordered top card (id 103)');

  clients.forEach(c => c.stop());
});

test('NOW cards: Dead player in Zombie mode can play Shuffle NOW', async () => {
  let targetDeadId = '1';
  const play = ExplodingKittens.phases!.play as any;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_ZOMBIE_STANDALONE, maxPlayers: 4 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          prepareZombieDeath: {
            client: false,
            move: inGame(g => {
              const target = g.players.allPlayers.find(p => p.id !== g.players.currentPlayerId)!;
              targetDeadId = target.id;
              target.addCard({ id: g.generateCardId(), name: NAME_SHUFFLE_NOW, index: 0 });
              target.eliminate(false);
            }),
          },
        },
      },
    },
  };

  const multiplayer = Local();
  const clients = ['0', '1', '2', '3'].map(playerID =>
    Client({
      game,
      multiplayer,
      playerID,
      numPlayers: 4,
      matchID: 'test-zombie-now',
      debug: false,
    })
  );

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.prepareZombieDeath();
  await setImmediate();

  const deadClient = clients.find(c => c.playerID === targetDeadId)!;
  const deadPlayerState = deadClient.getState()!.plugins.player.data.players[targetDeadId];
  assert.equal(deadPlayerState.isAlive, false, 'Player must be dead');

  const deadHand = deadPlayerState.hand;
  const shuffleNowIdx = deadHand.findIndex((c: any) => c.name === NAME_SHUFFLE_NOW);
  assert.ok(shuffleNowIdx !== -1, 'Dead player must have Shuffle NOW');

  // Người chết đánh lá Shuffle NOW
  deadClient.moves.playCard(shuffleNowIdx);
  await setImmediate();

  const stateAfter = clients[0].getState()!;
  const discardTop = stateAfter.G.piles.discardPile.cards.slice(-1)[0];
  assert.equal(discardTop.name, NAME_SHUFFLE_NOW);

  clients.forEach(c => c.stop());
});

test('NOW cards: Card artwork textures resolve correctly across all indices', () => {
  // Alter the Future (3x) NOW có 4 ảnh: 0.png đến 3.png
  for (let i = 0; i < 4; i++) {
    const tex = TheGameClient.getCardTexture({ id: i, name: NAME_ALTER_THE_FUTURE_3X_NOW, index: i });
    assert.equal(tex, `/assets/cards/alter_the_future_3x_now/${i}.png`);
  }

  // Shuffle NOW có 6 ảnh: 0.png đến 5.png
  for (let i = 0; i < 6; i++) {
    const tex = TheGameClient.getCardTexture({ id: i, name: NAME_SHUFFLE_NOW, index: i });
    assert.equal(tex, `/assets/cards/shuffle_now/${i}.png`);
  }
});
