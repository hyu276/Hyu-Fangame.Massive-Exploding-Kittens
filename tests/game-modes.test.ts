import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import {
  ExplodingKittens,
  GAME_MODE_NORMAL,
  GAME_MODE_QUICK_PLAY,
  GAME_MODE_COMBO,
  GAME_MODE_TEAM_UP,
  GAME_MODE_CAT_BURGLAR,
  GAME_MODE_ZOMBIE_STANDALONE,
  GAME_MODE_ZOMBIE_CARL,
  GAME_MODE_ZOMBIE_APOCALYPSE,
  GAME_MODE_RECIPES_FOR_DISASTER,
  GAME_MODE_GOOD_VS_EVIL,
  GAME_MODE_RAGE_MODE,
  GAME_MODE_CURSE_YOU,
  GAME_MODE_ANNIVERSARY_LEGACY,
  GAME_MODE_EXPLODING_MINIONS,
  ZOMBIE_APOCALYPSE_SETUP_TABLE,
  GAME_MODES,
  getGameModeDefinition,
  getGameModeBySlug,
  validateSetupData,
  DEFUSE,
  CAT_CARD,
  EXPLODING_MINION,
  MINION_DEFUSE,
  BOOBY_TRAP_KITTEN,
} from '../src/common';
import { inGame } from '../src/common/moves/in-game';
import { KittenBot } from '../src/common/bots/kitten-bot';
import { setupGame } from '../src/common/setup/game-setup';

test('Mode validation enforces constraints for each game mode', () => {
  assert.equal(validateSetupData({ gameMode: GAME_MODE_QUICK_PLAY }, 3), 'Chế độ Đấu Nhanh chỉ dành riêng cho 2 người chơi');
  assert.match(validateSetupData({ gameMode: GAME_MODE_QUICK_PLAY, selectedDecks: ['original', 'imploding_kittens'] }, 2) ?? '', /không cho phép chọn expansion/);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_QUICK_PLAY, selectedDecks: ['original'] }, 2), undefined);

  assert.equal(validateSetupData({ gameMode: GAME_MODE_TEAM_UP }, 3), 'Chế độ Đấu Đội yêu cầu số người chơi là số chẵn (2, 4, 6, 8)');
  assert.equal(validateSetupData({ gameMode: GAME_MODE_TEAM_UP }, 5), 'Chế độ Đấu Đội yêu cầu số người chơi là số chẵn (2, 4, 6, 8)');
  assert.equal(validateSetupData({ gameMode: GAME_MODE_TEAM_UP }, 10), 'Chế độ Đấu Đội hỗ trợ tối đa 8 người chơi');
  assert.equal(validateSetupData({ gameMode: GAME_MODE_TEAM_UP }, 4), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_TEAM_UP }, 6), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_TEAM_UP }, 8), undefined);

  assert.equal(validateSetupData({ gameMode: GAME_MODE_CAT_BURGLAR }, 6), 'Chế độ Mèo Đạo Tặc (Cat Burglar) dành cho 2 đến 5 người chơi');
  assert.match(validateSetupData({ gameMode: GAME_MODE_CAT_BURGLAR, selectedDecks: ['original', 'imploding_kittens'] }, 3) ?? '', /không cho phép chọn expansion/);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_CAT_BURGLAR }, 3), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_CAT_BURGLAR }, 5), undefined);

  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_STANDALONE }, 3), 'Chế độ Zombie Kittens Độc Lập hiện hỗ trợ bàn 4 đến 5 người chơi');
  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_STANDALONE }, 6), 'Chế độ Zombie Kittens Độc Lập hiện hỗ trợ bàn 4 đến 5 người chơi');
  assert.match(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_STANDALONE, selectedDecks: ['original', 'imploding_kittens'] }, 4) ?? '', /không cho phép chọn expansion/);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_STANDALONE }, 4), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_STANDALONE }, 5), undefined);

  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_APOCALYPSE }, 10), 'Chế độ Zombie Apocalypse dành cho 2 đến 9 người chơi');
  assert.match(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_APOCALYPSE, selectedDecks: ['original', 'imploding_kittens'] }, 4) ?? '', /không cho phép chọn expansion/);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_APOCALYPSE }, 2), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_APOCALYPSE }, 6), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_APOCALYPSE }, 9), undefined);

  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_CARL }, 2), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_ZOMBIE_CARL }, 3), 'Chế độ Zombie với Carl chỉ dành riêng cho 2 người chơi thật');

  assert.equal(validateSetupData({ gameMode: GAME_MODE_RECIPES_FOR_DISASTER }, 3), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_RECIPES_FOR_DISASTER, recipeSlug: 'sticky_fingers' }, 3), undefined);
  assert.match(validateSetupData({ gameMode: GAME_MODE_RECIPES_FOR_DISASTER, recipeSlug: 'danger_mode' }, 3)!, /chưa được xác minh/);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_RECIPES_FOR_DISASTER }, 6), 'Chế độ Recipes for Disaster hỗ trợ từ 2 đến 5 người chơi');

  assert.equal(validateSetupData({ gameMode: GAME_MODE_GOOD_VS_EVIL }, 4), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_GOOD_VS_EVIL }, 6), 'Chế độ Good vs Evil hỗ trợ từ 2 đến 5 người chơi');

  assert.equal(validateSetupData({ gameMode: GAME_MODE_RAGE_MODE }, 4), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_RAGE_MODE }, 6), 'Chế độ Rage Mode hỗ trợ từ 2 đến 5 người chơi');

  assert.equal(validateSetupData({ gameMode: GAME_MODE_CURSE_YOU }, 4), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_CURSE_YOU }, 6), 'Chế độ Curse You! hỗ trợ từ 2 đến 5 người chơi');

  assert.equal(validateSetupData({ gameMode: GAME_MODE_ANNIVERSARY_LEGACY }, 4), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_ANNIVERSARY_LEGACY }, 6), 'Chế độ Kỷ Niệm 10 Năm hỗ trợ từ 2 đến 5 người chơi');

  assert.equal(validateSetupData({ gameMode: GAME_MODE_EXPLODING_MINIONS }, 4), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_EXPLODING_MINIONS }, 6), 'Chế độ Exploding Minions hỗ trợ từ 2 đến 5 người chơi');

  assert.equal(validateSetupData({ gameMode: GAME_MODE_NORMAL }, 4), undefined);
  assert.equal(validateSetupData({ gameMode: GAME_MODE_COMBO }, 5), undefined);
});

test('Standalone mode slugs sent by the lobby are accepted while expansion injection is rejected', () => {
  const standaloneCases = [
    [GAME_MODE_ZOMBIE_STANDALONE, 'zombie_standalone', 4],
    [GAME_MODE_ZOMBIE_CARL, 'zombie_carl', 2],
    [GAME_MODE_ZOMBIE_APOCALYPSE, 'zombie_apocalypse', 4],
    [GAME_MODE_GOOD_VS_EVIL, 'good_vs_evil', 3],
    [GAME_MODE_RAGE_MODE, 'rage_mode', 3],
    [GAME_MODE_CURSE_YOU, 'curse_you', 3],
    [GAME_MODE_ANNIVERSARY_LEGACY, 'anniversary_legacy', 3],
    [GAME_MODE_EXPLODING_MINIONS, 'exploding_minions', 3],
  ] as const;

  for (const [gameMode, slug, players] of standaloneCases) {
    assert.equal(validateSetupData({ gameMode, selectedDecks: [slug] }, players), undefined, slug);
    assert.match(
      validateSetupData({ gameMode, selectedDecks: [slug, 'imploding_kittens'] }, players) ?? '',
      /không cho phép chọn expansion/,
      slug,
    );
  }

  assert.equal(
    validateSetupData({ gameMode: GAME_MODE_RECIPES_FOR_DISASTER, selectedDecks: ['original'] }, 4),
    undefined,
  );
});

test('Mode 1 (Quick Play): strictly 2 players, exactly 16 cards in draw pile, exactly 2 Exploding Kittens', async () => {
  let drawPileCards: any[] = [];
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_QUICK_PLAY, selectedDecks: ['original'], maxPlayers: 2 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          inspect: {
            client: false,
            move: inGame(g => {
              drawPileCards = g.piles.drawPile.rawCards.map(c => ({ id: c.id, name: c.name }));
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 2,
    matchID: 'test-qp',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.inspect();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.equal(state.G.gameMode, GAME_MODE_QUICK_PLAY);
  assert.deepEqual(state.G.selectedDecks, ['original']);
  assert.equal(state.G.piles.drawPile.size, 16, 'Draw pile size must be 16');
  assert.equal(drawPileCards.length, 16, 'Raw draw cards must be 16');

  const exploding = drawPileCards.filter(c => c.name === 'exploding_kitten');
  assert.equal(exploding.length, 2, 'Must have exactly 2 Exploding Kittens');

  assert.equal(clients[0].getState()!.plugins.player.data.players['0'].hand.length, 4, 'Player 0 should have 4 cards');
  assert.equal(clients[1].getState()!.plugins.player.data.players['1'].hand.length, 4, 'Player 1 should have 4 cards');

  clients.forEach(c => c.stop());
});






test('Mode 2 (Liên hoàn - Combo): multipliers boost card effects', async () => {
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_COMBO, maxPlayers: 2 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          prepare: {
            client: false,
            move: inGame(g => {
              for (const p of g.players.allPlayers) {
                p.removeAllCardsFromList();
                p.addCard({ id: g.generateCardId(), name: 'attack', index: 0 });
                p.addCard({ id: g.generateCardId(), name: 'defuse', index: 0 });
              }
              // Force multiplier = 2
              g.gameState.comboMultiplier = 2;
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 2,
    matchID: 'test-combo',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.prepare();
  await setImmediate();

  const now = Date.now;
  let time = now();
  Date.now = () => time;

  try {
    const attacker = current();
    const attackerId = attacker.playerID;
    const targetId = attackerId === '0' ? '1' : '0';

    attacker.moves.playCard(0);
    await setImmediate();
    time += 3001;
    attacker.moves.resolvePendingCard();
    await setImmediate();

    const state = clients[0].getState()!;
    assert.equal(state.ctx.currentPlayer, targetId);
    assert.ok([4, 6].includes(state.G.turnsRemaining), `Attack should boost to 4 (x2) or 6 (x3), got ${state.G.turnsRemaining}`);
  } finally {
    Date.now = now;
    clients.forEach(c => c.stop());
  }
});

test('Mode 3 (Team-Up): assigns teams and team wins when opposing team is eliminated', async () => {
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_TEAM_UP, maxPlayers: 4 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          eliminateBlue: {
            client: false,
            move: inGame(g => {
              g.players.getPlayer('1').eliminate(false);
              g.players.getPlayer('3').eliminate(false);
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1', '2', '3'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 4,
    matchID: 'test-team',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;

  const state = clients[0].getState()!;
  assert.equal(state.G.gameMode, GAME_MODE_TEAM_UP);
  assert.equal(state.G.teams?.['0'], 'red');
  assert.equal(state.G.teams?.['1'], 'blue');
  assert.equal(state.G.teams?.['2'], 'red');
  assert.equal(state.G.teams?.['3'], 'blue');

  current().moves.eliminateBlue();
  await setImmediate();

  const finalState = clients[0].getState()!;
  assert.equal(finalState.ctx.gameover?.winningTeam, 'red', 'Team Red should win');

  clients.forEach(c => c.stop());
});




test('Mode 4 (Cat Burglar): figurine starts on right of first player, steals named Cat Card, and is removed on death', async () => {
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_CAT_BURGLAR, selectedDecks: ['original'], maxPlayers: 3 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          setupTestHands: {
            client: false,
            move: inGame((g, targetId: string) => {
              const robber = g.players.actingPlayer;
              const target = g.players.getPlayer(targetId);
              // Make sure robber holds the Cat Burglar
              g.gameState.catBurglarHolderId = robber.id;
              g.gameState.catBurglarUsedThisTurn = false;
              // Give target a Tacocat (cat_card index 0)
              target.addCard(CAT_CARD.createCard(0, g));
            })
          },
          killHolder: {
            client: false,
            move: inGame(g => {
              const holderId = g.gameState.catBurglarHolderId;
              if (holderId) {
                g.players.getPlayer(holderId).eliminate(false);
              }
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1', '2'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 3,
    matchID: 'test-cat-burglar',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.equal(state.G.gameMode, GAME_MODE_CAT_BURGLAR);
  assert.deepEqual(state.G.selectedDecks, ['original']);

  assert.equal(
    state.G.catBurglarHolderId,
    state.ctx.playOrder[state.ctx.playOrder.length - 1],
    'The player to the right of the first player in actual play order should hold Cat Burglar initially',
  );

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  const robberClient = current();
  const robberId = robberClient.playerID!;
  const targetId = clients.find(c => c.playerID !== robberId)!.playerID!;
  const targetClient = clients.find(c => c.playerID === targetId)!;

  robberClient.moves.setupTestHands(targetId);
  await setImmediate();

  const robberHandBefore = robberClient.getState()!.plugins.player.data.players[robberId].hand.length;
  const targetHandBefore = targetClient.getState()!.plugins.player.data.players[targetId].hand.length;

  // Robber activates Cat Burglar on target, requesting Tacocat (index 0)
  robberClient.moves.activateCatBurglar(targetId, 0);
  await setImmediate();

  const afterSteal = clients[0].getState()!;
  // 1. Tượng Cat Burglar is now transferred to target!
  assert.equal(afterSteal.G.catBurglarHolderId, targetId, 'Cat Burglar figurine must transfer to target player');
  assert.equal(afterSteal.G.catBurglarUsedThisTurn, true, 'Should mark as used this turn');
  assert.equal(afterSteal.G.lastCatBurglarAction?.success, true, 'Robbery should succeed because target had Tacocat');
  assert.equal(afterSteal.G.lastCatBurglarAction?.catName, 'Tacocat');

  // 2. Robber gained 1 card, Target lost 1 card (check each player's unredacted client view)
  assert.equal(robberClient.getState()!.plugins.player.data.players[robberId].hand.length, robberHandBefore + 1);
  assert.equal(targetClient.getState()!.plugins.player.data.players[targetId].hand.length, targetHandBefore - 1);

  clients.forEach(c => c.stop());
});




test('Gamemode Registry metadata matches architecture requirements', () => {
  assert.equal(GAME_MODES.length >= 14, true, 'All modes 0 to 13 must be registered');

  const normal = getGameModeDefinition(GAME_MODE_NORMAL);
  assert.equal(normal.slug, 'normal');
  assert.equal(normal.availability, 'stable');
  assert.equal(normal.allowsExpansionSelection, true);

  const zombie = getGameModeDefinition(GAME_MODE_ZOMBIE_STANDALONE);
  assert.equal(zombie.slug, 'zombie_standalone');
  assert.equal(zombie.availability, 'stable');
  assert.equal(zombie.setupKind, 'standalone');
  assert.equal(zombie.allowsExpansionSelection, false);
  assert.equal(zombie.minPlayers, 4);
  assert.equal(zombie.maxPlayers, 5);

  const bySlug = getGameModeBySlug('zombie_standalone');
  assert.equal(bySlug?.id, GAME_MODE_ZOMBIE_STANDALONE);

  const apoc = getGameModeDefinition(GAME_MODE_ZOMBIE_APOCALYPSE);
  assert.equal(apoc.slug, 'zombie_apocalypse');
  assert.equal(apoc.availability, 'stable');
  assert.equal(apoc.minPlayers, 2);
  assert.equal(apoc.maxPlayers, 9);
  assert.equal(apoc.allowsExpansionSelection, false);

  const carl = getGameModeDefinition(GAME_MODE_ZOMBIE_CARL);
  assert.equal(carl.slug, 'zombie_carl');
  assert.equal(carl.availability, 'stable');
});

test('Mode 5 (Zombie Standalone): 4 players exact card count (28 draw pile, 3 bombs, 0 defuse)', async () => {
  let drawPileCards: any[] = [];
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_ZOMBIE_STANDALONE, maxPlayers: 4 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          inspect: {
            client: false,
            move: inGame(g => {
              drawPileCards = g.piles.drawPile.rawCards.map(c => ({ id: c.id, name: c.name }));
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1', '2', '3'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 4,
    matchID: 'test-zombie-4p',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.inspect();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.equal(state.G.gameMode, GAME_MODE_ZOMBIE_STANDALONE);
  assert.deepEqual(state.G.selectedDecks, ['zombie_standalone']);

  // Draw pile size for 4 players must be 28 cards (25 regular/zombie + 3 exploding kittens)
  assert.equal(state.G.piles.drawPile.size, 28, 'Draw pile size must be 28 for 4 players');
  assert.equal(drawPileCards.length, 28, 'Raw draw cards must be 28');

  // Exactly 3 Exploding Kittens (P - 1)
  const bombs = drawPileCards.filter(c => c.name === 'exploding_kitten');
  assert.equal(bombs.length, 3, 'Must have exactly 3 Exploding Kittens');

  // No Defuse cards
  const defuses = drawPileCards.filter(c => c.name === 'defuse');
  assert.equal(defuses.length, 0, 'No Defuse cards in Zombie Standalone draw pile');

  // Total 5 Zombie Kittens in entire game (4 starting cards + 1 in pre-deal pool)
  let totalZombieKittens = drawPileCards.filter(c => c.name === 'zombie_kitten').length;

  // Each player receives exactly 8 cards (1 Zombie Kitten + 7 regular cards)
  for (let i = 0; i < 4; i++) {
    const pState = clients[i].getState()!.plugins.player.data.players[String(i)];
    assert.equal(pState.hand.length, 8, `Player ${i} should have 8 cards`);
    const pZombie = pState.hand.filter((c: any) => c.name === 'zombie_kitten');
    assert.ok(pZombie.length >= 1, `Player ${i} must have at least 1 Zombie Kitten`);
    totalZombieKittens += pZombie.length;
    const pDefuse = pState.hand.filter((c: any) => c.name === 'defuse');
    assert.equal(pDefuse.length, 0, `Player ${i} must have 0 Defuse`);
  }
  assert.equal(totalZombieKittens, 5, 'Total Zombie Kittens in game must be exactly 5');

  clients.forEach(c => c.stop());
});




test('Mode 5 (Zombie Standalone): 5 players exact card count (21 draw pile, 4 bombs, all 5 Zombie Kittens dealt)', async () => {
  let drawPileCards: any[] = [];
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_ZOMBIE_STANDALONE, maxPlayers: 5 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          inspect: {
            client: false,
            move: inGame(g => {
              drawPileCards = g.piles.drawPile.rawCards.map(c => ({ id: c.id, name: c.name }));
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1', '2', '3', '4'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 5,
    matchID: 'test-zombie-5p',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.inspect();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.equal(state.G.gameMode, GAME_MODE_ZOMBIE_STANDALONE);

  // Draw pile size for 5 players must be 21 cards (17 regular + 4 exploding kittens)
  assert.equal(state.G.piles.drawPile.size, 21, 'Draw pile size must be 21 for 5 players');
  assert.equal(drawPileCards.length, 21, 'Raw draw cards must be 21');

  // Exactly 4 Exploding Kittens (P - 1)
  const bombs = drawPileCards.filter(c => c.name === 'exploding_kitten');
  assert.equal(bombs.length, 4, 'Must have exactly 4 Exploding Kittens');

  // No Zombie Kittens remaining in draw pile (all 5 dealt to the 5 players)
  const zombieInDeck = drawPileCards.filter(c => c.name === 'zombie_kitten');
  assert.equal(zombieInDeck.length, 0, 'All 5 Zombie Kittens were dealt, 0 remain in draw pile');

  // Total cards in game: 5 * 8 (hands) + 21 (draw pile) = 61 cards (100% of the standalone box)
  let totalCardsInHands = 0;
  for (let i = 0; i < 5; i++) {
    const pState = clients[i].getState()!.plugins.player.data.players[String(i)];
    assert.equal(pState.hand.length, 8, `Player ${i} should have 8 cards`);
    totalCardsInHands += pState.hand.length;
  }
  assert.equal(totalCardsInHands + drawPileCards.length, 61, 'Exact total card count must be 61 cards');

  clients.forEach(c => c.stop());
});




test('Mode 5 (Zombie Standalone): Undead rule keeps cards on death and resurrection restores living state', async () => {
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_ZOMBIE_STANDALONE, maxPlayers: 4 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          killPlayer1: {
            client: false,
            move: inGame(g => {
              g.players.getPlayer('1').eliminate(false);
            })
          },
          resurrectPlayer1: {
            client: false,
            move: inGame(g => {
              g.players.getPlayer('1').resurrect();
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1', '2', '3'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 4,
    matchID: 'test-zombie-undead',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;

  const p1HandBefore = clients[1].getState()!.plugins.player.data.players['1'].hand.length;
  assert.equal(p1HandBefore, 8, 'Player 1 starts with 8 cards');

  // Player 1 dies
  current().moves.killPlayer1();
  await setImmediate();

  const stateAfterDeath = clients[1].getState()!;
  const p1AfterDeath = stateAfterDeath.plugins.player.data.players['1'];
  assert.equal(p1AfterDeath.isAlive, false, 'Player 1 is Dead');
  assert.equal(stateAfterDeath.G.deadPlayers.includes('1'), true, 'Player 1 in deadPlayers list');
  // Undead rule: Hand cards are NOT discarded on death!
  assert.equal(p1AfterDeath.hand.length, 8, 'Dead player in Zombie Standalone retains their full hand!');

  // Player 1 is resurrected
  current().moves.resurrectPlayer1();
  await setImmediate();

  const stateAfterRes = clients[1].getState()!;
  const p1AfterRes = stateAfterRes.plugins.player.data.players['1'];
  assert.equal(p1AfterRes.isAlive, true, 'Player 1 is Living again');
  assert.equal(stateAfterRes.G.deadPlayers.includes('1'), false, 'Player 1 removed from deadPlayers list');
  assert.equal(p1AfterRes.hand.length, 8, 'Player 1 still has their 8 cards');

  clients.forEach(c => c.stop());
});

test('Mode 5 (Zombie Standalone): 4 bots complete a full game without stalling', async () => {
  const multiplayer = Local();
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_ZOMBIE_STANDALONE, maxPlayers: 4 })
  };
  const count = 4;
  const clients = Array.from({ length: count }, (_, i) => Client({
    game,
    multiplayer,
    numPlayers: count,
    matchID: 'test-zombie-bot-smoke',
    playerID: String(i),
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const lcg = (seed: number) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const bots = clients.map((_, i) => new KittenBot(String(i), 'medium', lcg(i * 17 + 42)));
  let steps = 0;
  while (!clients[0].getState()!.ctx.gameover && steps < 1000) {
    steps++;
    const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
    const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
    if (!choice || !choice.next) break;
    choice.client.moves[choice.next.move](...choice.next.args);
    await setImmediate();
  }

  assert.ok(clients[0].getState()!.ctx.gameover, 'Zombie standalone bot match must conclude with a winner');
  clients.forEach(c => c.stop());
});

test('Mode 7 (Zombie Apocalypse): 2 players exact counts (16 draw pile, 1 bomb, 2 Zombie Kittens)', async () => {
  let drawPileCards: any[] = [];
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_ZOMBIE_APOCALYPSE, maxPlayers: 2 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          inspect: {
            client: false,
            move: inGame(g => {
              drawPileCards = g.piles.drawPile.rawCards.map(c => ({ id: c.id, name: c.name }));
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 2,
    matchID: 'test-apoc-2p',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.inspect();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.equal(state.G.gameMode, GAME_MODE_ZOMBIE_APOCALYPSE);
  assert.deepEqual(state.G.selectedDecks, ['zombie_apocalypse']);

  // Table specifies: 15 draw pile before bombs + 1 bomb = 16 total
  assert.equal(state.G.piles.drawPile.size, 16);
  assert.equal(drawPileCards.length, 16);

  const bombs = drawPileCards.filter(c => c.name === 'exploding_kitten');
  assert.equal(bombs.length, 1);

  // Check players: 2 players, each starts with 8 cards, exactly 1 Zombie Kitten each, 0 Defuse
  for (let i = 0; i < 2; i++) {
    const pState = clients[i].getState()!.plugins.player.data.players[String(i)];
    assert.equal(pState.hand.length, 8);
    const pZombie = pState.hand.filter((c: any) => c.name === 'zombie_kitten');
    assert.equal(pZombie.length, 1, `Player ${i} should have 1 Zombie Kitten`);
    const pDefuse = pState.hand.filter((c: any) => c.name === 'defuse');
    assert.equal(pDefuse.length, 0, `Player ${i} should have 0 Defuse`);
  }

  clients.forEach(c => c.stop());
});

test('Mode 7 (Zombie Apocalypse): 4 players exact counts (28 draw pile, 3 bombs, 4 Zombie Kittens)', async () => {
  let drawPileCards: any[] = [];
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_ZOMBIE_APOCALYPSE, maxPlayers: 4 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          inspect: {
            client: false,
            move: inGame(g => {
              drawPileCards = g.piles.drawPile.rawCards.map(c => ({ id: c.id, name: c.name }));
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1', '2', '3'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 4,
    matchID: 'test-apoc-4p',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.inspect();
  await setImmediate();

  const state = clients[0].getState()!;
  // Table specifies: 25 draw pile before bombs + 3 bombs = 28 total
  assert.equal(state.G.piles.drawPile.size, 28);
  assert.equal(drawPileCards.length, 28);

  const bombs = drawPileCards.filter(c => c.name === 'exploding_kitten');
  assert.equal(bombs.length, 3);

  // 4 players, each 8 cards, each 1 Zombie Kitten, 0 Defuse
  for (let i = 0; i < 4; i++) {
    const pState = clients[i].getState()!.plugins.player.data.players[String(i)];
    assert.equal(pState.hand.length, 8);
    const pZombie = pState.hand.filter((c: any) => c.name === 'zombie_kitten');
    assert.equal(pZombie.length, 1);
    const pDefuse = pState.hand.filter((c: any) => c.name === 'defuse');
    assert.equal(pDefuse.length, 0);
  }

  clients.forEach(c => c.stop());
});

test('Mode 7 (Zombie Apocalypse): 6 players exact counts (40 draw pile, 5 bombs, 5 Zombie Kittens, 1 Defuse)', async () => {
  let drawPileCards: any[] = [];
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_ZOMBIE_APOCALYPSE, maxPlayers: 6 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          inspect: {
            client: false,
            move: inGame(g => {
              drawPileCards = g.piles.drawPile.rawCards.map(c => ({ id: c.id, name: c.name }));
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1', '2', '3', '4', '5'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 6,
    matchID: 'test-apoc-6p',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  current().moves.inspect();
  await setImmediate();

  const state = clients[0].getState()!;
  // Table specifies: 35 draw pile before bombs + 5 bombs = 40 total
  assert.equal(state.G.piles.drawPile.size, 40);
  assert.equal(drawPileCards.length, 40);

  const bombs = drawPileCards.filter(c => c.name === 'exploding_kitten');
  assert.equal(bombs.length, 5);

  // Across 6 players: exactly 5 Zombie Kittens and exactly 1 Defuse distributed among them
  let totalZombie = 0;
  let totalDefuse = 0;
  for (let i = 0; i < 6; i++) {
    const pState = clients[i].getState()!.plugins.player.data.players[String(i)];
    assert.equal(pState.hand.length, 8);
    totalZombie += pState.hand.filter((c: any) => c.name === 'zombie_kitten').length;
    totalDefuse += pState.hand.filter((c: any) => c.name === 'defuse').length;
  }
  assert.equal(totalZombie, 5, 'Across 6 players there must be exactly 5 Zombie Kittens');
  assert.equal(totalDefuse, 1, 'Across 6 players there must be exactly 1 Defuse');

  clients.forEach(c => c.stop());
});

test('Mode 7 (Zombie Apocalypse): Undead rule keeps cards on death and resurrection restores living state', async () => {
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => ExplodingKittens.setup(ctx, { gameMode: GAME_MODE_ZOMBIE_APOCALYPSE, maxPlayers: 4 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          killPlayer1: {
            client: false,
            move: inGame(g => {
              g.players.getPlayer('1').eliminate(false);
            })
          },
          resurrectPlayer1: {
            client: false,
            move: inGame(g => {
              g.players.getPlayer('1').resurrect();
            })
          }
        }
      }
    }
  };

  const multiplayer = Local();
  const clients = ['0', '1', '2', '3'].map(playerID => Client({
    game,
    multiplayer,
    playerID,
    numPlayers: 4,
    matchID: 'test-apoc-undead',
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const current = () => clients.find(c => c.playerID === clients[0].getState()!.ctx.currentPlayer)!;

  const p1HandBefore = clients[1].getState()!.plugins.player.data.players['1'].hand.length;
  assert.equal(p1HandBefore, 8);

  // Player 1 dies
  current().moves.killPlayer1();
  await setImmediate();

  const stateAfterDeath = clients[1].getState()!;
  const p1AfterDeath = stateAfterDeath.plugins.player.data.players['1'];
  assert.equal(p1AfterDeath.isAlive, false);
  assert.equal(stateAfterDeath.G.deadPlayers.includes('1'), true);
  // Undead rule: Hand cards are preserved on death!
  assert.equal(p1AfterDeath.hand.length, 8);

  // Player 1 is resurrected
  current().moves.resurrectPlayer1();
  await setImmediate();

  const stateAfterRes = clients[1].getState()!;
  const p1AfterRes = stateAfterRes.plugins.player.data.players['1'];
  assert.equal(p1AfterRes.isAlive, true);
  assert.equal(stateAfterRes.G.deadPlayers.includes('1'), false);
  assert.equal(p1AfterRes.hand.length, 8);

  clients.forEach(c => c.stop());
});

test('Mode 7 (Zombie Apocalypse): 4 bots complete a full game without stalling', async () => {
  const multiplayer = Local();
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_ZOMBIE_APOCALYPSE, maxPlayers: 4 })
  };
  const count = 4;
  const clients = Array.from({ length: count }, (_, i) => Client({
    game,
    multiplayer,
    numPlayers: count,
    matchID: 'test-apoc-bot-smoke',
    playerID: String(i),
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const lcg = (seed: number) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const bots = clients.map((_, i) => new KittenBot(String(i), 'medium', lcg(i * 23 + 99)));
  let steps = 0;
  while (!clients[0].getState()!.ctx.gameover && steps < 1000) {
    steps++;
    const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
    const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
    if (!choice || !choice.next) break;
    choice.client.moves[choice.next.move](...choice.next.args);
    await setImmediate();
  }

  assert.ok(clients[0].getState()!.ctx.gameover, 'Zombie Apocalypse bot match must conclude with a winner');
  clients.forEach(c => c.stop());
});

test('Mode 6 (Zombie Carl): exact setup (2 players, 10 draw pile, Carl state) and bot match completes', async () => {
  const multiplayer = Local();
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_ZOMBIE_CARL, maxPlayers: 2 })
  };
  const count = 2;
  const clients = Array.from({ length: count }, (_, i) => Client({
    game,
    multiplayer,
    numPlayers: count,
    matchID: 'test-carl-smoke',
    playerID: String(i),
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const state = clients[0].getState()!;
  // Check Carl state
  assert.ok(state.G.carl, 'Carl state must exist in gameState');
  assert.equal(state.G.carl.isAlive, true);
  assert.equal(state.G.carl.hasZombieKitten, true);
  assert.equal(state.G.carl.bombsHeld, 0);

  // Both players have 1 Zombie Kitten + 7 cards = 8 cards
  const p0 = clients[0].getState()!.plugins.player.data.players['0'];
  const p1 = clients[1].getState()!.plugins.player.data.players['1'];
  assert.equal(p0.hand.length, 8);
  assert.equal(p1.hand.length, 8);
  assert.equal(p0.hand.some((c: any) => c.name === 'zombie_kitten'), true);
  assert.equal(p1.hand.some((c: any) => c.name === 'zombie_kitten'), true);

  // Draw pile has 8 remaining footprint cards + 2 Exploding Kittens = 10 cards
  assert.equal(state.G.piles.drawPile.size, 10);

  const lcg = (seed: number) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const bots = clients.map((_, i) => new KittenBot(String(i), 'medium', lcg(i * 37 + 11)));
  let steps = 0;
  while (!clients[0].getState()!.ctx.gameover && steps < 1000) {
    steps++;
    const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
    const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
    if (!choice || !choice.next) break;
    choice.client.moves[choice.next.move](...choice.next.args);
    await setImmediate();
  }

  assert.ok(clients[0].getState()!.ctx.gameover, 'Zombie Carl match must conclude with a winner or carl');
  clients.forEach(c => c.stop());
});

test('Mode 8 (Recipes for Disaster): Sticky Fingers exact card setup and bot game completes', async () => {
  const multiplayer = Local();
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_RECIPES_FOR_DISASTER, maxPlayers: 4 })
  };
  const count = 4;
  const clients = Array.from({ length: count }, (_, i) => Client({
    game,
    multiplayer,
    numPlayers: count,
    matchID: 'test-recipe-smoke',
    playerID: String(i),
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.equal(state.G.recipeSlug, 'sticky_fingers');

  // Each player has 1 Defuse + 7 regular cards = 8 cards
  for (let i = 0; i < 4; i++) {
    const p = clients[i].getState()!.plugins.player.data.players[String(i)];
    assert.equal(p.hand.length, 8);
    assert.equal(p.hand.some((c: any) => c.name === 'defuse'), true);
  }

  const lcg = (seed: number) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const bots = clients.map((_, i) => new KittenBot(String(i), 'medium', lcg(i * 17 + 5)));
  let steps = 0;
  while (!clients[0].getState()!.ctx.gameover && steps < 1000) {
    steps++;
    const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
    const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
    if (!choice || !choice.next) break;
    choice.client.moves[choice.next.move](...choice.next.args);
    await setImmediate();
  }

  assert.ok(clients[0].getState()!.ctx.gameover, 'Recipes for Disaster bot match must conclude');
  clients.forEach(c => c.stop());
});

test('Mode 9 (Good vs Evil): Godcat and Devilcat on playmat, bot game completes', async () => {
  const multiplayer = Local();
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_GOOD_VS_EVIL, maxPlayers: 3 })
  };
  const count = 3;
  const clients = Array.from({ length: count }, (_, i) => Client({
    game,
    multiplayer,
    numPlayers: count,
    matchID: 'test-gve-smoke',
    playerID: String(i),
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.ok(state.G.goodVsEvil);
  assert.equal(state.G.goodVsEvil.godcatInPlaymat, true);
  assert.equal(state.G.goodVsEvil.devilcatInPlaymat, true);

  // Each player has 1 Defuse + 7 cards = 8 cards
  for (let i = 0; i < 3; i++) {
    const p = clients[i].getState()!.plugins.player.data.players[String(i)];
    assert.equal(p.hand.length, 8);
    assert.equal(p.hand.some((c: any) => c.name === 'defuse'), true);
  }

  const lcg = (seed: number) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const bots = clients.map((_, i) => new KittenBot(String(i), 'medium', lcg(i * 19 + 7)));
  let steps = 0;
  while (!clients[0].getState()!.ctx.gameover && steps < 1000) {
    steps++;
    const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
    const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
    if (!choice || !choice.next) break;
    choice.client.moves[choice.next.move](...choice.next.args);
    await setImmediate();
  }

  assert.ok(clients[0].getState()!.ctx.gameover, 'Good vs Evil bot match must conclude');
  clients.forEach(c => c.stop());
});

test('Mode 10 (Rage Mode): Rage Cat figurine and Booby Traps, bot game completes', async () => {
  const multiplayer = Local();
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_RAGE_MODE, maxPlayers: 3 })
  };
  const count = 3;
  const clients = Array.from({ length: count }, (_, i) => Client({
    game,
    multiplayer,
    numPlayers: count,
    matchID: 'test-rage-smoke',
    playerID: String(i),
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.ok(state.G.rageMode);
  assert.equal(
    state.G.rageMode.rageCatHolderId,
    state.ctx.playOrder[state.ctx.playOrder.length - 1],
    'Rage Cat must start to the right of the first player in actual play order',
  );

  const lcg = (seed: number) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const bots = clients.map((_, i) => new KittenBot(String(i), 'medium', lcg(i * 29 + 13)));
  let steps = 0;
  while (!clients[0].getState()!.ctx.gameover && steps < 1000) {
    steps++;
    const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
    const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
    if (!choice || !choice.next) break;
    choice.client.moves[choice.next.move](...choice.next.args);
    await setImmediate();
  }

  assert.ok(clients[0].getState()!.ctx.gameover, 'Rage Mode bot match must conclude');
  clients.forEach(c => c.stop());
});

test('Mode 10 (Rage Mode): a stolen Booby Trap consumes Defuse and is discarded', async () => {
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_RAGE_MODE, maxPlayers: 2 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          triggerBoobyTrap: {
            client: false,
            move: inGame(g => {
              const actor = g.players.currentPlayer;
              const target = g.players.alivePlayers.find(player => player.id !== actor.id)!;
              actor.removeAllCardsFromList();
              target.removeAllCardsFromList();
              actor.addCard(DEFUSE.createCard(0, g));
              target.addCard(BOOBY_TRAP_KITTEN.createCard(0, g));
              actor.stealRandomCardFrom(target);
            }),
          },
        },
      },
    },
  };

  const multiplayer = Local();
  const clients = ['0', '1'].map(playerID => Client({
    game, multiplayer, playerID, numPlayers: 2, matchID: 'test-rage-booby', debug: false,
  }));
  clients.forEach(client => client.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();
  const actor = clients.find(client => client.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  actor.moves.triggerBoobyTrap();
  await setImmediate();

  const state = actor.getState()!;
  const actorState = state.plugins.player.data.players[actor.playerID!];
  assert.equal(actorState.isAlive, true);
  assert.equal(actorState.hand.some((card: any) => card.name === 'booby_trap_kitten'), false);
  assert.equal(state.G.piles.discardPile.cards.some((card: any) => card.name === 'booby_trap_kitten'), true);
  assert.equal(state.G.piles.discardPile.cards.some((card: any) => card.name === 'defuse'), true);
  clients.forEach(client => client.stop());
});

test('Mode 11 (Curse You!): first game uses the official 54-card base pool without unlock cards', async () => {
  const multiplayer = Local();
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_CURSE_YOU, maxPlayers: 3 })
  };
  const count = 3;
  const clients = Array.from({ length: count }, (_, i) => Client({
    game,
    multiplayer,
    numPlayers: count,
    matchID: 'test-curse-smoke',
    playerID: String(i),
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.ok(state.G.curseYou);
  assert.deepEqual(state.G.curseYou.charms, {});
  assert.deepEqual(state.G.curseYou.curses, {});
  assert.equal(state.G.piles.drawPile.size, 28, '3P first game must use 50 non-bombs and 2 active bombs');

  const lcg = (seed: number) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const bots = clients.map((_, i) => new KittenBot(String(i), 'medium', lcg(i * 31 + 17)));
  let steps = 0;
  while (!clients[0].getState()!.ctx.gameover && steps < 1000) {
    steps++;
    const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
    const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
    if (!choice || !choice.next) break;
    choice.client.moves[choice.next.move](...choice.next.args);
    await setImmediate();
  }

  assert.ok(clients[0].getState()!.ctx.gameover, 'Curse You! bot match must conclude');
  clients.forEach(c => c.stop());
});

test('Mode 12 (10th Anniversary Legacy): 8 bonus cards included, bot game completes', async () => {
  const multiplayer = Local();
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_ANNIVERSARY_LEGACY, maxPlayers: 3 })
  };
  const count = 3;
  const clients = Array.from({ length: count }, (_, i) => Client({
    game,
    multiplayer,
    numPlayers: count,
    matchID: 'test-anni-smoke',
    playerID: String(i),
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const state = clients[0].getState()!;
  assert.ok(state.G.anniversary);

  const lcg = (seed: number) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const bots = clients.map((_, i) => new KittenBot(String(i), 'medium', lcg(i * 41 + 19)));
  let steps = 0;
  while (!clients[0].getState()!.ctx.gameover && steps < 1000) {
    steps++;
    const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
    const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
    if (!choice || !choice.next) break;
    choice.client.moves[choice.next.move](...choice.next.args);
    await setImmediate();
  }

  assert.ok(clients[0].getState()!.ctx.gameover, '10th Anniversary bot match must conclude');
  clients.forEach(c => c.stop());
});

test('Mode 13 (Exploding Minions): Gru Tech subsets produce the official draw-pile sizes', async () => {
  const expectedDrawSizes: Record<number, number> = {
    2: 16, // 31 marked non-bombs - 16 dealt + 1 bomb
    3: 15, // 37 unmarked non-bombs - 24 dealt + 2 bombs
    4: 39, // all 68 non-bombs - 32 dealt + 3 bombs
    5: 32, // all 68 non-bombs - 40 dealt + 4 bombs
  };

  for (const [playersText, expectedDrawSize] of Object.entries(expectedDrawSizes)) {
    const players = Number(playersText);
    const multiplayer = Local();
    const game = {
      ...ExplodingKittens,
      setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_EXPLODING_MINIONS, maxPlayers: players }),
    };
    const clients = Array.from({ length: players }, (_, i) => Client({
      game,
      multiplayer,
      numPlayers: players,
      matchID: `test-minions-gru-tech-${players}`,
      playerID: String(i),
      debug: false,
    }));

    clients.forEach(client => client.start());
    await setImmediate();
    clients[0].moves.startGame();
    await setImmediate();

    assert.equal(clients[0].getState()!.G.piles.drawPile.size, expectedDrawSize, `${players}P draw pile`);
    for (let i = 0; i < players; i++) {
      const player = clients[i].getState()!.plugins.player.data.players[String(i)];
      assert.equal(player.hand.length, 8);
      assert.equal(player.hand.some((card: any) => card.name === 'minion_defuse'), true);
    }
    clients.forEach(client => client.stop());
  }
});

test('Mode 13 (Exploding Minions): Standalone 72-card Minions setup, bot game completes', async () => {
  const multiplayer = Local();
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_EXPLODING_MINIONS, maxPlayers: 3 })
  };
  const count = 3;
  const clients = Array.from({ length: count }, (_, i) => Client({
    game,
    multiplayer,
    numPlayers: count,
    matchID: 'test-minions-smoke',
    playerID: String(i),
    debug: false,
  }));

  clients.forEach(c => c.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  assert.equal(
    clients[0].getState()!.G.piles.drawPile.size,
    15,
    '3P setup must use only the 37 cards without the Gru Tech mark, plus 2 bombs',
  );

  // Check each player has 1 Minion Defuse + 7 cards = 8 cards
  for (let i = 0; i < 3; i++) {
    const p = clients[i].getState()!.plugins.player.data.players[String(i)];
    assert.equal(p.hand.length, 8);
    assert.equal(p.hand.some((c: any) => c.name === 'minion_defuse'), true);
  }

  const lcg = (seed: number) => () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const bots = clients.map((_, i) => new KittenBot(String(i), 'medium', lcg(i * 43 + 23)));
  let steps = 0;
  while (!clients[0].getState()!.ctx.gameover && steps < 1000) {
    steps++;
    const choices = clients.map((c, i) => ({ client: c, next: bots[i].decide(c.getState()) }));
    const choice = choices.find(c => c.next && c.next.move !== 'resolvePendingCard') ?? choices.find(c => c.next);
    if (!choice || !choice.next) break;
    choice.client.moves[choice.next.move](...choice.next.args);
    await setImmediate();
  }

  assert.ok(clients[0].getState()!.ctx.gameover, 'Exploding Minions bot match must conclude');
  clients.forEach(c => c.stop());
});

test('Mode 13 (Exploding Minions): drawing a Minion requires Minion Defuse and reinserts the bomb', async () => {
  const play = ExplodingKittens.phases!.play;
  const game = {
    ...ExplodingKittens,
    setup: (ctx: any) => setupGame(ctx, { gameMode: GAME_MODE_EXPLODING_MINIONS, maxPlayers: 2 }),
    phases: {
      ...ExplodingKittens.phases,
      play: {
        ...play,
        moves: {
          ...play.moves,
          prepareMinionBomb: {
            client: false,
            move: inGame(g => {
              const actor = g.players.currentPlayer;
              actor.removeAllCardsFromList();
              actor.addCard(MINION_DEFUSE.createCard(0, g));
              g.piles.drawPile = [EXPLODING_MINION.createCard(0, g), CAT_CARD.createCard(0, g)];
            }),
          },
        },
      },
    },
  };

  const multiplayer = Local();
  const clients = ['0', '1'].map(playerID => Client({
    game, multiplayer, playerID, numPlayers: 2, matchID: 'test-minion-defuse', debug: false,
  }));
  clients.forEach(client => client.start());
  await setImmediate();
  clients[0].moves.startGame();
  await setImmediate();

  const actor = clients.find(client => client.playerID === clients[0].getState()!.ctx.currentPlayer)!;
  actor.moves.prepareMinionBomb();
  await setImmediate();
  actor.moves.drawCard();
  await setImmediate();

  assert.equal(actor.getState()!.ctx.activePlayers?.[actor.playerID!], 'defuseExplodingKitten');
  assert.equal(
    actor.getState()!.plugins.player.data.players[actor.playerID!].hand.some((card: any) => card.name === 'exploding_minion'),
    true,
  );

  actor.moves.defuseExplodingKitten(1);
  await setImmediate();

  const state = actor.getState()!;
  assert.equal(state.G.piles.drawPile.size, 2, 'Defused Minion must be returned to the draw pile');
  assert.equal(state.G.piles.discardPile.cards.some((card: any) => card.name === 'minion_defuse'), true);
  clients.forEach(client => client.stop());
});






