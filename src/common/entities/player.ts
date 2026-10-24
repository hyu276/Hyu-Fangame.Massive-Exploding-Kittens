import {IPlayer} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";
import {EXPLODING_KITTEN, DEFUSE} from "../registries/card-registry";
import {
  CHOOSE_PLAYER_TO_REQUEST_FROM,
  CHOOSE_PLAYER_TO_STEAL_FROM,
  CHOOSE_PLAYER_FOR_TARGETED_ATTACK,
  CHOOSE_PLAYER_FOR_MARK,
  CHOOSE_PLAYER_FOR_CURSE,
  CHOOSE_PLAYER_FOR_ILL_TAKE_THAT,
  CHOOSE_PLAYER_FOR_ANNOY,
  DEFUSE_EXPLODING_KITTEN,
  CHOOSE_DEAD_PLAYER_FOR_RESURRECTION,
  CHOOSE_DEAD_PLAYER_FOR_FEED,
  RESPOND_WITH_NOW_CARD,
  CHOOSE_PLAYER_FOR_BLIND,
  CHOOSE_PLAYER_FOR_DISCARD
} from "../constants/stages";
import {PlayerID} from "boardgame.io";
import {
  NAME_NOPE,
  NAME_IMPLODING_KITTEN,
  NAME_STREAKING_KITTEN,
  NAME_ZOMBIE_KITTEN,
  NAME_TIMEBOMB_KITTEN,
  NAME_DEFUSE_TIMEBOMB,
  NAME_EXPLODING_MINION,
  NAME_MINION_DEFUSE,
  NAME_BOOBY_TRAP_KITTEN
} from "../constants/cards";
import { GAME_MODE_COMBO, GAME_MODE_ZOMBIE_STANDALONE, GAME_MODE_ZOMBIE_APOCALYPSE, GAME_MODE_ZOMBIE_CARL } from "../constants/game-modes";
import {CardHolder} from "./card-holder";

export class Player extends CardHolder {
  constructor(
    game: TheGame,
    public _state: IPlayer,
    public readonly id: PlayerID
  ) {
    super(
      game,
      () => _state.hand,
      (cards) => { _state.hand = cards; },
      () => { _state.handSize = _state.hand.length; }
    );
  }

  /**
   * Get the player's hand of card-types
   */
  get hand(): Card[] {
    return this.cards;
  }

  get handSize(): number {
    return this._state.handSize ?? this.cards.length;
  }

  get isCurrentPlayer(): boolean {
    return this.id === this.game.players.currentPlayer.id;
  }

  get isActingPlayer(): boolean {
    return this.id === this.game.players.actingPlayer.id;
  }

  get isAlive(): boolean {
    return this._state.isAlive;
  }

  get hasLeft(): boolean { return !!this._state.hasLeft; }

  leave(): void {
    this._state.hasLeft = true;
    this.eliminate(false);
    this.removeAllCardsFromList().forEach(card => this.game.piles.discardCard(card));
    this.activeTimebombs = [];
  }

  get isValidCardTarget(): boolean {
    return this.isAlive && this.handSize > 0;
  }

  get canNope(): boolean {
    if (!this.hand.some(c => c.name === NAME_NOPE && !c.isLocked)) {
      return false;
    }
    if (!this.game.piles.pendingCard) {
      return false;
    }

    const pending = this.game.piles.pendingCard;

    // Player cannot nope their own card play if it hasn't been noped yet
    // If it HAS been noped, they can re-nope (un-nope) it, unless they were the last person to nope it
    if (!pending.isNoped && pending.playedBy === this.id) {
      return false;
    }

    // Player cannot nope their own nope card (cannot double-nope themselves immediately)
    if (pending.lastNopeBy === this.id) {
      return false;
    }

    // Check expiration
    // Note: Date.now() on client might differ from server, but usually this is acceptable for UI state
    if (pending.expiresAtMs > pending.startedAtMs) {
      return Date.now() <= pending.expiresAtMs;
    }
    return true;
  }

  get state(): IPlayer {
    return this._state;
  }

  get isBlinded(): boolean {
    return !!this._state.isBlinded;
  }

  set isBlinded(val: boolean) {
    this._state.isBlinded = val;
  }

  get activeTimebombs(): { id: string | number; turnsLeft: number }[] {
    return this._state.activeTimebombs || [];
  }

  set activeTimebombs(bombs: { id: string | number; turnsLeft: number }[]) {
    this._state.activeTimebombs = bombs;
  }

  addTimebomb(cardId: string | number): void {
    if (!this._state.activeTimebombs) {
      this._state.activeTimebombs = [];
    }
    // Khởi tạo 3 lượt chơi sau khi rút (cộng 1 vì onEnd của lượt rút này sẽ trừ ngay 1)
    this._state.activeTimebombs.push({ id: cardId, turnsLeft: 4 });
  }

  defuseTimebomb(): boolean {
    if (!this._state.activeTimebombs || this._state.activeTimebombs.length === 0) {
      return false;
    }
    this._state.activeTimebombs.shift();
    return true;
  }

  get isCardPlayBlocked(): boolean {
    return !!this._state.isCardPlayBlocked;
  }

  set isCardPlayBlocked(val: boolean) {
    this._state.isCardPlayBlocked = val;
  }

  canGiveCard(): boolean {
    return this.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM);
  }

  canSelectPlayer(): boolean {
    return this.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM)
      || this.isInStage(CHOOSE_PLAYER_TO_STEAL_FROM)
      || this.isInStage(CHOOSE_PLAYER_FOR_TARGETED_ATTACK)
      || this.isInStage(CHOOSE_PLAYER_FOR_MARK)
      || this.isInStage(CHOOSE_PLAYER_FOR_CURSE)
      || this.isInStage(CHOOSE_PLAYER_FOR_ILL_TAKE_THAT)
      || this.isInStage(CHOOSE_PLAYER_FOR_ANNOY)
      || this.isInStage(CHOOSE_PLAYER_FOR_BLIND)
      || this.isInStage(CHOOSE_PLAYER_FOR_DISCARD)
      || this.isInStage(CHOOSE_DEAD_PLAYER_FOR_RESURRECTION)
      || this.isInStage(CHOOSE_DEAD_PLAYER_FOR_FEED);
  }

  eliminate(endTurn = true): void {
    if (!this.isAlive) return;
    this._state.isAlive = false;
    this.game.context.G.deadPlayers.push(this.id);

    // Dọn dẹp trạng thái phụ kiện Vương miện Tower of Power nếu người chết đang đội
    if (this.game.gameState.towerOfPowerCrownBearer === this.id) {
      if (this.game.gameState.towerOfPowerStash) {
        this.game.gameState.towerOfPowerStash.forEach(rawCard => {
          const card = new Card(this.game, rawCard);
          this.game.piles.discardCard(card);
        });
        this.game.gameState.towerOfPowerStash = [];
      }
      this.game.gameState.towerOfPowerCrownBearer = null;
    }

    // Dọn dẹp Barking Kitten đặt trước mặt nếu có
    if (this.game.gameState.barkingKittenFaceUpPlayer === this.id) {
      this.game.gameState.barkingKittenFaceUpPlayer = null;
    }

    // Dọn dẹp các mục tiêu I'll Take That nhắm vào người này
    if (this.game.gameState.illTakeThatTargets?.[this.id]) {
      delete this.game.gameState.illTakeThatTargets[this.id];
    }

    // Dọn dẹp phụ kiện Cat Burglar nếu người chết đang giữ (bị loại khỏi trận theo Rule 3.2)
    if (this.game.gameState.catBurglarHolderId === this.id) {
      this.game.gameState.catBurglarHolderId = null;
    }

    // Rage Mode: Người giữ Rage Cat chết thì chuyển cho người sống kế tiếp bên trái
    if (this.game.gameState.rageMode?.rageCatHolderId === this.id) {
      const playOrder = this.game.turnManager.playOrder;
      const holderPos = playOrder.indexOf(this.id);
      let nextLiving: Player | null = null;
      for (let offset = 1; offset < playOrder.length; offset++) {
        const candidate = this.game.players.getPlayer(playOrder[(holderPos + offset) % playOrder.length]);
        if (candidate.isAlive) {
          nextLiving = candidate;
          break;
        }
      }
      this.game.gameState.rageMode.rageCatHolderId = nextLiving ? nextLiving.id : null;
    }

    // Undead Rule: Nếu gói Zombie Kittens hoặc mode Zombie Standalone / Zombie Apocalypse / Zombie Carl được kích hoạt, người chơi đã chết giữ nguyên bài trên tay!
    const isZombieKittensActive = 
      this.game.gameState.gameMode === GAME_MODE_ZOMBIE_STANDALONE ||
      this.game.gameState.gameMode === GAME_MODE_ZOMBIE_APOCALYPSE ||
      this.game.gameState.gameMode === GAME_MODE_ZOMBIE_CARL ||
      this.game.selectedDecks?.includes('zombie_kittens');
    if (!isZombieKittensActive) {
      // put all hand card-types in discard pile
      const cards = this.removeAllCardsFromList();
      cards.forEach(card => this.game.piles.discardCard(card));
    }
    if (endTurn && this.isActingPlayer) {
      this.game.turnManager.endStage(); // could also involve other players but better than being stuck
    }
    if (this.isCurrentPlayer) {
      this.game.turnManager.turnsRemaining = 1;
      if (endTurn) this.game.turnManager.endTurn();
    }
  }

  resurrect(): void {
    if (this.hasLeft) throw new Error('Người chơi đã rời trận không thể hồi sinh');
    this._state.isAlive = true;
    const deadList = this.game.context.G.deadPlayers;
    const idx = deadList.indexOf(this.id);
    if (idx !== -1) {
      deadList.splice(idx, 1);
    }
  }

  isInStage(stage: string): boolean {
    return this.game.turnManager.isInStage(this, stage);
  }

  /**
   * Transfers a card at specific index to another playerWrapper
   */
  giveCard(cardIndex: number, recipient: Player): Card {
    const card = this.getCardAt(cardIndex);
    if (!card) {
      throw new Error("Card not found or invalid index");
    }
    card.setMarked(false);
    card.moveTo(recipient);

    recipient.checkExplodingKittenHazard();
    this.checkExplodingKittenHazard();

    return card;
  }

  checkExplodingKittenHazard(): void {
    if (!this.isAlive) return;

    const explodingCount = this.hand.filter(c => c.name === EXPLODING_KITTEN.name).length;
    if (explodingCount === 0) return;

    const hasStreaking = this.hasCard(NAME_STREAKING_KITTEN);
    if (hasStreaking && explodingCount <= 1) {
      return;
    }

    if (!this.hand.some(c => !c.isLocked && [DEFUSE.name, NAME_ZOMBIE_KITTEN, NAME_DEFUSE_TIMEBOMB].includes(c.name))) {
      this.eliminate();
      return;
    }

    if (this.game.piles.drawPile.size <= 0) {
      this.defuseExplodingKitten(0);
      return;
    }

    this.game.turnManager.setActivePlayers({
      value: {
        [this.id]: DEFUSE_EXPLODING_KITTEN,
      },
    });
  }

  /** Resolve the Rage Mode hazard that only triggers when this card is stolen. */
  resolveStolenCardHazard(card: Card): void {
    if (card.name !== NAME_BOOBY_TRAP_KITTEN || !this.isAlive) return;

    const defuseIdx = this.hand.findIndex(c => c.name === DEFUSE.name && !c.isLocked);
    if (defuseIdx === -1) {
      this.eliminate();
      return;
    }

    const defuse = this.hand[defuseIdx];
    defuse.moveTo(this.game.piles.discardPile);
    card.moveTo(this.game.piles.discardPile);
  }

  playCard(cardIndex: number): void {
    if (!Number.isInteger(cardIndex) || cardIndex < 0 || cardIndex >= this.hand.length) {
      throw new Error(`Invalid card index: ${cardIndex}`);
    }

    const card = this.hand[cardIndex];

    if (!this.isCurrentPlayer && !card.type.isNowCard()) {
      throw new Error("Chỉ có thể đánh bài ngoài lượt khi lá bài có mã NOW hoặc Zombie Kitten!");
    }

    if (!this.isAlive && !card.type.isNowCard()) {
      throw new Error("Người chơi đã chết chỉ có thể đánh các thẻ bài NOW hoặc Zombie Kitten");
    }

    if (this.isCardPlayBlocked && !card.type.isNowCard()) {
      throw new Error("Bạn đang bị khóa đánh bài ở lượt này bởi thẻ Blind!");
    }

    if (card.isLocked) {
      throw new Error(`Lá bài ${card.name} đang bị khóa bởi hiệu ứng Annoy, không thể sử dụng!`);
    }

    if (!this.game.piles.canCardBePlayed(card)) {
      throw new Error(`Cannot play card: ${card.name}`);
    }

    const cardData = {...card.data}; // save before moveTo

    // Ghi nhớ lá hành động hợp lệ vừa đánh (cho Copycat sao chép)
    this.game.gameState.lastActionCardName = card.name;

    // Chế độ Liên Hoàn (Mode 2): Quay cơ hội kích hoạt hiệu ứng x2 hoặc x3 (trừ các lá gỡ bom)
    const isDefuseCard = [DEFUSE.name, NAME_DEFUSE_TIMEBOMB, NAME_ZOMBIE_KITTEN].includes(card.name);
    if (this.game.gameState.gameMode === GAME_MODE_COMBO && !isDefuseCard) {
      let mult = this.game.gameState.comboMultiplier && this.game.gameState.comboMultiplier > 1
        ? this.game.gameState.comboMultiplier
        : 1;
      if (mult === 1) {
        const roll = this.game.random.Number();
        if (roll < 0.15) {
          mult = 3;
        } else if (roll < 0.50) {
          mult = 2;
        }
      }
      this.game.gameState.comboMultiplier = mult;
      if (mult > 1) {
        this.game.gameState.lastComboNotification = {
          multiplier: mult,
          cardName: card.name,
          timestamp: Date.now()
        };
      } else {
        this.game.gameState.lastComboNotification = null;
      }
    } else {
      this.game.gameState.comboMultiplier = 1;
      this.game.gameState.lastComboNotification = null;
    }

    // Move to discard
    card.moveTo(this.game.piles.discardPile);
    
    card.afterPlay();

    if (card.type.isNowCard()) {
      card.play();
      return;
    }

    // Setup pending state
    const startedAtMs = Date.now();
    this.game.piles.pendingCard = {
      card: cardData,
      playedBy: this.id,
      startedAtMs,
      expiresAtMs: startedAtMs + (this.game.gameRules.pendingTimerMs ?? 0),
      lastNopeBy: null,
      nopeCount: 0,
      isNoped: false
    };

    card.type.setupPendingState(this.game);
  }

  draw(): void {
    if (!this.isAlive) throw new Error("Dead player cannot draw");

    const cards = this.game.piles.drawPile.allCards;
    if (cards.length === 0) {
      console.error("Draw pile is empty, cannot draw");
      this.eliminate();
      return;
    }
    const card = cards[0];
    this.handleDrawnCard(card);
  }

  drawFromBottom(): void {
    if (!this.isAlive) throw new Error("Dead player cannot draw");

    const cards = this.game.piles.drawPile.allCards;
    if (cards.length === 0) {
      console.error("Draw pile is empty, cannot draw");
      this.eliminate();
      return;
    }
    const card = cards[cards.length - 1];
    this.handleDrawnCard(card);
  }

  handleDrawnCard(card: Card): void {
    // 0. Kiểm tra nếu người chơi đang bị nhắm mục tiêu bởi 'I'll Take That'
    const illTakeTargets = this.game.gameState.illTakeThatTargets?.[this.id];
    if (illTakeTargets && illTakeTargets.length > 0) {
      const benefactorId = illTakeTargets.shift()!;
      const benefactor = this.game.players.getPlayer(benefactorId);
      if (benefactor && benefactor.isAlive) {
        card.moveTo(benefactor);
        benefactor.checkExplodingKittenHazard();
        if (this.isBlinded) {
          this.isBlinded = false;
        }
        this.game.turnManager.endTurn();
        return;
      }
    }

    const isExplodingKitten = card.name === EXPLODING_KITTEN.name;
    const isExplodingMinion = card.name === NAME_EXPLODING_MINION;
    const isImplodingKitten = card.name === NAME_IMPLODING_KITTEN;
    const isTimebombKitten = card.name === NAME_TIMEBOMB_KITTEN;

    const protectedKitten = isExplodingKitten && this.hasCard(NAME_STREAKING_KITTEN) && !this.hasCard(EXPLODING_KITTEN.name);
    card.moveTo(this, { visibleTo: ((isExplodingKitten && !protectedKitten) || isExplodingMinion || isImplodingKitten || isTimebombKitten) ? [] : [this.id] });

    // 1. Rút phải Timebomb Kitten
    if (isTimebombKitten) {
      // Đặt công khai trước mặt với bộ đếm 3 lượt
      this.addTimebomb(card.id);
      // Xóa khỏi hand bằng entity method để handSize được cập nhật chính xác
      this.removeCardById(card.id);
      if (this.isBlinded) {
        this.isBlinded = false;
      }
      this.unlockAllCards();
      this.game.turnManager.endTurn();
      return;
    }

    // 2. Rút phải Imploding Kitten
    if (isImplodingKitten) {
      if (this.game.gameState.implodingKittenFaceUp || card.isFaceUp) {
        // Đã ngửa mặt: nổ ngay lập tức, không thể cứu bằng Defuse!
        this.eliminate();
        return;
      }
      // Lần đầu rút (đang úp): lật ngửa mặt và nhét lại vào bộ bài
      this.game.gameState.implodingKittenFaceUp = true;
      card.isFaceUp = true;
      if (this.game.piles.drawPile.size <= 0) {
        card.moveTo(this.game.piles.drawPile, { insertIndex: 0 });
        this.game.turnManager.endTurn();
        return;
      }
      this.game.turnManager.setActivePlayers({
        currentPlayer: DEFUSE_EXPLODING_KITTEN,
        others: {
          stage: RESPOND_WITH_NOW_CARD,
        },
      });
      return;
    }

    // 3. Rút phải Exploding Kitten
    if (isExplodingKitten) {
      const explodingCountInHand = this.hand.filter(c => c.name === EXPLODING_KITTEN.name).length;
      const hasStreakingKitten = this.hasCard(NAME_STREAKING_KITTEN);

      if (hasStreakingKitten && explodingCountInHand <= 1) {
        // An toàn bí mật giữ Exploding Kitten trên tay nhờ Streaking Kitten
        if (this.isBlinded) {
          this.isBlinded = false;
        }
        this.game.turnManager.endTurn();
        return;
      }

      const hasUsableDefuse = this.hand.some(
        c => (c.name === DEFUSE.name || c.name === NAME_ZOMBIE_KITTEN || c.name === NAME_DEFUSE_TIMEBOMB) && !c.isLocked
      );
      if (!hasUsableDefuse) {
        this.eliminate();
        return;
      }

      if (this.game.piles.drawPile.size <= 0) {
        this.defuseExplodingKitten(0);
        return;
      }
      this.game.turnManager.setActivePlayers({
        currentPlayer: DEFUSE_EXPLODING_KITTEN,
        others: {
          stage: RESPOND_WITH_NOW_CARD,
        },
      });
      return;
    }

    // 3b. Exploding Minions uses its own bomb/Defuse names but the same
    // secret reinsertion flow as the base game.
    if (isExplodingMinion) {
      const hasUsableDefuse = this.hand.some(c => c.name === NAME_MINION_DEFUSE && !c.isLocked);
      if (!hasUsableDefuse) {
        this.eliminate();
        return;
      }
      if (this.game.piles.drawPile.size <= 0) {
        this.defuseExplodingKitten(0);
        return;
      }
      this.game.turnManager.setActivePlayers({
        currentPlayer: DEFUSE_EXPLODING_KITTEN,
        others: { stage: RESPOND_WITH_NOW_CARD },
      });
      return;
    }

    // 4. Thẻ bài thông thường (rút an toàn -> giải trừ mù bài và mở khóa bài nếu có)
    if (this.isBlinded) {
      this.isBlinded = false;
    }
    this.unlockAllCards();
    this.game.turnManager.endTurn();
  }

  defuseExplodingKitten(insertIndex: number): void {
    const drawPile = this.game.piles.drawPile;

    if (!Number.isInteger(insertIndex) || insertIndex < 0 || insertIndex > drawPile.size) {
      throw new Error('Invalid insert index');
    }

    // Trường hợp can thiệp bởi lá "I'll Take It From Here": người can thiệp đặt Mèo Nổ thay cho nạn nhân!
    if (this.game.gameState.defusingVictimId) {
      const victimId = this.game.gameState.defusingVictimId;
      const victim = this.game.players.getPlayer(victimId);
      this.game.gameState.defusingVictimId = null;

      if (victim) {
        const kittenCardIdx = victim.findCardIndex(EXPLODING_KITTEN.name);
        const implodingCardIdx = victim.findCardIndex(NAME_IMPLODING_KITTEN);

        if (kittenCardIdx !== -1) {
          const kittenCard = victim.hand[kittenCardIdx];
          kittenCard.moveTo(drawPile, { insertIndex: insertIndex });
        } else if (implodingCardIdx !== -1) {
          const implodingCard = victim.hand[implodingCardIdx];
          implodingCard.moveTo(drawPile, { insertIndex: insertIndex });
        }
      }

      this.recordDefuse(insertIndex);
      this.unlockAllCards();
      this.game.turnManager.endStage();
      this.game.turnManager.endTurn();
      return;
    }

    // Kiểm tra xem có phải đang nhét lại Imploding Kitten không (không cần tốn Defuse)
    const implodingCardIdx = this.findCardIndex(NAME_IMPLODING_KITTEN);
    if (implodingCardIdx !== -1) {
      const implodingCard = this.hand[implodingCardIdx];
      implodingCard.isFaceUp = true;
      implodingCard.moveTo(drawPile, { insertIndex: insertIndex });
      this.unlockAllCards();
      this.game.turnManager.endStage();
      this.game.turnManager.endTurn();
      return;
    }

    const defuseCardIdx = this.hand.findIndex(c => c.name === DEFUSE.name && !c.isLocked);
    const defuseTimebombCardIdx = this.hand.findIndex(c => c.name === NAME_DEFUSE_TIMEBOMB && !c.isLocked);
    const zombieCardIdx = this.hand.findIndex(c => c.name === NAME_ZOMBIE_KITTEN && !c.isLocked);
    const minionDefuseCardIdx = this.hand.findIndex(c => c.name === NAME_MINION_DEFUSE && !c.isLocked);
    const explodingKittenIdx = this.findCardIndex(EXPLODING_KITTEN.name);
    const explodingMinionIdx = this.findCardIndex(NAME_EXPLODING_MINION);
    const kittenCardIdx = explodingKittenIdx !== -1 ? explodingKittenIdx : explodingMinionIdx;

    if (kittenCardIdx === -1 || (defuseCardIdx === -1 && defuseTimebombCardIdx === -1 && zombieCardIdx === -1 && minionDefuseCardIdx === -1)) {
      // Should not happen if UI is correct, but safer to eliminate
      this.eliminate();
      return;
    }

    let saveCard: Card;
    let isZombieKitten = false;
    if (defuseCardIdx !== -1) {
      saveCard = this.hand[defuseCardIdx];
    } else if (defuseTimebombCardIdx !== -1) {
      saveCard = this.hand[defuseTimebombCardIdx];
    } else if (minionDefuseCardIdx !== -1) {
      saveCard = this.hand[minionDefuseCardIdx];
    } else {
      saveCard = this.hand[zombieCardIdx];
      isZombieKitten = true;
    }

    const kittenCard = this.hand[kittenCardIdx];
    const discardPile = this.game.piles.discardPile;
    
    saveCard.moveTo(discardPile);
    kittenCard.moveTo(drawPile, { insertIndex: insertIndex });
    this.recordDefuse(insertIndex);
    this.unlockAllCards();

    this.game.turnManager.endStage();

    const deadPlayers = this.game.players.allPlayers.filter(player => !player.isAlive && !player.hasLeft);
    if (isZombieKitten && deadPlayers && deadPlayers.length > 0) {
      this.game.gameState.isResurrectingFromDefuse = true;
      this.game.turnManager.setStage(CHOOSE_DEAD_PLAYER_FOR_RESURRECTION, this.id);
    } else {
      this.game.turnManager.endTurn();
    }
  }

  unlockAllCards(): void {
    for (const card of this.hand) {
      if (card.isLocked) {
        card.setLocked(false);
      }
    }
  }

  private recordDefuse(insertIndex: number): void {
    this.game.gameState.lastDefuseInsertIndex = insertIndex;
    this.game.gameState.lastDefuseSuccess = {
      playerID: this.id,
      sequence: (this.game.gameState.lastDefuseSuccess?.sequence ?? 0) + 1,
    };
  }

  stealRandomCardFrom(target: Player): Card {
    // 1. Kiểm tra nếu đối thủ đang đội Vương miện Tower of Power và còn kho bài dự trữ
    if (
      target.id === this.game.gameState.towerOfPowerCrownBearer &&
      this.game.gameState.towerOfPowerStash &&
      this.game.gameState.towerOfPowerStash.length > 0
    ) {
      const stash = this.game.gameState.towerOfPowerStash;
      const index = Math.floor(this.game.random.Number() * stash.length);
      const rawCard = stash.splice(index, 1)[0];
      const card = new Card(this.game, rawCard);
      this.addCard(card);
      this.checkExplodingKittenHazard();

      // Nếu kho dự trữ đã hết sạch bài, vương miện biến mất
      if (stash.length === 0) {
        this.game.gameState.towerOfPowerCrownBearer = null;
      }
      return card;
    }

    const count = target.handSize;
    if (count === 0) throw new Error("Target has no cards");

    // Use game context random
    const index = Math.floor(this.game.random.Number() * count);
    // Give card from target to this player
    const stolen = target.giveCard(index, this);
    this.resolveStolenCardHazard(stolen);
    return stolen;
  }
}
