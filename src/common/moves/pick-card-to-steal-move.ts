import { TheGame } from '../entities/game';
import { STAGE_PICK_STOLEN_CARD } from '../constants/stages';

/** The acting attacker chooses a position in the hidden opponent hand. */
export function pickCardToSteal(game: TheGame, chosenCardIndex: number): void {
  const pending = game.gameState.pendingCardSteal;
  const actingId = game.players.actingPlayerId;
  if (!pending || !actingId || pending.attackerId !== actingId ||
      !game.turnManager.isInStage(actingId, STAGE_PICK_STOLEN_CARD)) {
    throw new Error('No pending steal for this player');
  }

  const attacker = game.players.getPlayer(actingId);
  const target = game.players.getPlayer(pending.targetPlayerId);
  if (!attacker?.isAlive || !target?.isAlive || target.hasLeft) {
    throw new Error('Steal participants are no longer active');
  }
  const stash = game.gameState.towerOfPowerCrownBearer === target.id
    ? game.gameState.towerOfPowerStash : undefined;
  const available = stash?.length || target.handSize;
  if (!Number.isInteger(chosenCardIndex) || chosenCardIndex < 0 || chosenCardIndex >= available) {
    throw new Error('Selected hidden slot is out of range');
  }

  // Clear the selection stage *before* the transfer can trigger a Defuse stage.
  const finalPick = pending.cardsToSteal <= 1 || available === 1;
  if (finalPick) {
    game.gameState.pendingCardSteal = null;
    game.turnManager.endStage();
  } else {
    pending.cardsToSteal -= 1;
  }

  attacker.stealCardAt(target, chosenCardIndex);

  // A lethal / defensive card interruption takes precedence over subsequent picks.
  if (!finalPick && (!attacker.isAlive ||
      !game.turnManager.isInStage(actingId, STAGE_PICK_STOLEN_CARD))) {
    game.gameState.pendingCardSteal = null;
  }
}
