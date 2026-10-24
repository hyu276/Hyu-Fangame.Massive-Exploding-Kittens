import { useState, useRef, useEffect, useCallback } from 'react';
import './DefuseOverlay.css';
import { useGame } from '../../../../context/GameContext';
import { DEFUSE_EXPLODING_KITTEN, NAME_IMPLODING_KITTEN } from '../../../../../common';

export default function DefuseOverlay() {
  const game = useGame();
  
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const cardAmount = game.piles.drawPile.size;
  const isDefusing = game.selfPlayer?.isInStage(DEFUSE_EXPLODING_KITTEN);
  const isImploding = !!game.selfPlayer?.hasCard(NAME_IMPLODING_KITTEN);

  // Set initial random position when entering the defuse stage
  useEffect(() => {
    if (isDefusing) {
      const min = Math.ceil(cardAmount * 0.25);
      const max = Math.floor(cardAmount * 0.75);
      
      if (max >= min) {
        const range = max - min + 1;
        setInsertIndex(min + Math.floor(Math.random() * range));
      } else {
        setInsertIndex(Math.floor(Math.random() * (cardAmount + 1)));
      }
    } else {
      setInsertIndex(null);
    }
  }, [isDefusing, cardAmount]);

  const handleDefuse = () => {
    if (insertIndex !== null) {
      game.playDefuse(insertIndex);
    }
  };

  const updatePosition = useCallback((clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    
    // Calculate percentage based on Y position (Top = 0, Bottom = 1)
    const relativeY = clientY - rect.top;
    let percentage = relativeY / rect.height;
    
    // Clamp between 0 and 1
    percentage = Math.max(0, Math.min(1, percentage));
    
    // Map to card index
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

  // Add a handler for the thumb itself to start dragging
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the track's handler from firing
    setIsDragging(true);
    updatePosition(e.clientY);
  };
  
  const handleThumbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    updatePosition(e.touches[0].clientY);
  };

  // Global event listeners for dragging outside the element
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
         e.preventDefault(); // Prevent scrolling while dragging
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

  if (!isDefusing) {
      return null;
  }

  const currentIdx = insertIndex ?? 0;
  const percentage = cardAmount > 0 ? (currentIdx / cardAmount) * 100 : 0;

  const victimId = (game.gameState as any).defusingVictimId;
  const isTakingOver = !!victimId;

  return (
    <div className="defuse-overlay">
      <div className="defuse-content">
        <h2>
          {isTakingOver
            ? "🙋‍♂️ Để Đó Tôi Lo! (I'll Take It From Here)"
            : isImploding
            ? '🌌 Kích Hoạt Imploding Kitten!'
            : '🛠️ Gỡ Bom Thành Công!'}
        </h2>
        <p>
          {isTakingOver
            ? 'Bạn đã cướp quyền đặt bom! Hãy chọn vị trí bí mật để giấu Mèo Nổ trở lại vào Chồng bài rút:'
            : isImploding
            ? 'Lần đầu rút: Bạn an toàn (không tốn Defuse)! Hãy chọn vị trí để nhét lá bài này NGỬA MẶT vào Chồng bài rút (lần sau ai rút trúng sẽ nổ ngay):'
            : 'Chọn vị trí để bí mật giấu Mèo Nổ trở lại vào Chồng bài rút:'}
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
                
                {/* The "Thumb" / Card Indicator */}
                <div 
                  className={`card-thumb ${isDragging ? 'dragging' : ''}`} 
                  style={{ top: `${percentage}%` }}
                  onMouseDown={handleThumbMouseDown}
                  onTouchStart={handleThumbTouchStart}
                >
                    <div className="thumb-graphic">
                        {isImploding ? (
                          <img src="/assets/cards/imploding_kitten/0.png" alt="Imploding Kitten" />
                        ) : (
                          <img src="/assets/cards/exploding_kitten/0.png" alt="Mèo Nổ" />
                        )}
                    </div>
                    <div className="thumb-arrow"></div>
                    
                    {/* Tooltip moves with the thumb */}
                    <div className="thumb-tooltip">
                        <span className="tooltip-value">
                            {currentIdx === 0 ? "Trên cùng (Bẫy người kế tiếp)" : 
                             currentIdx === cardAmount ? "Dưới đáy bài" : 
                             `Vị trí thứ ${currentIdx + 1}`}
                         </span>
                    </div>
                </div>
            </div>
            
            <div className="info-panel">
               {currentIdx === 0 && <div className="risk-badge high">NỔ NGAY!</div>}
               {currentIdx > 0 && currentIdx < cardAmount && <div className="risk-badge medium">Ẩn Sâu</div>}
               {currentIdx === cardAmount && <div className="risk-badge low">Đáy Bài</div>}
            </div>
        </div>

        <button className="defuse-confirm-btn btn btn-primary" onClick={handleDefuse}>
          Xác Nhận Đặt Bài
        </button>
      </div>
    </div>
  );
}
