import './TurnBadge.css';
import {useGame} from "../../../../context/GameContext.tsx";

/**
 * Hiển thị số lượt còn lại của người chơi hiện tại khi bị tấn công (attacked)
 */
export default function TurnBadge() {
  const game = useGame();

  const turnsRemaining = game.turnManager.turnsRemaining || 1;

  // Không hiển thị nếu chỉ còn 1 lượt (lượt bình thường)
  if (turnsRemaining <= 1) {
    return null;
  }

  return (
    <div className={`turn-badge ${game.isSelfCurrentPlayer ? 'is-self' : 'is-other'}`}>
      <div className="turn-badge-content">
        <div className="turn-badge-icon">⚔️</div>
        <div className="turn-badge-text">
          <div className="turn-badge-count">{turnsRemaining}</div>
          <div className="turn-badge-label">
            Lượt còn lại
          </div>
        </div>
      </div>
      {game.isSelfCurrentPlayer && (
        <div className="turn-badge-message">
          Bạn bị tấn công! Hãy hoàn thành {turnsRemaining} lượt chơi.
        </div>
      )}
    </div>
  );
}
