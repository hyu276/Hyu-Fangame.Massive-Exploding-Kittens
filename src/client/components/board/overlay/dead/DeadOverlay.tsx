import './DeadOverlay.css';
import {useGame} from "../../../../context/GameContext.tsx";

export default function DeadOverlay() {
  const game = useGame();

  if (game.isSelfAlive || !game.selfPlayer) {
    return null;
  }

  if (!game.isPlayingPhase()) {
    return null;
  }

  const isZombieKittens = game.selectedDecks?.includes('zombie_kittens');

  return (
    <div className="dead-overlay">
      <div className="dead-overlay-content">
        <h1 className="dead-overlay-title">
          <span className="dead-overlay-icon">{isZombieKittens ? '🧟' : '💥'}</span>
          {isZombieKittens
            ? 'Bạn đã thành Zombie! Vẫn giữ bài và có thể đánh lá NOW hoặc Zombie Kitten để hồi sinh!'
            : 'Bạn đã bị nổ tung!'}
        </h1>
      </div>
    </div>
  );
}
