import {IContext} from "../models";
import {Player} from "./player";
import {PlayerID} from "boardgame.io";
import {RESPOND_WITH_NOW_CARD} from "../constants/stages";

export const IDLE_STAGE = 'idle';

export class TurnManager {
  constructor(private context: IContext) {}

  get turnsRemaining(): number {
    return this.context.G.turnsRemaining;
  }

  set turnsRemaining(value: number) {
    this.context.G.turnsRemaining = value;
  }

  addAttackTurns(amount: number): void {
    const owed = this.context.G.attackChain ? this.turnsRemaining : 0;
    this.turnsRemaining = owed + amount + 1; // onEnd consumes the attacker's completed turn.
    this.context.G.attackChain = true;
  }

  get playOrder(): PlayerID[] {
    return this.context.ctx.playOrder;
  }

  get playOrderPos(): number {
    return this.context.ctx.playOrderPos;
  }

  get numMoves(): number | undefined {
    return this.context.ctx.numMoves || 0;
  }

  get activePlayers(): Record<string, string> | null {
    return this.context.ctx.activePlayers as Record<string, string> | null;
  }

  isInStage(player: Player | PlayerID, stage: string): boolean {
    const playerId = typeof player === 'string' ? player : player.id;
    return this.activePlayers?.[playerId] === stage;
  }

  endTurn(arg?: any): void {
    this.context.events.endTurn(arg);
  }

  setStage(stage: string, targetPlayerId?: PlayerID): void {
    const target = targetPlayerId ?? (this.context.G as any).lastPendingPlayedBy ?? this.context.playerID ?? this.context.ctx.currentPlayer;
    if (target) {
      this.setActivePlayers({
        value: {
          [target]: stage
        }
      });
    } else {
      this.context.events.setStage(stage);
    }
  }

  endStage(): void {
    this.context.events.endStage();
    this.setActivePlayers({ value: {} });
  }

  setActivePlayers(arg: any): void {
    const value: Record<string, string | null> = Object.fromEntries(this.playOrder.map(id => [id, IDLE_STAGE]));
    if (arg.currentPlayer !== undefined) value[this.context.ctx.currentPlayer] = arg.currentPlayer;
    if (arg.others !== undefined) {
      for (const id of this.playOrder) if (id !== this.context.ctx.currentPlayer) value[id] = typeof arg.others === 'string' ? arg.others : arg.others.stage;
    }
    if (arg.all !== undefined) for (const id of this.playOrder) value[id] = arg.all;
    Object.assign(value, arg.value);
    if (Object.values(value).every(stage => stage === IDLE_STAGE)) {
      value[this.context.ctx.currentPlayer] = null;
      for (const id of this.playOrder) {
        if (id !== this.context.ctx.currentPlayer) {
          value[id] = RESPOND_WITH_NOW_CARD;
        }
      }
    }
    this.context.events.setActivePlayers({ ...arg, currentPlayer: undefined, others: undefined, all: undefined, value });
  }
}
