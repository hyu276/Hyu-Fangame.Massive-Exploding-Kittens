import {Game} from 'boardgame.io';
import {Stage} from 'boardgame.io/core';
import {createPlayerPlugin} from './plugins/player-plugin';
import {setupGame, validateSetupData, normalizeDecks} from './setup/game-setup';
import type {IContext, IGameState, IPluginAPIs} from './models';
import {drawCard} from "./moves/draw-move";
import {forfeit} from "./moves/forfeit-move";
import {playCard, playNowCard, resolvePendingCard} from "./moves/play-card-move";
import {requestCard, giveCard} from "./moves/favor-card-move";
import {closeFutureView} from "./moves/see-future-move";
import {inGame} from "./moves/in-game";
import {turnOrder} from "./utils/turn-order";
import {OriginalDeck} from './entities/deck-types/original-deck';
import {deckRegistry} from './registries/deck-registry';
import {dealHands, shouldSeeAllCards} from './setup/player-setup';
import {defuseExplodingKitten} from "./moves/defuse-exploding-kitten";
import {TheGame} from "./entities/game";
import {reorderFuture} from "./moves/alter-future-move";
import {targetedAttack} from "./moves/targeted-attack-move";
import {stealCard} from "./moves/steal-card-move";
import {markPlayer} from "./moves/mark-player-move";
import {cursePlayer} from "./moves/curse-player-move";
import {annoyPlayer} from "./moves/annoy-player-move";
import {blindPlayer} from "./moves/blind-player-move";
import {discardPlayerCards} from "./moves/discard-player-move";
import {pickSearchCard} from "./moves/search-move";
import {giveGarbageCard} from "./moves/garbage-collection-move";
import {selectPlayerForIllTakeThat} from "./moves/ill-take-that-move";
import {givePotluckCard} from "./moves/potluck-move";
import {buryCard} from "./moves/bury-move";
import {resurrectPlayer} from "./moves/zombie-kitten-move";
import {takeTopCard, takeSecondCard} from "./moves/dig-deeper-move";
import {selectDeadPlayerForFeed, giveCardToFeedDead} from "./moves/feed-the-dead-move";
import {giveCardForGraveRobber} from "./moves/grave-robber-move";
import {keepAtBottom, moveBottomToTop} from "./moves/look-at-the-bottom-move";
import {drawFromAnywhere} from "./moves/draw-from-anywhere-move";
import {
  swapHandCards,
  randomShuffleHand,
  publishHandShuffleSnapshot,
  finishHandShuffleDefense
} from "./moves/hand-shuffle-defense-move";
import {GAME_OVER, PLAY} from "./constants/phases";
import {
  ALTERING_FUTURE,
  ALTERING_FUTURE_5X,
  BURY_CARD,
  CHOOSE_CARD_FOR_GARBAGE,
  CHOOSE_CARD_FOR_POTLUCK,
  CHOOSE_PLAYER_FOR_CURSE,
  CHOOSE_PLAYER_FOR_ILL_TAKE_THAT,
  CHOOSE_PLAYER_FOR_MARK,
  CHOOSE_PLAYER_FOR_TARGETED_ATTACK,
  VIEWING_FUTURE,
  VIEWING_FUTURE_5X,
  WAITING_FOR_START,
  DIG_DEEPER,
  CHOOSE_DEAD_PLAYER_FOR_RESURRECTION,
  CHOOSE_DEAD_PLAYER_FOR_FEED,
  GIVE_CARD_TO_FEED_DEAD,
  CHOOSE_CARD_FOR_GRAVE_ROBBER,
  STAGE_LOOK_AT_THE_BOTTOM,
  STAGE_DRAW_FROM_ANYWHERE,
  STAGE_HAND_SHUFFLE_DEFENSE,
  CHOOSE_PLAYER_FOR_ANNOY,
  VIEWING_FUTURE_1X,
  SEARCHING_DECK,
  CHOOSE_PLAYER_FOR_BLIND,
  CHOOSE_PLAYER_FOR_DISCARD,
  RESPOND_WITH_NOW_CARD,
} from "./constants/stages";
import {NAME_DEFUSE_TIMEBOMB} from "./constants/cards";
import {
  EXPLODING_KITTEN,
  DEFUSE,
  ZOMBIE_KITTEN,
  ATTACK,
  SKIP,
  FAVOR,
  SHUFFLE,
  SEE_THE_FUTURE,
  NOPE,
  CAT_CARD
} from "./registries/card-registry";
import {
  GAME_MODE_QUICK_PLAY,
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
  getGameModeDefinition
} from "./constants/game-modes";
import {
  setupZombieStandaloneDeck,
  setupZombieApocalypseDeck,
  setupZombieCarlDeck,
  setupRecipesForDisasterDeck,
  setupGoodVsEvilDeck,
  setupRageModeDeck,
  setupCurseYouDeck,
  setupAnniversaryLegacyDeck,
  setupExplodingMinionsDeck
} from "./setup/mode-setup";
import { activateCatBurglar } from "./moves/cat-burglar-move";
import { activateRageCat } from "./moves/rage-cat-move";
import { normalizeViewerID } from './utils/viewer-id';
import { IDLE_STAGE } from './entities/turn-manager';

export const ExplodingKittens: Game<IGameState, IPluginAPIs> = {
  name: "Exploding-Kittens",

  plugins: [createPlayerPlugin()],

  setup: setupGame,
  minPlayers: 2,
  maxPlayers: 11,
  validateSetupData,

  disableUndo: true,

  endIf: (context: IContext) => {
    const game = new TheGame(context);
    if (game.gameState.gameMode === GAME_MODE_TEAM_UP) {
      if (game.isGameOver() || game.gameState.winningTeam) {
        return {
          winner: game.players.winner ? game.players.winner.id : undefined,
          winningTeam: game.gameState.winningTeam
        };
      }
      if (game.isPlayingPhase()) {
        const alive = game.players.alivePlayers;
        const redAlive = alive.filter(p => game.gameState.teams?.[p.id] === 'red');
        const blueAlive = alive.filter(p => game.gameState.teams?.[p.id] === 'blue');
        if (redAlive.length === 0 || blueAlive.length === 0) {
          const winningTeam = redAlive.length > 0 ? 'red' : 'blue';
          const winner = redAlive[0] || blueAlive[0];
          return {
            winner: winner ? winner.id : undefined,
            winningTeam
          };
        }
      }
      return;
    }

    if (game.gameState.gameMode === GAME_MODE_ZOMBIE_CARL) {
      if (game.isPlayingPhase()) {
        const aliveHumans = game.players.alivePlayers;
        const carlAlive = game.gameState.carl?.isAlive ?? false;
        if (aliveHumans.length === 0 && carlAlive) {
          return { winner: 'carl' };
        }
        if (aliveHumans.length === 1 && !carlAlive) {
          return { winner: aliveHumans[0].id };
        }
        if (aliveHumans.length === 0 && !carlAlive) {
          return { winner: undefined };
        }
      }
      return;
    }

    if (game.isGameOver() || (game.isPlayingPhase() && game.players.alivePlayers.length === 1)) {
      const winner = game.players.winner || game.players.alivePlayers[0];
      return { winner: winner ? winner.id : undefined };
    }
  },

  playerView: ({ G, ctx, playerID }) => {
    playerID = normalizeViewerID(playerID) ?? null;
    const context = { G, ctx, playerID } as IContext;
    const game = new TheGame(context);
    const canSeeCards = shouldSeeAllCards(game);

    const isViewingFuture1x = playerID ? game.turnManager.isInStage(playerID, VIEWING_FUTURE_1X) : false;
    const isViewingFuture3x = playerID ? (game.turnManager.isInStage(playerID, VIEWING_FUTURE) || game.turnManager.isInStage(playerID, ALTERING_FUTURE)) : false;
    const isViewingFuture5x = playerID ? (game.turnManager.isInStage(playerID, VIEWING_FUTURE_5X) || game.turnManager.isInStage(playerID, ALTERING_FUTURE_5X)) : false;
    const isSearching = playerID ? game.turnManager.isInStage(playerID, SEARCHING_DECK) : false;
    const drawPileCards = game.piles?.drawPile?.state?.cards ?? [];

    const combo = G.comboMultiplier || 1;
    let visibleDrawCards: typeof drawPileCards = [];
    if (isViewingFuture5x || isSearching) {
      visibleDrawCards = drawPileCards.slice(0, 5 * combo);
    } else if (isViewingFuture3x) {
      visibleDrawCards = drawPileCards.slice(0, 3 * combo);
    } else if (isViewingFuture1x) {
      visibleDrawCards = drawPileCards.slice(0, 1 * combo);
    }

    const isBurying = playerID ? game.turnManager.isInStage(playerID, BURY_CARD) : false;
    const buryingCard = isBurying ? game.gameState.buryingCard : null;

    const isDiggingDeeper = playerID ? game.turnManager.isInStage(playerID, DIG_DEEPER) : false;
    const digDeeperCard = isDiggingDeeper ? game.gameState.digDeeperCard : null;

    const isLookingAtBottom = playerID ? game.turnManager.isInStage(playerID, STAGE_LOOK_AT_THE_BOTTOM) : false;
    const bottomCard = isLookingAtBottom ? game.gameState.bottomCard : null;
    const topDrawCard = drawPileCards[0]?.isFaceUp ? drawPileCards[0] : null;
    const defense = G.handShuffleDefense;
    const handShuffleDefense = defense ? {
      attackerId: defense.attackerId,
      targetPlayerId: defense.targetPlayerId,
      actionType: defense.actionType,
      startedAtMs: defense.startedAtMs,
      expiresAtMs: defense.expiresAtMs,
      ...(playerID === defense.targetPlayerId ? {
        snapshotAtMs: defense.snapshotAtMs,
        lastRandomShuffleAtMs: defense.lastRandomShuffleAtMs,
      } : {}),
    } : null;

    const animationsQueue = { ...game.animationsQueue.queue };
    if (!game.gameRules?.openCards) {
      for (const timeKey in animationsQueue) {
        animationsQueue[timeKey] = animationsQueue[timeKey].map(anim => {
          const isGloballyVisible = anim.visibleTo.length == 0;
          const isVisible = playerID != null && anim.visibleTo?.includes(playerID);

          if (!canSeeCards && !isGloballyVisible && !isVisible) {
            return { ...anim, card: null };
          }
          return anim;
        });
      }
    }

    return {
      ...G,
      handShuffleDefense,
      lastDefuseInsertIndex: (G.lastDefuseInsertIndex !== undefined && G.lastDefuseInsertIndex !== null) ? -1 : undefined,
      buryingCard,
      digDeeperCard,
      bottomCard,
      topDrawCard,
      searchTopCards: isSearching ? (G.searchTopCards || drawPileCards.slice(0, 5)) : undefined,
      towerOfPowerStash: G.towerOfPowerStash ? G.towerOfPowerStash.map(() => ({ name: '', index: 0 })) : undefined,
      piles: {
        ...G.piles,
        drawPile: {
          ...(G.piles?.drawPile ?? {}),
          cards: visibleDrawCards,
        },
      },
      animationsQueue
    };
  },
  moves: {},

  phases: {
    lobby: {
      start: true,
      next: 'play',
      onEnd: (context: IContext) => {
        const game = new TheGame(context);

        if (game.gameState.gameMode === GAME_MODE_QUICK_PLAY) {
          // --- CHẾ ĐỘ QUICK PLAY (1v1) ---
          // 1. Chia bài khởi đầu cho 2 người chơi: mỗi người 1 Defuse + 3 lá tiêu chuẩn (tổng cộng 4 lá)
          const allPlayers = game.players.allPlayers;
          allPlayers.forEach((player, idx) => {
            player.addCard(DEFUSE.createCard(idx, game));
          });

          const handPool = [
            ATTACK.createCard(0, game),
            SKIP.createCard(0, game),
            FAVOR.createCard(0, game),
            SHUFFLE.createCard(0, game),
            SEE_THE_FUTURE.createCard(0, game),
            CAT_CARD.createCard(0, game),
          ];
          for (let i = handPool.length - 1; i > 0; i--) {
            const j = Math.floor(game.random.Number() * (i + 1));
            [handPool[i], handPool[j]] = [handPool[j], handPool[i]];
          }
          if (allPlayers[0]) {
            allPlayers[0].addCard(handPool[0]);
            allPlayers[0].addCard(handPool[1]);
            allPlayers[0].addCard(handPool[2]);
          }
          if (allPlayers[1]) {
            allPlayers[1].addCard(handPool[3]);
            allPlayers[1].addCard(handPool[4]);
            allPlayers[1].addCard(handPool[5]);
          }

          // 2. Chồng bài rút ĐÚNG 16 LÁ bao gồm tất cả các loại lá tiêu chuẩn + đúng 2 Mèo Nổ
          const drawPile = game.piles.drawPile;
          drawPile.addCard(EXPLODING_KITTEN.createCard(0, game));
          drawPile.addCard(EXPLODING_KITTEN.createCard(1, game));
          drawPile.addCard(DEFUSE.createCard(2, game));
          drawPile.addCard(ATTACK.createCard(1, game));
          drawPile.addCard(ATTACK.createCard(2, game));
          drawPile.addCard(SKIP.createCard(1, game));
          drawPile.addCard(SKIP.createCard(2, game));
          drawPile.addCard(FAVOR.createCard(1, game));
          drawPile.addCard(FAVOR.createCard(2, game));
          drawPile.addCard(SHUFFLE.createCard(1, game));
          drawPile.addCard(SHUFFLE.createCard(2, game));
          drawPile.addCard(SEE_THE_FUTURE.createCard(1, game));
          drawPile.addCard(SEE_THE_FUTURE.createCard(2, game));
          drawPile.addCard(NOPE.createCard(0, game));
          drawPile.addCard(NOPE.createCard(1, game));
          drawPile.addCard(CAT_CARD.createCard(1, game));

          drawPile.shuffle();
          return;
        }

        // 0.1 Chế độ Zombie Kittens Standalone (Mode 5)
        if (game.gameState.gameMode === GAME_MODE_ZOMBIE_STANDALONE) {
          setupZombieStandaloneDeck(game);
          return;
        }

        // 0.2 Chế độ Zombie Apocalypse (Mode 7)
        if (game.gameState.gameMode === GAME_MODE_ZOMBIE_APOCALYPSE) {
          setupZombieApocalypseDeck(game);
          return;
        }

        // 0.3 Chế độ Zombie 2 người với Carl (Mode 6)
        if (game.gameState.gameMode === GAME_MODE_ZOMBIE_CARL) {
          setupZombieCarlDeck(game);
          return;
        }

        // 0.4 Chế độ Recipes for Disaster (Mode 8)
        if (game.gameState.gameMode === GAME_MODE_RECIPES_FOR_DISASTER) {
          setupRecipesForDisasterDeck(game, game.gameState.recipeSlug);
          return;
        }

        // 0.5 Chế độ Good vs Evil (Mode 9)
        if (game.gameState.gameMode === GAME_MODE_GOOD_VS_EVIL) {
          setupGoodVsEvilDeck(game);
          return;
        }

        // 0.6 Chế độ Rage Mode (Mode 10)
        if (game.gameState.gameMode === GAME_MODE_RAGE_MODE) {
          setupRageModeDeck(game);
          return;
        }

        // 0.7 Chế độ Curse You! (Mode 11)
        if (game.gameState.gameMode === GAME_MODE_CURSE_YOU) {
          setupCurseYouDeck(game);
          return;
        }

        // 0.8 Chế độ 10th Anniversary Legacy (Mode 12)
        if (game.gameState.gameMode === GAME_MODE_ANNIVERSARY_LEGACY) {
          setupAnniversaryLegacyDeck(game);
          return;
        }

        // 0.9 Chế độ Exploding Minions (Mode 13)
        if (game.gameState.gameMode === GAME_MODE_EXPLODING_MINIONS) {
          setupExplodingMinionsDeck(game);
          return;
        }

        // Danh sách các deck được chọn (luôn đảm bảo có 'original')
        const selectedDeckIds = game.selectedDecks;

        // 1. Luôn xây dựng Base Deck (Original Deck)
        const baseDeck = deckRegistry.get('original') || new OriginalDeck();
        baseDeck.buildBaseDeck(game);

        // 2. Thêm các lá bài từ các Expansion Deck đã được chọn
        selectedDeckIds.forEach((deckId: string) => {
          if (deckId !== 'original') {
            const expDeck = deckRegistry.get(deckId);
            if (expDeck) {
              expDeck.buildBaseDeck(game);
            }
          }
        });

        // 3. Xáo trộn bài rút lần 1
        game.piles.drawPile.shuffle();

        // Scale only the selected base deck, leaving safe cards to draw after dealing.
        const neededCards = game.players.playerCount * baseDeck.startingHandSize();
        const reserve = Math.max(10, game.players.playerCount * 2);
        while (game.piles.drawPile.size < neededCards + reserve) baseDeck.buildBaseDeck(game);
        game.piles.drawPile.shuffle();

        // 4. Chia bài cho người chơi (7 lá từ drawPile + 1 Defuse bắt buộc)
        dealHands(game, baseDeck);

        // 5. Thêm Mèo Nổ và các lá Defuse còn lại vào drawPile
        baseDeck.addPostDealCards(game);

        // Thêm post-deal cards của các Expansion Deck nếu có
        selectedDeckIds.forEach((deckId: string) => {
          if (deckId !== 'original') {
            const expDeck = deckRegistry.get(deckId);
            if (expDeck) {
              expDeck.addPostDealCards(game);
            }
          }
        });

        // 6. Khởi tạo kho dự trữ cho Phụ kiện Vương miện Tower of Power nếu chọn Barking Kittens
        if (selectedDeckIds.includes('barking_kittens')) {
          const stashCards: any[] = [];
          for (let i = 0; i < 6; i++) {
            const card = game.piles.drawPile.drawCard();
            if (card) {
              stashCards.push(card.data);
            }
          }
          game.gameState.towerOfPowerStash = stashCards;
          game.gameState.towerOfPowerCrownBearer = null;
        }

        // 7. Xáo trộn toàn bộ chồng bài rút lần cuối trước khi bắt đầu chơi
        game.piles.drawPile.shuffle();

        // 8. Chế độ Mèo Đạo Tặc (Cat Burglar): đặt tượng Cat Burglar trước mặt người ngồi bên phải người đi đầu tiên (Rule 3.1)
        if (game.gameState.gameMode === GAME_MODE_CAT_BURGLAR) {
          const numPlayers = game.players.playerCount;
          if (numPlayers > 0) {
            const rightPos = (0 - 1 + numPlayers) % numPlayers;
            const rightPlayerId = game.turnManager.playOrder[rightPos] || String(rightPos);
            game.gameState.catBurglarHolderId = rightPlayerId;
            game.gameState.catBurglarUsedThisTurn = false;
          }
        }
      },
      turn: {
        activePlayers: {
          all: WAITING_FOR_START,
        },
        stages: {
          waitingForStart: {
            moves: {
              startGame: {
                move: (context: IContext) => {
                  context.events.setPhase(PLAY);
                },
                client: false,
              },
              updateSelectedDecks: {
                move: (context: IContext, selectedDecks: string[]) => {
                  const mode = getGameModeDefinition(context.G.gameMode);
                  if (!mode.allowsExpansionSelection) {
                    throw new Error(`${mode.vietnameseName} sử dụng bộ bài cố định`);
                  }
                  context.G.selectedDecks = normalizeDecks(selectedDecks);
                },
                client: false,
              },
            }
          }
        },
        order: {
          first: () => 0,
          next: () => undefined,
        },
      },
    },
    play: {
      turn: {
        order: turnOrder,
        activePlayers: {
          currentPlayer: Stage.NULL,
          others: RESPOND_WITH_NOW_CARD,
        },
        onBegin: (context: IContext) => {
          const game = new TheGame(context);
          const playOrder = game.turnManager.playOrder;
          const firstPos = playOrder.indexOf(game.players.currentPlayerId);
          const rightOfFirst = firstPos === -1
            ? null
            : playOrder[(firstPos - 1 + playOrder.length) % playOrder.length];

          // The shuffled play order is only final when the first play turn begins.
          if (game.gameState.gameMode === GAME_MODE_CAT_BURGLAR && !game.gameState.catBurglarInitialized) {
            game.gameState.catBurglarHolderId = rightOfFirst;
            game.gameState.catBurglarInitialized = true;
          }
          if (
            game.gameState.gameMode === GAME_MODE_RAGE_MODE
            && game.gameState.rageMode
            && !game.gameState.rageMode.rageCatInitialized
          ) {
            game.gameState.rageMode.rageCatHolderId = rightOfFirst;
            game.gameState.rageMode.rageCatInitialized = true;
          }
          if (game.turnManager.turnsRemaining <= 0) {
            game.turnManager.turnsRemaining = 1;
            game.gameState.attackChain = false;
          }
          if (game.gameState.mustDrawFromAnywhereNext) {
            game.gameState.mustDrawFromAnywhereNext = false;
            game.turnManager.setStage(STAGE_DRAW_FROM_ANYWHERE);
          }
          game.gameState.comboMultiplier = 1;
          game.gameState.catBurglarUsedThisTurn = false;
          if (game.gameState.curseYou) {
            game.gameState.curseYou.disguiseUsedThisTurn = false;
          }
          if (game.gameState.rageMode) {
            game.gameState.rageMode.rageCatUsedThisTurn = false;
          }
        },
        onEnd: (context: IContext) => {
          const game = new TheGame(context);

          // Decrement the turns remaining counter
          game.turnManager.turnsRemaining = game.turnManager.turnsRemaining - 1;

          // Xử lý Timebomb Kitten và Blind cho người vừa hoàn thành lượt
          const currentTurnPlayer = game.players.currentPlayer;
          if (currentTurnPlayer && currentTurnPlayer.isAlive) {
            // Giảm trạng thái bị khóa Blind (nếu có)
            if (currentTurnPlayer.isCardPlayBlocked) {
              currentTurnPlayer.isCardPlayBlocked = false;
            }

            // Giảm bộ đếm Timebomb
            if (currentTurnPlayer.activeTimebombs && currentTurnPlayer.activeTimebombs.length > 0) {
              let exploded = false;
              const remainingBombs: { id: string | number; turnsLeft: number }[] = [];
              for (const bomb of currentTurnPlayer.activeTimebombs) {
                const newTurns = bomb.turnsLeft - 1;
                if (newTurns <= 0) {
                  // Hết 3 lượt mà chưa gỡ!
                  // Kiểm tra xem có Defuse Timebomb trên tay không
                  const defuseTimebombIdx = currentTurnPlayer.findCardIndex(NAME_DEFUSE_TIMEBOMB);
                  if (defuseTimebombIdx !== -1) {
                    // Tự động dùng Defuse Timebomb để cứu bản thân
                    const defuseCard = currentTurnPlayer.hand[defuseTimebombIdx];
                    defuseCard.moveTo(game.piles.discardPile);
                    // Bù 1 Exploding Kitten vào bộ bài rút
                    game.piles.drawPile.addCard(EXPLODING_KITTEN.createCard(game.gameState.nextCardId++, game));
                    game.piles.drawPile.shuffle();
                  } else {
                    exploded = true;
                  }
                } else {
                  remainingBombs.push({ id: bomb.id, turnsLeft: newTurns });
                }
              }
              currentTurnPlayer.activeTimebombs = remainingBombs;
              if (exploded) {
                currentTurnPlayer.eliminate(false);
              }
            }
          }

          // If we're moving to the next player, reset the counter
          if (game.turnManager.turnsRemaining <= 0) {
            game.gameState.isShuffleForbidden = false;

            // Xử lý lượt của Carl trong Mode 6 (Zombie Carl)
            if (game.gameState.gameMode === GAME_MODE_ZOMBIE_CARL && game.gameState.carl?.isAlive) {
              const carl = game.gameState.carl;
              const drawPile = game.piles.drawPile;
              if (drawPile.size > 0) {
                const topCard = drawPile.drawCard();
                if (topCard) {
                  if (topCard.name === 'exploding_kitten') {
                    if (carl.hasZombieKitten) {
                      carl.hasZombieKitten = false;
                      const zkCard = ZOMBIE_KITTEN.createCard(999, game);
                      game.piles.discardPile.addCard(zkCard);
                      const deadHuman = game.players.allPlayers.find(p => !p.isAlive);
                      if (deadHuman) {
                        deadHuman.resurrect();
                      }
                      drawPile.cards.push(topCard);
                      carl.lastAction = {
                        cardDrawnName: 'exploding_kitten',
                        wasBomb: true,
                        defused: true,
                        timestamp: Date.now(),
                      };
                    } else {
                      carl.isAlive = false;
                      carl.bombsHeld += 1;
                      carl.lastAction = {
                        cardDrawnName: 'exploding_kitten',
                        wasBomb: true,
                        defused: false,
                        timestamp: Date.now(),
                      };
                    }
                  } else {
                    drawPile.cards.push(topCard);
                    carl.lastAction = {
                      cardDrawnName: topCard.name,
                      wasBomb: false,
                      defused: false,
                      timestamp: Date.now(),
                    };
                  }
                }
              }
            }
          }
        },
        stages: {
          [IDLE_STAGE]: { moves: {} },
          defuseExplodingKitten: {
            moves: {
              defuseExplodingKitten: {
                move: inGame(defuseExplodingKitten),
              },
            }
          },
          choosePlayerToStealFrom: {
            moves: {
              stealCard: {
                move: inGame(stealCard),
                client: false
              },
            },
          },
          choosePlayerToRequestFrom: {
            moves: {
              requestCard: {
                move: inGame(requestCard),
              },
            },
          },
          chooseCardToGive: {
            moves: {
              giveCard: inGame(giveCard),
            },
          },
          viewingFuture: {
            moves: {
              closeFutureView: inGame(closeFutureView),
            },
          },
          [VIEWING_FUTURE_1X]: {
            moves: {
              closeFutureView: inGame(closeFutureView),
            },
          },
          alteringFuture: {
            moves: {
              reorderFuture: {
                move: inGame(reorderFuture),
              },
            },
          },
          [CHOOSE_PLAYER_FOR_TARGETED_ATTACK]: {
            moves: {
              targetedAttack: {
                move: inGame(targetedAttack),
              },
            },
          },
          [VIEWING_FUTURE_5X]: {
            moves: {
              closeFutureView: inGame(closeFutureView),
            },
          },
          [ALTERING_FUTURE_5X]: {
            moves: {
              reorderFuture: {
                move: inGame(reorderFuture),
              },
            },
          },
          [CHOOSE_PLAYER_FOR_MARK]: {
            moves: {
              markPlayer: {
                move: inGame(markPlayer),
              },
            },
          },
          [CHOOSE_PLAYER_FOR_CURSE]: {
            moves: {
              cursePlayer: {
                move: inGame(cursePlayer),
              },
            },
          },
          [CHOOSE_CARD_FOR_GARBAGE]: {
            moves: {
              giveGarbageCard: {
                move: inGame(giveGarbageCard),
              },
            },
          },
          [CHOOSE_PLAYER_FOR_ILL_TAKE_THAT]: {
            moves: {
              selectPlayerForIllTakeThat: {
                move: inGame(selectPlayerForIllTakeThat),
              },
            },
          },
          [CHOOSE_CARD_FOR_POTLUCK]: {
            moves: {
              givePotluckCard: {
                move: inGame(givePotluckCard),
              },
            },
          },
          [BURY_CARD]: {
            moves: {
              buryCard: {
                move: inGame(buryCard),
              },
            },
          },
          [DIG_DEEPER]: {
            moves: {
              takeTopCard: {
                move: inGame(takeTopCard),
              },
              takeSecondCard: {
                move: inGame(takeSecondCard),
              },
            },
          },
          [CHOOSE_DEAD_PLAYER_FOR_RESURRECTION]: {
            moves: {
              resurrectPlayer: {
                move: inGame(resurrectPlayer),
              },
            },
          },
          [CHOOSE_DEAD_PLAYER_FOR_FEED]: {
            moves: {
              selectDeadPlayerForFeed: {
                move: inGame(selectDeadPlayerForFeed),
              },
            },
          },
          [GIVE_CARD_TO_FEED_DEAD]: {
            moves: {
              giveCardToFeedDead: {
                move: inGame(giveCardToFeedDead),
              },
            },
          },
          [CHOOSE_CARD_FOR_GRAVE_ROBBER]: {
            moves: {
              giveCardForGraveRobber: {
                move: inGame(giveCardForGraveRobber),
              },
            },
          },
          [STAGE_LOOK_AT_THE_BOTTOM]: {
            moves: {
              keepAtBottom: {
                move: inGame(keepAtBottom),
              },
              moveBottomToTop: {
                move: inGame(moveBottomToTop),
              },
            },
          },
          [STAGE_DRAW_FROM_ANYWHERE]: {
            moves: {
              drawFromAnywhere: {
                move: inGame(drawFromAnywhere),
              },
            },
          },
          [STAGE_HAND_SHUFFLE_DEFENSE]: {
            moves: {
              swapHandCards: {
                move: inGame(swapHandCards),
              },
              randomShuffleHand: {
                move: inGame(randomShuffleHand),
              },
              publishHandShuffleSnapshot: {
                move: inGame(publishHandShuffleSnapshot),
              },
              finishHandShuffleDefense: {
                move: inGame(finishHandShuffleDefense),
              },
            },
          },
          [CHOOSE_PLAYER_FOR_ANNOY]: {
            moves: {
              annoyPlayer: {
                move: inGame(annoyPlayer),
              },
            },
          },
          [SEARCHING_DECK]: {
            moves: {
              pickSearchCard: {
                move: inGame(pickSearchCard),
              },
            },
          },
          [CHOOSE_PLAYER_FOR_BLIND]: {
            moves: {
              blindPlayer: {
                move: inGame(blindPlayer),
              },
            },
          },
          [CHOOSE_PLAYER_FOR_DISCARD]: {
            moves: {
              discardPlayerCards: {
                move: inGame(discardPlayerCards),
              },
            },
          },
          respondWithNowCard: {
            moves: {
              playCard: {
                move: inGame(playCard),
                client: false,
              },
              playNowCard: {
                move: inGame(playNowCard),
                client: false,
              },
              forfeit: inGame(forfeit),
            },
          },
          awaitingNowCards: {
            moves: {
              playCard: {
                move: inGame(playCard),
                client: false,
              },
              playNowCard: {
                move: inGame(playNowCard),
                client: false,
              },
              resolvePendingCard: {
                move: inGame(resolvePendingCard),
                client: false,
              },
              forfeit: inGame(forfeit),
            },
          },
        },
      },
      moves: {
        drawCard: {
          move: inGame(drawCard),
          client: false
        },
        playCard: {
          move: inGame(playCard),
          client: false
        },
        playNowCard: {
          move: inGame(playNowCard),
          client: false
        },
        resolvePendingCard: {
          move: inGame(resolvePendingCard),
          client: false
        },
        closeFutureView: inGame(closeFutureView),
        forfeit: inGame(forfeit),
        reorderFuture: inGame(reorderFuture),
        buryCard: inGame(buryCard),
        stealCard: inGame(stealCard),
        requestCard: inGame(requestCard),
        giveCard: inGame(giveCard),
        targetedAttack: inGame(targetedAttack),
        markPlayer: inGame(markPlayer),
        cursePlayer: inGame(cursePlayer),
        giveGarbageCard: inGame(giveGarbageCard),
        selectPlayerForIllTakeThat: inGame(selectPlayerForIllTakeThat),
        givePotluckCard: inGame(givePotluckCard),
        takeTopCard: inGame(takeTopCard),
        takeSecondCard: inGame(takeSecondCard),
        resurrectPlayer: inGame(resurrectPlayer),
        selectDeadPlayerForFeed: inGame(selectDeadPlayerForFeed),
        giveCardToFeedDead: inGame(giveCardToFeedDead),
        giveCardForGraveRobber: inGame(giveCardForGraveRobber),
        keepAtBottom: inGame(keepAtBottom),
        moveBottomToTop: inGame(moveBottomToTop),
        drawFromAnywhere: inGame(drawFromAnywhere),
        swapHandCards: inGame(swapHandCards),
        randomShuffleHand: inGame(randomShuffleHand),
        finishHandShuffleDefense: inGame(finishHandShuffleDefense),
        annoyPlayer: inGame(annoyPlayer),
        pickSearchCard: inGame(pickSearchCard),
        blindPlayer: inGame(blindPlayer),
        discardPlayerCards: inGame(discardPlayerCards),
        activateCatBurglar: inGame(activateCatBurglar),
        activateRageCat: inGame(activateRageCat),
      },
      endIf: ({player, G}: any) => {
        const aliveEntries = Object.entries(player.state).filter(
          ([_, p]: any) => p.isAlive
        );

        if (G.gameMode === GAME_MODE_TEAM_UP) {
          const redAlive = aliveEntries.filter(([id]) => G.teams?.[id] === 'red');
          const blueAlive = aliveEntries.filter(([id]) => G.teams?.[id] === 'blue');
          if (redAlive.length === 0 || blueAlive.length === 0) {
            return { next: GAME_OVER };
          }
          return;
        }

        if (G.gameMode === GAME_MODE_ZOMBIE_CARL) {
          const carlAlive = G.carl?.isAlive ?? false;
          if (aliveEntries.length === 0 && carlAlive) {
            return { next: GAME_OVER };
          }
          if (aliveEntries.length === 1 && !carlAlive) {
            return { next: GAME_OVER };
          }
          if (aliveEntries.length === 0 && !carlAlive) {
            return { next: GAME_OVER };
          }
          return;
        }

        // End phase when only one player is alive
        if (aliveEntries.length === 1) {
          return {next: GAME_OVER};
        }
      },
      onEnd: (context: IContext) => {
        const game = new TheGame(context);

        if (game.gameState.gameMode === GAME_MODE_TEAM_UP) {
          const alive = game.players.alivePlayers;
          const redAlive = alive.filter(p => game.gameState.teams?.[p.id] === 'red');
          const blueAlive = alive.filter(p => game.gameState.teams?.[p.id] === 'blue');
          if (redAlive.length > 0 && blueAlive.length === 0) {
            game.gameState.winningTeam = 'red';
            game.players.winner = redAlive[0];
          } else if (blueAlive.length > 0 && redAlive.length === 0) {
            game.gameState.winningTeam = 'blue';
            game.players.winner = blueAlive[0];
          }
          return;
        }

        // Find the last alive player
        const players = game.players.alivePlayers;
        if (players.length === 1) {
          game.players.winner = players[0];
        }
      },
    },
    gameOver: {
      onBegin: (context: IContext) => {
        const game = new TheGame(context);
        const winner = game.players.winner;
        context.events.endGame({
          winner: winner ? winner.id : undefined,
          winningTeam: game.gameState.winningTeam
        });
      },
    },
  },
};

// Every seat can leave during any interaction; only the assigned stage exposes gameplay moves.
// Hidden-state moves must be resolved against the authoritative state, never a masked client deck.
const privateMoves = new Set(['reorderFuture', 'defuseExplodingKitten', 'buryCard', 'giveCard',
  'giveGarbageCard', 'givePotluckCard', 'giveCardToFeedDead', 'giveCardForGraveRobber',
  'pickSearchCard', 'swapHandCards', 'randomShuffleHand']);
const playPhase = ExplodingKittens.phases!.play;
for (const stage of Object.values(playPhase.turn!.stages!)) {
  stage.moves = { ...stage.moves, forfeit: { move: inGame(forfeit), client: false } };
}
for (const moves of [playPhase.moves!, ...Object.values(playPhase.turn!.stages!).map(stage => stage.moves!)]) {
  for (const [name, move] of Object.entries(moves)) {
    moves[name] = { ...(typeof move === 'function' ? { move } : move), client: false,
      ...(privateMoves.has(name) ? { redact: true } : {}) };
  }
}


