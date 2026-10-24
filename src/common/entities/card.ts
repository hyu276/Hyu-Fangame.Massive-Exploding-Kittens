import {ICard} from '../models';
import {TheGame} from './game';
import {cardTypeRegistry} from '../registries/card-registry';
import {CardType} from './card-type';
import {Player} from "./player";
import {Pile} from "./pile";
import type {PlayerID} from "boardgame.io";

export class Card {
  public id: number;
  public name: string;
  public index: number;
  public isMarked?: boolean;
  public isFaceUp?: boolean;
  public isLocked?: boolean;

  constructor(
    private game: TheGame,
    _data: ICard
  ) {
    this.id = _data.id;
    this.name = _data.name;
    this.index = _data.index;
    this.isMarked = _data.isMarked;
    this.isFaceUp = _data.isFaceUp;
    this.isLocked = _data.isLocked;
  }

  get data(): ICard {
    return {id: this.id, name: this.name, index: this.index, isMarked: this.isMarked, isFaceUp: this.isFaceUp, isLocked: this.isLocked};
  }

  setMarked(val: boolean = true) {
    this.isMarked = val;
    for (const p of this.game.players.allPlayers) {
      const c = p.state.hand.find(card => card.id === this.id);
      if (c) c.isMarked = val;
    }
  }

  setLocked(val: boolean = true) {
    this.isLocked = val;
    for (const p of this.game.players.allPlayers) {
      const c = p.state.hand.find(card => card.id === this.id);
      if (c) c.isLocked = val;
    }
  }

  setFaceUp(val: boolean = true) {
    this.isFaceUp = val;
    const c = this.game.piles.drawPile.state.cards.find(card => card.id === this.id);
    if (c) c.isFaceUp = val;
  }

  get type(): CardType {
    const t = cardTypeRegistry.get(this.name);
    if (!t) throw new Error(`Unknown card type: ${this.name}`);
    return t;
  }

  moveTo(destination: Player | Pile, options?: { visibleTo?: PlayerID[], delayMs?: number, insertIndex?: number }): void {
    const { visibleTo, delayMs, insertIndex } = options || {};
    
    const removal = this.game.findAndRemoveCardById(this.id);
    if (!removal) {
      console.error(`Could not find card ${this.name} (${this.id}) to move.`);
      return;
    }
    const { card: cardData, source } = removal;

    // Add to destination
    if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= destination.length) {
      destination.insertCard(this.data, insertIndex);
    } else {
      destination.addCard(this.data);
    }

    // Determine visibility
    let finalVisibleTo: PlayerID[] = [];
    if (visibleTo !== undefined) {
      finalVisibleTo = visibleTo;
    } else {
      // Default inference
      if (destination instanceof Player) {
        finalVisibleTo = [destination.id];
        // If moving between players, make it visible to both
        for (const p of this.game.players.allPlayers) {
          if (p.id === source) {
            finalVisibleTo.push(source);
          }
        }
      } else if (destination instanceof Pile && destination.name === 'discardPile') {
        // Discard pile is public to all players
        finalVisibleTo = [];
      } else {
        // Draw pile or secret piles: only visible to source player
        finalVisibleTo = source ? [source] : [];
      }
    }

    // Enqueue animation
    const toStr = destination instanceof Player ? destination.id : destination.name;
    
    const animation = {
      from: source,
      to: toStr,
      card: cardData,
      visibleTo: finalVisibleTo,
      durationMs: 500
    };
    this.game.animationsQueue.enqueueAnimationWithDelay(animation, { delayMs: delayMs || 0 });
  }

  canPlay(): boolean {
    return this.type.canBePlayed(this.game, this);
  }

  play(): void {
    this.type.onPlayed(this.game, this);
  }

  afterPlay(): void {
    this.type.afterPlay(this.game, this);
  }
}
