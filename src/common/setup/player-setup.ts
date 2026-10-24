import type {IPlayer, IPlayers} from '../models';
import type {DeckType} from '../entities/deck-type';
import {cardTypeRegistry} from "../registries/card-registry";
import {CardType} from "../entities/card-type";
import {TheGame} from "../entities/game";
import {NAME_EXPLODING_KITTEN, NAME_STREAKING_KITTEN} from "../constants/cards";

export const createPlayerState = (): IPlayer => ({
  hand: [],
  handSize: 0,
  isAlive: true
});

/**
 * Create a full view of a player (used for self-view and spectators)
 */
const createFullPlayerView = (player: IPlayer): IPlayer => player;

/**
 * Create a limited view of a player (used for opponent views)
 * Show marked cards and unprotected exploding kittens, but keep other cards and streaking-protected exploding kittens secret.
 */
const createLimitedPlayerView = (player: IPlayer): IPlayer => {
  const hasStreakingKitten = player.hand.some(c => c.name === NAME_STREAKING_KITTEN);
  let protectedKittenHidden = false;

  return {
    ...player,
    hand: player.hand.filter(c => {
      if (c.isMarked) {
        return true;
      }
      if (c.name === NAME_EXPLODING_KITTEN) {
        if (hasStreakingKitten && !protectedKittenHidden) {
          protectedKittenHidden = true;
          return false;
        }
        return true;
      }
      return false;
    })
  };
};

/**
 * Check if the viewing player should see all card-types (spectator or dead player)
 */
export const shouldSeeAllCards = (game: TheGame): boolean => {
  // If openCards rule is enabled, everyone sees all card-types
  if (game.gameRules?.openCards) return true;

  const playerID = game.context.playerID;
  if (!playerID) {
    return game.gameRules?.spectatorsSeeCards ?? false;
  }

  // Dead players might be tracked by `player plugins` OR `G.deadPlayers` depending on context wrapper availability.
  // Given `playerView` strips plugin data initially, we rely on `game.context.G.deadPlayers`.
  const isDead = game.context.G.deadPlayers?.includes(playerID);
  
  if (isDead) {
    return game.gameRules?.spectatorsSeeCards ?? false;
  }
  
  // Fallback to checking full player wrapper if alive state is available
  const player = game.players.getPlayerOptional(playerID);
  if (player && !player.isAlive) {
    return game.gameRules?.spectatorsSeeCards ?? false;
  }
  
  return false;
};

export const filterPlayerView = (game: TheGame): IPlayers => {
  const canSeeAllCards = shouldSeeAllCards(game);

  const view: IPlayers = {};
  const viewingPlayerId = game.context.playerID;
  const spectator = !viewingPlayerId || game.gameState.deadPlayers.includes(viewingPlayerId);
  const defense = game.gameState.handShuffleDefense;
  game.players.allPlayers.forEach(value => {
    const id = value.id;
    const current = game.players.getPlayer(id).state;
    const pdata = spectator && defense?.targetPlayerId === id && defense.spectatorHand
      ? { ...current, hand: defense.spectatorHand }
      : current;
    if (canSeeAllCards || id === viewingPlayerId) {
      view[id] = createFullPlayerView(pdata);
    } else {
      view[id] = createLimitedPlayerView(pdata);
    }
  })

  return view;
};

export function dealHands(game: TheGame, deck: DeckType) {
  const handSize = deck.startingHandSize();

  game.players.allPlayers.forEach((player, index) => {
    // Draw base cards from the pile
    for (let i = 0; i < handSize; i++) {
        const card = game.piles.drawPile.drawCard();
        if (card) {
            player.addCard(card);
        }
    }
    
    // Create forced initial cards outside of drawing like defuse
    const forcedCards = deck.startingHandForcedCards(game, index);

    // Add any card-types that are in testing mode (e.g. for development or QA purposes)
    cardTypeRegistry.getAll().forEach((card: CardType) => {
      if (card.inTesting()) {
        for (let i = 0; i < 3; i++) {
          forcedCards.push(card.createCard(0, game));
        }
      }
    });

    forcedCards.forEach(c => player.addCard(c));
  });
}
