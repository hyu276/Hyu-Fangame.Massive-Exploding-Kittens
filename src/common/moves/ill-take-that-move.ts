import {TheGame} from "../entities/game";
import {PlayerID} from "boardgame.io";

export const selectPlayerForIllTakeThat = (game: TheGame, targetPlayerId: PlayerID) => {
  const actingPlayer = game.players.actingPlayer;
  if (!actingPlayer) return;

  const target = game.players.getPlayer(targetPlayerId);
  if (!target || !target.isAlive || target.id === actingPlayer.id) return;

  if (!game.gameState.illTakeThatTargets) {
    game.gameState.illTakeThatTargets = {};
  }
  if (!game.gameState.illTakeThatTargets[targetPlayerId]) {
    game.gameState.illTakeThatTargets[targetPlayerId] = [];
  }

  game.gameState.illTakeThatTargets[targetPlayerId].push(actingPlayer.id);

  game.turnManager.endStage();
};
