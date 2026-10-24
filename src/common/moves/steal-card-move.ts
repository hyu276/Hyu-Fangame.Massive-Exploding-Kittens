import {PlayerID} from "boardgame.io";
import {TheGame} from "../entities/game";
import {startHandShuffleDefense} from "./hand-shuffle-defense-move";

export function stealCard(game: TheGame, targetPlayerId: PlayerID) {
  // Validate target player
  const targetPlayer = game.players.validateTarget(targetPlayerId);

  // Kích hoạt cơ chế phòng thủ 10 giây cho đối thủ tráo bài
  startHandShuffleDefense(
    game,
    game.players.actingPlayer.id,
    targetPlayer.id,
    'steal'
  );
}
