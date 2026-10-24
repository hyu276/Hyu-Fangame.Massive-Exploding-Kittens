import { useState } from 'react';
import './CatBurglarModal.css';
import { useGame } from '../../../../context/GameContext';
import { getPlayerName } from '../../../../utils/matchData';
import { CAT_BURGLAR_TARGET_CARDS } from '../../../../../common';

interface CatBurglarModalProps {
  onClose: () => void;
}

export default function CatBurglarModal({ onClose }: CatBurglarModalProps) {
  const game = useGame();
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [selectedCatIndex, setSelectedCatIndex] = useState<number | null>(null);

  // Danh sách các đối thủ còn sống (không bao gồm bản thân)
  const aliveOpponents = game.players.alivePlayers.filter(
    p => p.id !== game.selfPlayerId
  );

  const handleConfirm = () => {
    if (selectedTargetId && selectedCatIndex !== null) {
      game.activateCatBurglar(selectedTargetId, selectedCatIndex);
      onClose();
    }
  };

  return (
    <div className="cat-burglar-modal-overlay" onClick={onClose}>
      <div className="cat-burglar-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cat-burglar-header">
          <img
            src="/assets/modes/cat-burglar.jpg"
            alt="Cat Burglar"
            className="cat-burglar-avatar-img"
          />
          <div className="cat-burglar-header-text">
            <h3>🐱‍👤 KÍCH HOẠT MÈO ĐẠO TẶC</h3>
            <p>
              Chuyển tượng Mèo Đạo Tặc cho đối thủ và gọi tên 1 loại Cat Card. Nếu đối thủ có lá đó, họ phải đưa cho bạn 1 lá!
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="cat-burglar-body">
          {/* Bước 1: Chọn đối thủ nhận tượng Mèo */}
          <div>
            <div className="cat-burglar-step-title">
              <span>🎯</span>
              <span>1. Chọn đối thủ muốn cướp bài và chuyển tượng:</span>
            </div>
            <div className="cat-burglar-target-list">
              {aliveOpponents.map((opponent) => {
                const isSelected = selectedTargetId === opponent.id;
                const name = getPlayerName(opponent.id, game.matchData);
                return (
                  <div
                    key={opponent.id}
                    className={`cat-burglar-target-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedTargetId(opponent.id)}
                  >
                    <span style={{ fontSize: '1.4rem' }}>👤</span>
                    <div className="target-card-name">{name}</div>
                    <div className="target-card-count">🃏 {opponent.handSize} lá bài</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bước 2: Gọi tên loại Cat Card */}
          <div>
            <div className="cat-burglar-step-title">
              <span>🐱</span>
              <span>2. Gọi tên loại Cat Card muốn cướp:</span>
            </div>
            <div className="cat-burglar-cards-list">
              {CAT_BURGLAR_TARGET_CARDS.map((catCard) => {
                const isSelected = selectedCatIndex === catCard.index;
                return (
                  <div
                    key={catCard.index}
                    className={`cat-card-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedCatIndex(catCard.index)}
                  >
                    <img
                      src={catCard.avatar}
                      alt={catCard.name}
                      className="cat-card-img"
                    />
                    <div className="cat-card-label">{catCard.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="cat-burglar-footer">
          <button className="btn-burglar-cancel" onClick={onClose}>
            Đóng (Giữ tượng dùng sau)
          </button>
          <button
            className="btn-burglar-confirm"
            disabled={!selectedTargetId || selectedCatIndex === null}
            onClick={handleConfirm}
          >
            <span>🐱‍👤</span>
            <span>CƯỚP BÀI & CHUYỂN TƯỢNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
