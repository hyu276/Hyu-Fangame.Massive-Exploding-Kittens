import {ICard, IPlayerAPI, IPlayers, Player, TheGame} from '../../common';
import { IContext } from '../../common';
import {Card} from '../../common';
import {NAME_NOPE} from '../../common';
import {
  CHOOSE_CARD_TO_GIVE,
  CHOOSE_CARD_FOR_GARBAGE,
  CHOOSE_CARD_FOR_POTLUCK,
  CHOOSE_PLAYER_TO_REQUEST_FROM,
  CHOOSE_PLAYER_TO_STEAL_FROM,
  CHOOSE_PLAYER_FOR_TARGETED_ATTACK,
  CHOOSE_PLAYER_FOR_MARK,
  CHOOSE_PLAYER_FOR_CURSE,
  CHOOSE_PLAYER_FOR_ILL_TAKE_THAT,
  CHOOSE_DEAD_PLAYER_FOR_RESURRECTION,
  CHOOSE_DEAD_PLAYER_FOR_FEED,
  GIVE_CARD_TO_FEED_DEAD,
  CHOOSE_CARD_FOR_GRAVE_ROBBER,
  CHOOSE_PLAYER_FOR_ANNOY,
  CHOOSE_PLAYER_FOR_BLIND,
  CHOOSE_PLAYER_FOR_DISCARD,
  GAME_MODE_CAT_BURGLAR,
  GAME_MODE_ZOMBIE_STANDALONE,
  GAME_MODE_ZOMBIE_APOCALYPSE,
  GAME_MODE_ZOMBIE_CARL,
  NAME_ILL_TAKE_IT_FROM_HERE
} from '../../common';
import {MatchPlayer} from "../utils/matchData.ts";
import {PlayerID} from "boardgame.io";
const back = "/assets/cards/back/0.jpg";

export class TheGameClient extends TheGame {
  public readonly moves: Record<string, (...args: any[]) => void>;
  public readonly matchID: string;
  public readonly selfPlayerId: string | null;
  public readonly matchData: MatchPlayer[];
  public readonly sendChatMessage: (message: string) => void;
  public readonly chatMessages: any[];
  public readonly isMultiplayer: boolean;

  constructor(
    context: IContext,
    moves: Record<string, (...args: any[]) => void>,
    matchID: string,
    playerID: string | null,
    matchData: any,
    sendChatMessage: (message: string) => void,
    chatMessages: any[],
    isMultiplayer: boolean
  ) {
    super(context);
    this.setPlayers((this.context.player as IPlayerAPI & { data: { players: IPlayers } }).data.players);

    this.moves = moves;
    this.matchID = matchID;
    this.selfPlayerId = playerID;
    this.matchData = matchData;
    this.sendChatMessage = sendChatMessage;
    this.chatMessages = chatMessages;
    this.isMultiplayer = isMultiplayer;
  }

  get isSpectator(): boolean {
    return this.selfPlayerId === null;
  }

  get selfPlayer(): Player | null {
    if (!this.selfPlayerId) {
      return null;
    }
    return this.players.getPlayer(this.selfPlayerId);
  }

  get isSelfAlive(): boolean {
    const selfPlayer = this.selfPlayer;
    return !!selfPlayer && selfPlayer.isAlive;
  }

  get isSelfCurrentPlayer(): boolean {
    return this.selfPlayerId === this.players.currentPlayerId;
  }

  isSelf(player: Player | PlayerID | MatchPlayer | null) {
    if (!this.selfPlayerId || !player) {
      return false;
    }
    const playerId = typeof player === 'string' ? player : player.id;
    return this.selfPlayerId === playerId;
  }

  playDrawCard() {
    if (this.selfPlayer && this.moves.drawCard) {
      this.moves.drawCard();
    }
  }

  playDefuse(index: number) {
    if (this.selfPlayer && this.moves.defuseExplodingKitten) {
      this.moves.defuseExplodingKitten(index);
    }
  }

  selectCard(cardIndex: number) {
    if (!this.selfPlayer) {
      console.error("No self player found");
      return;
    }
    if (this.canGiveCard()) {
      this.giveCard(cardIndex);
    } else if (this.canGiveGarbageCard()) {
      this.giveGarbageCard(cardIndex);
    } else if (this.canGivePotluckCard()) {
      this.givePotluckCard(cardIndex);
    } else if (this.canGiveCardToFeedDead()) {
      this.giveCardToFeedDead(cardIndex);
    } else if (this.canGiveCardForGraveRobber()) {
      this.giveCardForGraveRobber(cardIndex);
    } else {
      this.playCard(cardIndex);
    }
  }

  canGiveGarbageCard(): boolean {
    return !!this.selfPlayer?.isInStage(CHOOSE_CARD_FOR_GARBAGE);
  }

  giveGarbageCard(cardIndex: number) {
    if (this.selfPlayer && this.moves.giveGarbageCard) {
      this.moves.giveGarbageCard(cardIndex);
    }
  }

  canGivePotluckCard(): boolean {
    return !!this.selfPlayer?.isInStage(CHOOSE_CARD_FOR_POTLUCK);
  }

  givePotluckCard(cardIndex: number) {
    if (this.selfPlayer && this.moves.givePotluckCard) {
      this.moves.givePotluckCard(cardIndex);
    }
  }

  canGiveCardToFeedDead(): boolean {
    return !!this.selfPlayer?.isInStage(GIVE_CARD_TO_FEED_DEAD);
  }

  giveCardToFeedDead(cardIndex: number) {
    if (this.selfPlayer && this.moves.giveCardToFeedDead) {
      this.moves.giveCardToFeedDead(cardIndex);
    }
  }

  canGiveCardForGraveRobber(): boolean {
    return !!this.selfPlayer?.isInStage(CHOOSE_CARD_FOR_GRAVE_ROBBER);
  }

  giveCardForGraveRobber(cardIndex: number) {
    if (this.selfPlayer && this.moves.giveCardForGraveRobber) {
      this.moves.giveCardForGraveRobber(cardIndex);
    }
  }

  takeTopCard() {
    if (this.selfPlayer && this.moves.takeTopCard) {
      this.moves.takeTopCard();
    }
  }

  takeSecondCard() {
    if (this.selfPlayer && this.moves.takeSecondCard) {
      this.moves.takeSecondCard();
    }
  }

  pickSearchCard(index: number) {
    if (this.selfPlayer && this.moves.pickSearchCard) {
      this.moves.pickSearchCard(index);
    }
  }

  closeFutureView() {
    if (this.moves.closeFutureView) {
      this.moves.closeFutureView();
    }
  }

  forfeit() {
    if (this.selfPlayer && this.moves.forfeit) {
      this.moves.forfeit();
    }
  }

  activateCatBurglar(targetPlayerId: string, catCardIndex: number) {
    if (this.selfPlayer && this.moves.activateCatBurglar) {
      this.moves.activateCatBurglar(targetPlayerId, catCardIndex);
    }
  }

  canUseCatBurglar(): boolean {
    if (this.gameState.gameMode !== GAME_MODE_CAT_BURGLAR) return false;
    if (!this.isSelfAlive || !this.isSelfCurrentPlayer) return false;
    if (this.gameState.catBurglarHolderId !== this.selfPlayerId) return false;
    if (this.gameState.catBurglarUsedThisTurn) return false;
    if (this.turnManager.activePlayers?.[this.selfPlayerId!]) return false;
    if (this.piles.pendingCard) return false;
    return true;
  }

  canPlayCard(cardIndex: number): boolean {
    const cardAt = this.selfPlayer?.getCardAt(cardIndex);
    if (!cardAt || cardAt.isLocked) {
      return false;
    }
    if (!cardAt.canPlay()) {
      return false;
    }
    if (cardAt.type.isNowCard()) {
      if (cardAt.name === NAME_NOPE) {
        return !!this.selfPlayer?.canNope;
      }
      // Dead player can only play NOW cards if Undead rules apply (Zombie modes)
      if (!this.isSelfAlive) {
        const isZombieKittensActive = 
          this.gameState.gameMode === GAME_MODE_ZOMBIE_STANDALONE ||
          this.gameState.gameMode === GAME_MODE_ZOMBIE_APOCALYPSE ||
          this.gameState.gameMode === GAME_MODE_ZOMBIE_CARL ||
          this.selectedDecks?.includes('zombie_kittens');
        if (!isZombieKittensActive) {
          return false;
        }
      }
      // Cannot interrupt when someone is actively defusing, except reaction cards
      const activeStages = Object.values(this.turnManager.activePlayers || {});
      if (activeStages.includes('defuseExplodingKitten') && cardAt.name !== NAME_ILL_TAKE_IT_FROM_HERE) {
        return false;
      }
      const myStage = this.turnManager.activePlayers?.[this.selfPlayerId!];
      if (myStage && myStage !== 'respondWithNowCard' && myStage !== 'awaitingNowCards') {
        return false;
      }
      return this.piles.canCardBePlayed(cardAt);
    }
    if (!this.isSelfAlive) {
      return false;
    }
    if (!this.isSelfCurrentPlayer) {
      return false;
    }
    if (this.turnManager.activePlayers?.[this.selfPlayerId!]) return false;
    if (this.selfPlayer?.isCardPlayBlocked) {
      return false;
    }
    if (this.selfPlayer?.isBlinded) {
      return true;
    }
    return this.piles.canCardBePlayed(cardAt);
  }

  playCard(cardIndex: number) {
    if (this.selfPlayer && this.moves.playCard) {
      const cardAt = this.selfPlayer.getCardAt(cardIndex);
      if (!cardAt) {
        console.error(`No card at index ${cardIndex} in player's hand`);
        return;
      }
      if (!this.canPlayCard(cardIndex)) {
        console.error(`Card ${cardAt.name} at index ${cardIndex} cannot be played right now`);
        return;
      }
      this.moves.playCard(cardIndex);
    }
  }

  playNope() {
    if (this.selfPlayer && this.selfPlayer.canNope && this.piles.pendingCard && this.moves.playCard) {
      const number = this.selfPlayer.hand.findIndex(card => card.name === NAME_NOPE && !card.isLocked);
      this.moves.playCard(number)
    }
  }

  canGiveCard(): boolean {
    if (!this.selfPlayer) {
      return false;
    }
    return this.selfPlayer.isInStage(CHOOSE_CARD_TO_GIVE);
  }

  giveCard(cardIndex: number) {
    if (!this.selfPlayer) {
      console.error("No self player found");
      return;
    }

    if (!this.canGiveCard()) {
      console.error("Player cannot give a card right now");
      return;
    }

    if (this.moves.giveCard) {
      this.moves.giveCard(cardIndex);
    }
  }

  selectPlayer(player: Player) {
    if (!this.selfPlayer) {
      return false;
    }
    if (!this.selfPlayer.canSelectPlayer()) {
      console.error("Player cannot be selected right now");
      return false;
    }
    if (this.selfPlayer.isInStage(CHOOSE_DEAD_PLAYER_FOR_RESURRECTION)) {
      if (!player.isAlive && !player.hasLeft && this.moves.resurrectPlayer) {
        this.moves.resurrectPlayer(player.id);
        return true;
      }
      return false;
    }
    if (this.selfPlayer.isInStage(CHOOSE_DEAD_PLAYER_FOR_FEED)) {
      if (!player.isAlive && !player.hasLeft && this.moves.selectDeadPlayerForFeed) {
        this.moves.selectDeadPlayerForFeed(player.id);
        return true;
      }
      return false;
    }
    if (!player.isValidCardTarget) {
      return false;
    }
    if (this.selfPlayer.isInStage(CHOOSE_PLAYER_TO_STEAL_FROM) && this.moves.stealCard) {
      this.moves.stealCard(player.id);
    } else if (this.selfPlayer.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM) && this.moves.requestCard) {
      this.moves.requestCard(player.id);
    } else if (this.selfPlayer.isInStage(CHOOSE_PLAYER_FOR_TARGETED_ATTACK) && this.moves.targetedAttack) {
      this.moves.targetedAttack(player.id);
    } else if (this.selfPlayer.isInStage(CHOOSE_PLAYER_FOR_MARK) && this.moves.markPlayer) {
      this.moves.markPlayer(player.id);
    } else if (this.selfPlayer.isInStage(CHOOSE_PLAYER_FOR_CURSE) && this.moves.cursePlayer) {
      this.moves.cursePlayer(player.id);
    } else if (this.selfPlayer.isInStage(CHOOSE_PLAYER_FOR_ILL_TAKE_THAT) && this.moves.selectPlayerForIllTakeThat) {
      this.moves.selectPlayerForIllTakeThat(player.id);
    } else if (this.selfPlayer.isInStage(CHOOSE_PLAYER_FOR_ANNOY) && this.moves.annoyPlayer) {
      this.moves.annoyPlayer(player.id);
    } else if (this.selfPlayer.isInStage(CHOOSE_PLAYER_FOR_BLIND) && this.moves.blindPlayer) {
      this.moves.blindPlayer(player.id);
    } else if (this.selfPlayer.isInStage(CHOOSE_PLAYER_FOR_DISCARD) && this.moves.discardPlayerCards) {
      this.moves.discardPlayerCards(player.id);
    }
  }

  buryCard(insertIndex: number) {
    if (this.selfPlayer && this.moves.buryCard) {
      this.moves.buryCard(insertIndex);
    }
  }

  keepAtBottom() {
    if (this.selfPlayer && this.moves.keepAtBottom) {
      this.moves.keepAtBottom();
    }
  }

  moveBottomToTop() {
    if (this.selfPlayer && this.moves.moveBottomToTop) {
      this.moves.moveBottomToTop();
    }
  }

  drawFromAnywhere(depthIndex: number) {
    if (this.selfPlayer && this.moves.drawFromAnywhere) {
      this.moves.drawFromAnywhere(depthIndex);
    }
  }

  swapHandCards(fromIndex: number, toIndex: number) {
    if (this.moves.swapHandCards) {
      this.moves.swapHandCards(fromIndex, toIndex);
    }
  }

  randomShuffleHand() {
    if (this.moves.randomShuffleHand) {
      this.moves.randomShuffleHand();
    }
  }

  skipHandShuffleDefense() {
    if (this.moves.finishHandShuffleDefense) {
      this.moves.finishHandShuffleDefense();
    }
  }

  updateSelectedDecks(decks: string[]) {
    if (this.moves.updateSelectedDecks) {
      this.moves.updateSelectedDecks(decks);
    }
  }

  getDiscardCardTexture(): string {
    return TheGameClient.getCardTexture(this.piles.discardPile.topCard);
  }

  getCardTexture(card: Card | ICard | null): string {
    return TheGameClient.getCardTexture(card);
  }

  static getCardTexture(card: Card | ICard | null): string {
    if (!card || !card.name) {
      return back;
    }
    const maxCounts: Record<string, number> = {
      attack: 4,
      cat_card: 5,
      defuse: 6,
      exploding_kitten: 4,
      favor: 4,
      nope: 5,
      see_the_future: 5,
      shuffle: 4,
      skip: 4,
      alter_the_future: 4,
      alter_the_future_3x_now: 4,
      alter_the_future_5x: 4,
      targeted_attack: 6,
      draw_from_the_bottom: 6,
      feral_cat: 6,
      imploding_kitten: 6,
      reverse: 6,
      barking_kitten: 6,
      bury: 6,
      ill_take_that: 6,
      personal_attack_3x: 6,
      potluck: 6,
      share_the_future_3x: 6,
      super_skip: 6,
      tower_of_power: 6,
      catomic_bomb: 6,
      curse_of_the_cat_butt: 6,
      garbage_collection: 6,
      mark: 6,
      see_the_future_5x: 6,
      streaking_kitten: 6,
      swap_top_and_bottom: 6,
      attack_of_the_dead: 6,
      clairvoyance: 6,
      clone: 6,
      dig_deeper: 6,
      feed_the_dead: 6,
      grave_robber: 6,
      shuffle_now: 6,
      zombie_kitten: 6,
      timebomb_kitten: 6,
      defuse_timebomb: 3,
      discard: 3,
      search: 3,
      copycat: 1,
    };
    const maxCount = maxCounts[card.name];
    if (!maxCount) {
      // If card doesn't have local physical assets, safely fallback to card back
      return back;
    }
    const rawIndex = typeof card.index === 'number' && !isNaN(card.index) ? card.index : 0;
    const safeIndex = ((rawIndex % maxCount) + maxCount) % maxCount;
    return `/assets/cards/${card.name}/${safeIndex}.png`;
  }
}
