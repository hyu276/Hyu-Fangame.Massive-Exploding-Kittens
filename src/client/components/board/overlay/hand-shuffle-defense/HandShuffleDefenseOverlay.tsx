import React, { useState, useEffect } from 'react';
import './HandShuffleDefenseOverlay.css';
import { useGame } from '../../../../context/GameContext.tsx';
import { TheGameClient } from '../../../../entities/game-client.ts';
import SimulatedCard, { isCardSimulated } from '../../player/card/SimulatedCard.tsx';

export default function HandShuffleDefenseOverlay() {
  const game = useGame();
  const defense = game.gameState.handShuffleDefense;

  const [timeLeftMs, setTimeLeftMs] = useState<number>(10000);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedSlotForSwap, setSelectedSlotForSwap] = useState<number | null>(null);

  useEffect(() => {
    if (!defense) return;

    const updateTimer = () => {
      const remaining = Math.max(0, defense.expiresAtMs - Date.now());
      setTimeLeftMs(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 50);

    return () => clearInterval(interval);
  }, [defense]);

  if (!defense) {
    return null;
  }

  const isDefender = game.selfPlayerId === defense.targetPlayerId;
  if (!isDefender && (game.isSpectator || !game.isSelfAlive)) return null;
  const isAttacker = game.selfPlayerId === defense.attackerId;

  const attackerPlayer = game.matchData?.find(p => String(p.id) === String(defense.attackerId));
  const targetPlayer = game.matchData?.find(p => String(p.id) === String(defense.targetPlayerId));

  const attackerName = attackerPlayer?.name || `Người chơi ${defense.attackerId}`;
  const targetName = targetPlayer?.name || `Người chơi ${defense.targetPlayerId}`;

  const progressPercent = Math.min(100, Math.max(0, (timeLeftMs / 10000) * 100));
  const secondsDisplay = (timeLeftMs / 1000).toFixed(1);

  // Hand cards of defender
  const handCards = isDefender ? (game.selfPlayer?.hand || []) : [];

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('text/plain');
    const fromIndex = parseInt(rawData, 10);
    if (!isNaN(fromIndex) && fromIndex !== dropIndex) {
      game.swapHandCards(fromIndex, dropIndex);
      setSelectedSlotForSwap(null);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSlotClick = (index: number) => {
    if (selectedSlotForSwap === null) {
      setSelectedSlotForSwap(index);
    } else if (selectedSlotForSwap === index) {
      setSelectedSlotForSwap(null);
    } else {
      game.swapHandCards(selectedSlotForSwap, index);
      setSelectedSlotForSwap(null);
    }
  };

  const handleRandomShuffle = () => {
    game.randomShuffleHand();
    setSelectedSlotForSwap(null);
  };

  const handleSkip = () => {
    game.skipHandShuffleDefense();
  };

  const getTitle = () => {
    if (isDefender) {
      if (defense.actionType === 'steal') return '🛡️ PHÒNG THỦ: ĐỐI THỦ ĐANG CƯỚP BÀI!';
      if (defense.actionType === 'mark') return '🛡️ PHÒNG THỦ: ĐỐI THỦ ĐANG ĐÁNH DẤU BÀI (MARK)!';
      return '🛡️ PHÒNG THỦ: TRÁO ĐỔI VỊ TRÍ BÀI!';
    }
    if (isAttacker) {
      return '⏳ ĐANG CHỜ ĐỐI THỦ TRÁO BÀI...';
    }
    return '⚔️ ĐỐI ĐẦU: TRÁO BÀI PHÒNG THỦ';
  };

  const getSubtitle = () => {
    if (isDefender) {
      if (defense.actionType === 'steal') {
        return `${attackerName} đang nhắm cướp ngẫu nhiên 1 lá bài trên tay bạn! Bạn có 10 giây để kéo thả hoặc click chọn 2 lá để tráo đổi vị trí bài nhằm đánh lạc hướng!`;
      }
      if (defense.actionType === 'mark') {
        return `${attackerName} đang chuẩn bị rút ngẫu nhiên và lật ngửa 1 lá bài của bạn! Hãy tráo bài để giấu các lá bài quan trọng!`;
      }
      return `Bạn có 10 giây để kéo thả hoặc tráo ngẫu nhiên bài trên tay để phòng thủ!`;
    }
    if (isAttacker) {
      return `${targetName} đang có tối đa 10 giây để tráo vị trí các lá bài trên tay nhằm đánh lừa bạn. Hãy kiên nhẫn chờ trong giây lát!`;
    }
    return `${attackerName} đang nhắm vào ${targetName}. ${targetName} đang sắp xếp lại bài trên tay để phòng thủ!`;
  };

  return (
    <div className="hand-shuffle-overlay">
      <div className="hand-shuffle-content">
        <h2>{getTitle()}</h2>
        <p className="hand-shuffle-subtitle">{getSubtitle()}</p>

        {/* Timer Bar */}
        <div className="shuffle-timer-container">
          <div className="shuffle-timer-badge">
            <span>⏱️</span>
            <span>{secondsDisplay}s</span>
          </div>
          <div className="shuffle-progress-rail">
            <div
              className="shuffle-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {isDefender ? (
          <>
            {/* Hand Cards Tray with Drag & Drop */}
            <div className="shuffle-hand-tray">
              {handCards.map((card, index) => {
                const isDragging = draggedIndex === index;
                const isSelectedForSwap = selectedSlotForSwap === index;
                const texture = TheGameClient.getCardTexture(card);
                const isSim = isCardSimulated(card?.name);

                return (
                  <div
                    key={`${card.name}-${card.index}-${index}`}
                    className={`shuffle-card-slot ${isDragging ? 'is-dragging' : ''} ${
                      isSelectedForSwap ? 'is-selected-swap' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleSlotClick(index)}
                    title="Kéo thả hoặc click 2 thẻ để đổi chỗ cho nhau"
                  >
                    {isSim ? (
                      <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                        <SimulatedCard card={card} style={{ width: '100%', height: '100%' }} />
                      </div>
                    ) : (
                      <img
                        src={texture}
                        alt={card.name}
                        draggable={false}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                    <span className="shuffle-slot-index">#{index + 1}</span>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="shuffle-actions-row">
              <button
                type="button"
                className="btn-shuffle-random"
                onClick={handleRandomShuffle}
                title="Tự động xáo trộn ngẫu nhiên toàn bộ bài trên tay"
              >
                <span>🎲</span> Tráo Ngẫu Nhiên
              </button>
              <button
                type="button"
                className="btn-shuffle-skip"
                onClick={handleSkip}
                title="Đã xếp xong bài, bỏ qua thời gian chờ còn lại"
              >
                <span>✅</span> Đã Tráo Xong / Bỏ Qua
              </button>
            </div>
          </>
        ) : (
          <div className="attacker-waiting-box">
            <div className="attacker-waiting-spinner">⏳</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fcd34d' }}>
              {isAttacker
                ? `Đang chờ ${targetName} sắp xếp lại bài trên tay...`
                : `${targetName} đang sắp xếp bài...`}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Hành động sẽ tự động thực hiện ngay khi đối thủ tráo xong hoặc hết 10 giây.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
