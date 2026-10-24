import type { IHandShuffleDefense } from '../models';
import { TheGame } from './game';

/** Authoritative snapshots; clients must not receive the stored hand through G. */
export class HandShuffleDefense {
  constructor(private game: TheGame) {}

  begin(defense: IHandShuffleDefense) {
    const target = this.game.players.getPlayer(defense.targetPlayerId);
    this.game.gameState.handShuffleDefense = {
      ...defense,
      spectatorHand: target.hand.map(card => card.data),
      snapshotAtMs: defense.startedAtMs,
      lastRandomShuffleAtMs: defense.startedAtMs,
    };
  }

  publishSnapshot() {
    const defense = this.game.gameState.handShuffleDefense;
    if (!defense) return;
    const elapsed = Math.max(0, Date.now() - defense.startedAtMs);
    const duration = defense.expiresAtMs - defense.startedAtMs;
    const checkpoint = elapsed >= duration ? duration : Math.floor(elapsed / 3000) * 3000;
    const snapshotAt = defense.startedAtMs + checkpoint;
    if (snapshotAt <= (defense.snapshotAtMs ?? defense.startedAtMs)) return;
    defense.spectatorHand = this.game.players.getPlayer(defense.targetPlayerId).hand.map(card => card.data);
    defense.snapshotAtMs = snapshotAt;
  }

  shuffle() {
    const defense = this.game.gameState.handShuffleDefense;
    if (!defense || this.game.players.actingPlayerId !== defense.targetPlayerId) return;
    this.game.players.actingPlayer.shuffle();
    defense.lastRandomShuffleAtMs = Date.now();
  }
}
