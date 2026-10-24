import {PlayerID} from "boardgame.io";
import {TheGame} from "../entities/game";
import {startHandShuffleDefense} from "./hand-shuffle-defense-move";

export function discardPlayerCards(game: TheGame, targetPlayerId: PlayerID) {
  const target = game.players.validateTarget(targetPlayerId);

  // Kích hoạt cơ chế phòng thủ 10 giây cho đối thủ tráo bài
  startHandShuffleDefense(
    game,
    game.players.actingPlayer.id,
    target.id,
    'discard'
  );
}
