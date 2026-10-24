import { useState, useEffect } from 'react';
import './AlterTheFutureOverlay.css';
import { useGame } from '../../../../context/GameContext.tsx';
import { ALTERING_FUTURE, ALTERING_FUTURE_5X } from '../../../../../common';
import { Card } from '../../../../../common';
import { TheGameClient } from '../../../../entities/game-client.ts';
import CardInfoBox from '../../CardInfoBox.tsx';
import SimulatedCard, { isCardSimulated } from '../../player/card/SimulatedCard.tsx';

export default function AlterTheFutureOverlay() {
  const game = useGame();
  const isAlter3x = game.selfPlayer?.isInStage(ALTERING_FUTURE);
  const isAlter5x = game.selfPlayer?.isInStage(ALTERING_FUTURE_5X);
  const isInAlterStage = isAlter3x || isAlter5x;

  const rawCards: Card[] = game.piles.drawPile.allCards;
  const combo = game.gameState.comboMultiplier || 1;
  const baseLimit = isAlter5x ? 5 : 3;
  const maxLimit = baseLimit * combo;
  const count = Math.min(maxLimit, rawCards?.length || 0);

  // Mảng thứ tự chỉ số ban đầu, vd: [0, 1, 2]
  const [order, setOrder] = useState<number[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number>(0);

  useEffect(() => {
    if (isInAlterStage) {
      setOrder(Array.from({ length: count }, (_, i) => i));
      setSelectedSlot(0);
    }
  }, [isInAlterStage, count]);

  if (!isInAlterStage) {
    return null;
  }

  const handleConfirm = () => {
    if (game.moves.reorderFuture) {
      game.moves.reorderFuture(order);
    }
  };

  if (!rawCards || rawCards.length === 0) {
    return (
      <div className="alter-future-overlay">
        <div className="alter-future-content">
          <h2 className="alter-future-title">🔮 Thay Đổi Tương Lai</h2>
          <div className="alter-future-description">
            Không còn lá bài nào trong cọc bài rút để sắp xếp.
          </div>
          <button className="alter-future-confirm-btn" onClick={handleConfirm}>
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const handleMoveLeft = (slotIndex: number) => {
    if (slotIndex <= 0) return;
    setOrder(prev => {
      const next = [...prev];
      const temp = next[slotIndex];
      next[slotIndex] = next[slotIndex - 1];
      next[slotIndex - 1] = temp;
      return next;
    });
    setSelectedSlot(slotIndex - 1);
  };

  const handleMoveRight = (slotIndex: number) => {
    if (slotIndex >= order.length - 1) return;
    setOrder(prev => {
      const next = [...prev];
      const temp = next[slotIndex];
      next[slotIndex] = next[slotIndex + 1];
      next[slotIndex + 1] = temp;
      return next;
    });
    setSelectedSlot(slotIndex + 1);
  };

  const orderedCards = order.map(idx => rawCards[idx]).filter(Boolean);
  const currentSelectedCard = orderedCards[selectedSlot] || orderedCards[0];

  return (
    <div className="alter-future-overlay">
      <div className="alter-future-content">
        <h2 className="alter-future-title">
          {`🔮 Thay Đổi Tương Lai (${count} lá${combo > 1 ? ` - ⚡ Liên Hoàn x${combo}` : ''})`}
        </h2>
        <div className="alter-future-description">
          Bạn đang bí mật xem trước {count} lá bài trên đỉnh bộ bài. Hãy dùng các nút mũi tên để đổi vị trí thứ tự theo ý muốn:
        </div>

        <div className="alter-future-cards">
          {orderedCards.map((card, slotIndex) => (
            <div
              key={slotIndex}
              className={`alter-future-card-wrapper ${selectedSlot === slotIndex ? 'active-slot' : ''}`}
              onClick={() => setSelectedSlot(slotIndex)}
            >
              <div className="alter-future-position-badge">
                {slotIndex === 0 ? '① Rút đầu tiên (Đỉnh)' : `② Rút thứ ${slotIndex + 1}`}
              </div>

              {isCardSimulated(card?.name) ? (
                <div className="alter-future-card simulated">
                  <SimulatedCard card={card} style={{ width: '100%', height: '100%' }} />
                </div>
              ) : (
                <div
                  className="alter-future-card"
                  style={{
                    backgroundImage: `url(${TheGameClient.getCardTexture(card)})`,
                  }}
                />
              )}

              <div className="alter-future-controls" onClick={e => e.stopPropagation()}>
                <button
                  className="alter-arrow-btn"
                  disabled={slotIndex === 0}
                  onClick={() => handleMoveLeft(slotIndex)}
                  title="Di chuyển sang trái (Rút sớm hơn)"
                >
                  ◀
                </button>
                <span className="alter-slot-num">Vị trí {slotIndex + 1}</span>
                <button
                  className="alter-arrow-btn"
                  disabled={slotIndex === order.length - 1}
                  onClick={() => handleMoveRight(slotIndex)}
                  title="Di chuyển sang phải (Rút muộn hơn)"
                >
                  ▶
                </button>
              </div>
            </div>
          ))}
        </div>

        {currentSelectedCard && (
          <div style={{ marginTop: '0.2rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <CardInfoBox card={currentSelectedCard} />
          </div>
        )}

        <button className="alter-future-confirm-btn" onClick={handleConfirm}>
          Xác Nhận Thứ Tự Bài
        </button>
      </div>
    </div>
  );
}
