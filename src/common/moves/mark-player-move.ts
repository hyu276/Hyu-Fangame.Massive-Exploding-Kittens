import {TheGame} from "../entities/game";
import {startHandShuffleDefense} from "./hand-shuffle-defense-move";

/**
 * Rút ngẫu nhiên một lá bài trên tay mục tiêu để đánh dấu công khai (Mark)
 */
export const markPlayer = (game: TheGame, targetPlayerId: string) => {
  const target = game.players.getPlayer(targetPlayerId);
  if (!target || !target.isAlive || target.handSize === 0) {
    console.error("Invalid target for Mark");
    return;
  }

  // Kích hoạt cơ chế phòng thủ 10 giây cho đối thủ tráo bài
  startHandShuffleDefense(
    game,
    game.players.actingPlayer.id,
    target.id,
    'mark'
  );
};
