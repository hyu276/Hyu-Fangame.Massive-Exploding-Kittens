import type {ICard} from './card.model';
import type {PlayerID} from 'boardgame.io';

export interface IGameRules {
  spectatorsSeeCards: boolean;
  openCards: boolean;
  pendingTimerMs: number;
}

export interface IPendingCardPlay {
  card: ICard;
  playedBy: PlayerID;
  startedAtMs: number;
  expiresAtMs: number;
  lastNopeBy: PlayerID | null;
  nopeCount: number;
  isNoped: boolean;
}

export interface IHandShuffleDefense {
  attackerId: PlayerID;
  targetPlayerId: PlayerID;
  actionType: 'steal' | 'mark' | 'buried_treasure' | 'discard';
  startedAtMs: number;
  expiresAtMs: number;
  spectatorHand?: ICard[];
  snapshotAtMs?: number;
  lastRandomShuffleAtMs?: number;
}

export interface IPendingCardSteal {
  attackerId: PlayerID;
  targetPlayerId: PlayerID;
  cardsToSteal: number;
}

export interface IPiles {
  drawPile: IPile;
  discardPile: IPile;
  pendingCardPlay: IPendingCardPlay | null;
}

export interface IPile {
  cards: ICard[];
  size: number;
}

export interface IAnimationQueue {
  [key: number]: IAnimation[];
}

export interface IAnimation {
  from: number | string;
  to: number | string;
  card: ICard | null;
  visibleTo: PlayerID[];
  durationMs: number;
}

export interface ICarlState {
  isAlive: boolean;
  hasZombieKitten: boolean;
  bombsHeld: number;
  lastAction?: {
    cardDrawnName: string;
    wasBomb: boolean;
    defused: boolean;
    timestamp: number;
  } | null;
}

export interface IGoodVsEvilState {
  godcatInPlaymat: boolean;
  devilcatInPlaymat: boolean;
  godcatHolderId: PlayerID | null;
  armageddonTargetId?: PlayerID | null;
  armageddonAttackerCard?: 'godcat' | 'devilcat' | null;
  armageddonTargetCard?: 'godcat' | 'devilcat' | null;
}

export interface IRageModeState {
  rageCatHolderId: PlayerID | null;
  rageCatUsedThisTurn?: boolean;
  rageCatInitialized?: boolean;
}

export interface ICurseYouState {
  charms: Record<string, string[]>;
  curses: Record<string, string[]>;
  disguiseUsedThisTurn?: boolean;
}

export interface IAnniversaryState {
  plusPlusActive?: boolean;
}

export interface IGameState {
  winner: PlayerID | null;
  deadPlayers: PlayerID[];
  piles: IPiles;
  turnsRemaining: number;
  attackChain?: boolean;
  gameRules: IGameRules;
  deckType: string;
  selectedDecks: string[];
  gameMode: number;
  teams?: Record<string, 'red' | 'blue'>;
  winningTeam?: 'red' | 'blue' | null;
  comboMultiplier?: number;
  lastComboNotification?: {
    multiplier: number;
    cardName: string;
    timestamp: number;
  } | null;
  favorCountRemaining?: number;
  isReversed?: boolean;
  implodingKittenFaceUp?: boolean;
  garbageCollectionPending?: PlayerID[];
  towerOfPowerStash?: ICard[];
  towerOfPowerCrownBearer?: PlayerID | null;
  barkingKittenFaceUpPlayer?: PlayerID | null;
  illTakeThatTargets?: Record<string, string[]>;
  potluckPending?: PlayerID[];
  buryingCard?: ICard | null;
  isSharingFuture?: boolean;
  feedTheDeadTarget?: PlayerID | null;
  feedTheDeadPending?: PlayerID[];
  graveRobberPending?: PlayerID[];
  digDeeperCard?: ICard | null;
  lastDefuseInsertIndex?: number | null;
  lastDefuseSuccess?: { playerID: PlayerID; sequence: number };
  isResurrectingFromDefuse?: boolean;
  defusingVictimId?: PlayerID | null;
  bottomCard?: ICard | null;
  mustDrawFromAnywhereNext?: boolean;
  topDrawCard?: ICard | null;
  handShuffleDefense?: IHandShuffleDefense | null;
  pendingCardSteal?: IPendingCardSteal | null;
  isShuffleForbidden?: boolean;
  searchTopCards?: ICard[];
  blindTargetId?: PlayerID | null;
  discardTargetId?: PlayerID | null;
  catBurglarHolderId?: PlayerID | null;
  catBurglarUsedThisTurn?: boolean;
  catBurglarInitialized?: boolean;
  lastCatBurglarAction?: {
    robberId: PlayerID;
    targetId: PlayerID;
    requestedCatIndex: number;
    catName: string;
    success: boolean;
    timestamp: number;
  } | null;
  lastActionCardName?: string | null;

  // New gamemode sub-states
  carl?: ICarlState;
  recipeSlug?: string;
  goodVsEvil?: IGoodVsEvilState;
  rageMode?: IRageModeState;
  curseYou?: ICurseYouState;
  anniversary?: IAnniversaryState;

  animationsQueue: IAnimationQueue;
  nextCardId: number;
}
