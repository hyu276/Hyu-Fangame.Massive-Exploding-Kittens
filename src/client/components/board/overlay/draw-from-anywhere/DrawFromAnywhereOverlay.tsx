import { useState, useRef, useEffect, useCallback } from 'react';
import '../defuse/DefuseOverlay.css';
import { useGame } from '../../../../context/GameContext';
import { STAGE_DRAW_FROM_ANYWHERE } from '../../../../../common';
import back from '/assets/cards/back/0.jpg';

export default function DrawFromAnywhereOverlay() {
  const game = useGame();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const cardAmount = game.piles.drawPile.size;
  const isDrawingFromAnywhere = game.selfPlayer?.isInStage(STAGE_DRAW_FROM_ANYWHERE);

  // Khởi tạo vị trí ngẫu nhiên ban đầu khi mở giao diện rút bài từ bất kỳ đâu
  useEffect(() => {
    if (isDrawingFromAnywhere) {
      if (cardAmount > 0) {
        setSelectedIndex(Math.floor(Math.random() * cardAmount));
      } else {
        setSelectedIndex(0);
      }
    } else {
      setSelectedIndex(null);
    }
  }, [isDrawingFromAnywhere, cardAmount]);

  const handleDraw = () => {
    if (selectedIndex !== null) {
      game.drawFromAnywhere(selectedIndex);
    }
  };

  const updatePosition = useCallback((clientY: number) => {
    if (!trackRef.current || cardAmount <= 1) return;
    const rect = trackRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    let percentage = relativeY / rect.height;
    percentage = Math.max(0, Math.min(1, percentage));
    const maxIdx = Math.max(0, cardAmount - 1);
    const newIndex = Math.round(percentage * maxIdx);
    setSelectedIndex(newIndex);
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

  if (!isDrawingFromAnywhere) {
    return null;
  }

  const maxIdx = Math.max(1, cardAmount - 1);
  const currentIdx = selectedIndex ?? 0;
  const percentage = cardAmount > 1 ? (currentIdx / maxIdx) * 100 : 0;

  return (
    <div className="defuse-overlay">
      <div className="defuse-content" style={{ borderColor: '#7c3aed', boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 25px rgba(124, 58, 237, 0.3)' }}>
        <h2 style={{ color: '#a78bfa' }}>🎯 Rút Tùy Ý (Draw From Anywhere)</h2>
        <p>
          Bạn được quyền rút một lá bài ở bất kỳ vị trí nào trong Chồng bài rút:
          <br />
          <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            (Kéo con trượt để chọn độ sâu của lá bài bạn muốn rút)
          </span>
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
                <img src={back} alt="Rút bài" />
              </div>
              <div className="thumb-arrow"></div>

              <div className="thumb-tooltip">
                <span className="tooltip-value">
                  {currentIdx === 0
                    ? 'Lá trên cùng (Đỉnh bài)'
                    : currentIdx === cardAmount - 1
                    ? 'Lá dưới cùng (Đáy bài)'
                    : `Vị trí thứ ${currentIdx + 1} từ đỉnh`}
                </span>
              </div>
            </div>
          </div>

          <div className="info-panel">
            {currentIdx === 0 && <div className="risk-badge high">Đỉnh Bài</div>}
            {currentIdx > 0 && currentIdx < cardAmount - 1 && <div className="risk-badge medium">Lưng Chừng</div>}
            {currentIdx === cardAmount - 1 && <div className="risk-badge low">Đáy Bài</div>}
          </div>
        </div>

        <button
          className="defuse-confirm-btn btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none' }}
          onClick={handleDraw}
        >
          🎯 Xác Nhận Rút Lá Bài Này
        </button>
      </div>
    </div>
  );
}
