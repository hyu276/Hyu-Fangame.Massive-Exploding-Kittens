import { useState, useRef, useEffect, useCallback } from 'react';
import '../defuse/DefuseOverlay.css';
import { useGame } from '../../../../context/GameContext';
import { BURY_CARD, getCardInfo } from '../../../../../common';
import SimulatedCard, { isCardSimulated } from '../../player/card/SimulatedCard';
import { TheGameClient } from '../../../../entities/game-client';

export default function BuryOverlay() {
  const game = useGame();

  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const cardAmount = game.piles.drawPile.size;
  const isBurying = game.selfPlayer?.isInStage(BURY_CARD);
  const buryingCard = (game.gameState as any).buryingCard;
  const cardInfo = buryingCard ? getCardInfo(buryingCard) : null;
  const isSimulated = buryingCard ? isCardSimulated(buryingCard.name) : false;
  const cardTexture = buryingCard ? TheGameClient.getCardTexture(buryingCard) : '';

  // Khởi tạo vị trí ngẫu nhiên ban đầu khi mở giao diện chôn bài
  useEffect(() => {
    if (isBurying) {
      setInsertIndex(Math.floor(Math.random() * (cardAmount + 1)));
    } else {
      setInsertIndex(null);
    }
  }, [isBurying, cardAmount]);

  const handleBury = () => {
    if (insertIndex !== null) {
      game.buryCard(insertIndex);
    }
  };

  const updatePosition = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    let percentage = relativeY / rect.height;
    percentage = Math.max(0, Math.min(1, percentage));
    const newIndex = Math.round(percentage * cardAmount);
    setInsertIndex(newIndex);
  }, [cardAmount]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientY);
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    updatePosition(e.clientY);
  };

  const handleThumbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    updatePosition(e.touches[0].clientY);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        updatePosition(e.clientY);
      }
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        updatePosition(e.touches[0].clientY);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove, { passive: false });
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, updatePosition]);

  if (!isBurying) {
    return null;
  }

  const currentIdx = insertIndex ?? 0;
  const percentage = cardAmount > 0 ? (currentIdx / cardAmount) * 100 : 0;

  return (
    <div className="defuse-overlay">
      <div className="defuse-content">
        <h2>🪦 Chôn Bài (Bury)</h2>
        <p>
          Bạn đã rút được lá: <strong style={{ color: '#f59e0b' }}>{cardInfo?.vietnameseName ?? 'Thẻ Bài'}</strong>!
          <br />
          Hãy kéo chọn vị trí để bí mật chôn lá này vào Chồng bài rút:
        </p>

        <div className="defuse-interface">
          <div className="depth-markers">
            <div className="marker-label top">Đỉnh bài</div>
            <div className="marker-label mid">
              <div className="marker-line"></div>
            </div>
            <div className="marker-label bottom">Đáy bài</div>
          </div>

          <div
            className="depth-track-container"
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="depth-track-rail"></div>

            <div
              className={`card-thumb ${isDragging ? 'dragging' : ''}`}
              style={{ top: `${percentage}%` }}
              onMouseDown={handleThumbMouseDown}
              onTouchStart={handleThumbTouchStart}
            >
              <div className="thumb-graphic">
                {isSimulated ? (
                  <SimulatedCard card={buryingCard} />
                ) : (
                  <img src={cardTexture} alt={cardInfo?.vietnameseName ?? 'Card'} />
                )}
              </div>
              <div className="thumb-arrow"></div>

              <div className="thumb-tooltip">
                <span className="tooltip-value">
                  {currentIdx === 0
                    ? 'Trên cùng (Đỉnh bài)'
                    : currentIdx === cardAmount
                    ? 'Dưới đáy bộ bài'
                    : `Vị trí thứ ${currentIdx + 1}`}
                </span>
              </div>
            </div>
          </div>

          <div className="info-panel">
            {currentIdx === 0 && <div className="risk-badge high">Đỉnh Bài</div>}
            {currentIdx > 0 && currentIdx < cardAmount && <div className="risk-badge medium">Ẩn Sâu</div>}
            {currentIdx === cardAmount && <div className="risk-badge low">Đáy Bài</div>}
          </div>
        </div>

        <button className="defuse-confirm-btn btn btn-primary" onClick={handleBury}>
          Xác Nhận Chôn Bài
        </button>
      </div>
    </div>
  );
}
