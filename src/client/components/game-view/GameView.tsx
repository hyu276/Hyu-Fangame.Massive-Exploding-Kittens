import {useState} from 'react';
import './GameView.css';
import { RulebookButton } from '../rulebook/Rulebook';
import { SettingsButton } from '../settings/SettingsModal';

interface GameViewProps {
  matchID: string;
  matchName?: string;
  numPlayers?: number;
  onLeave: () => void;
  children: React.ReactNode;
}

export default function GameView({onLeave, children}: GameViewProps) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const handleLeaveClick = () => {
    setShowLeaveModal(true);
  };

  const confirmLeave = async () => {
    if (leaving) return;
    setLeaving(true);
    setLeaveError(null);
    try {
      const confirmations: Promise<void>[] = [];
      window.dispatchEvent(new CustomEvent('ek_forfeit', {
        detail: { waitUntil: (work: Promise<void>) => confirmations.push(work) },
      }));
      await Promise.all(confirmations);
      onLeave();
    } catch (error) {
      setLeaveError(error instanceof Error ? error.message : 'Không thể rời trận. Vui lòng thử lại.');
    } finally { setLeaving(false); }
  };

  const cancelLeave = () => {
    if (leaving) return;
    setShowLeaveModal(false);
  };

  return (
    <div className="game-view-container">
      <RulebookButton />
      <SettingsButton />
      <button className="leave-button" onClick={handleLeaveClick}>
        <span>←</span>
        <span>Rời trận</span>
      </button>

      {children}

      {showLeaveModal && (
        <div className="leave-modal-overlay" onClick={cancelLeave}>
          <div className="leave-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="leave-modal-icon">⚠️</div>
            <h3 className="leave-modal-title">Rời trận đấu?</h3>
            <p className="leave-modal-text">
              Nếu bạn rời trận khi ván đấu đang diễn ra, bạn sẽ bị xử thua (loại khỏi ván) để đảm bảo ván chơi tiếp tục bình thường cho những người chơi khác.
            </p>
            <div className="leave-modal-actions">
              <button className="btn btn-secondary" onClick={cancelLeave} disabled={leaving}>
                Ở lại
              </button>
              <button className="btn btn-danger" onClick={confirmLeave} disabled={leaving}>
                {leaving ? 'Đang rời trận…' : 'Rời trận'}
              </button>
            </div>
            {leaveError && <p role="alert">{leaveError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
