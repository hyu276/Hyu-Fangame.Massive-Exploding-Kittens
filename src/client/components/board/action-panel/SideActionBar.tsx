import { useState, useEffect } from 'react';
import './SideActionBar.css';
import { useGame } from '../../../context/GameContext';
import { useCardSelection } from '../../../context/CardSelectionContext';
import { useResponsive } from '../../../context/ResponsiveContext';
import { getCardInfo, GAME_MODE_CAT_BURGLAR } from '../../../../common';
import { getPlayerName } from '../../../utils/matchData';
import TurnTimer from '../turn-timer/TurnTimer';
import CatBurglarModal from '../overlay/cat-burglar/CatBurglarModal';

export default function SideActionBar() {
  const game = useGame();
  const { isMobile } = useResponsive();
  const { selectedCard, clearSelection } = useCardSelection();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCatBurglarModal, setShowCatBurglarModal] = useState(false);

  // Auto-expand on mobile when a card is selected
  useEffect(() => {
    if (selectedCard && isMobile) {
      setIsCollapsed(false);
    }
  }, [selectedCard, isMobile]);

  // Auto-expand on mobile when someone plays a card and user can NOPE
  useEffect(() => {
    if (game.piles.pendingCard && game.selfPlayer?.canNope && isMobile) {
      setIsCollapsed(false);
    }
  }, [game.piles.pendingCard, game.selfPlayer?.canNope, isMobile]);

  // Không hiển thị trong phòng chờ hoặc khi trận đấu đã kết thúc
  if (game.isLobbyPhase() || game.gameState.winner) {
    return null;
  }

  const isMyTurn = game.isSelfCurrentPlayer;
  const isAlive = game.isSelfAlive;
  const currentTurnPlayerId = game.players.currentPlayerId;
  const currentTurnPlayerName = currentTurnPlayerId ? getPlayerName(currentTurnPlayerId, game.matchData) : 'Người chơi';

  const pendingCard = game.piles.pendingCard;
  const pendingCardInfo = pendingCard ? getCardInfo(pendingCard.card) : null;
  const pendingPlayerName = pendingCard ? getPlayerName(pendingCard.playedBy, game.matchData) : '';

  const selectedCardInfo = selectedCard ? getCardInfo(selectedCard) : null;

  const isSelectedLocked = selectedCard?.isLocked;

  const isGivingCard = game.canGiveCard() ||
    game.canGiveGarbageCard() ||
    game.canGivePotluckCard() ||
    game.canGiveCardToFeedDead() ||
    game.canGiveCardForGraveRobber();

  // Kiểm tra xem thẻ đã chọn có thể đánh được lúc này hay không
  // Thẻ bị khóa bởi Annoy vẫn được phép giao nộp khi có yêu cầu (Favor/Garbage/Potluck/...)
  const canPlaySelectedCard = selectedCard ? (
    isGivingCard || (!isSelectedLocked && game.canPlayCard(selectedCard.serverIndex))
  ) : false;

  const getPlayButtonLabel = () => {
    if (!selectedCard) return 'Chưa chọn thẻ';
    if (game.canGiveCard()) return '📤 Giao nộp thẻ này (Favor)';
    if (game.canGiveGarbageCard()) return '🗑️ Bỏ vào bộ bài (Garbage)';
    if (game.canGivePotluckCard()) return '🍲 Đặt lên đỉnh bộ bài (Potluck)';
    if (game.canGiveCardToFeedDead()) return '🍖 Dâng cho Người Chết';
    if (game.canGiveCardForGraveRobber()) return '⚰️ Nộp lại vào bộ bài';
    if (isSelectedLocked) return '🔒 Thẻ đang bị khóa (Annoy)';
    if (game.selfPlayer?.isBlinded) return '🙈 Đánh mù thẻ này (Cat Butt)';
    if (selectedCard.type?.isNowCard?.() && !isMyTurn) {
      return '⚡ ĐÁNH NGAY LẬP TỨC (NOW)';
    }
    return '🔥 ĐÁNH LÁ BÀI NÀY';
  };

  const handlePlaySelectedCard = () => {
    if (selectedCard && canPlaySelectedCard) {
      const idx = selectedCard.serverIndex;
      clearSelection();
      game.selectCard(idx);
    }
  };

  // Điều kiện để được bấm nút Kết Thúc Lượt (Rút bài)
  const canEndTurn = isMyTurn &&
    isAlive &&
    !game.selfPlayer?.isInStage('defuseExplodingKitten') &&
    !game.selfPlayer?.isInStage('buryCard') &&
    !game.selfPlayer?.isInStage('digDeeper') &&
    !game.selfPlayer?.isInStage('lookAtTheBottom') &&
    !game.selfPlayer?.isInStage('drawFromAnywhere') &&
    !game.canGiveCard() &&
    !game.canGiveGarbageCard() &&
    !game.canGivePotluckCard() &&
    !game.canGiveCardToFeedDead() &&
    !game.canGiveCardForGraveRobber();

  const handleDrawCard = () => {
    if (canEndTurn) {
      clearSelection();
      game.playDrawCard();
    }
  };

  const turnsRemaining = game.turnManager.turnsRemaining || 1;
  const topDrawCard = (game.gameState as any).topDrawCard;

  if (isCollapsed) {
    return (
      <div className="side-action-bar is-collapsed" onClick={() => setIsCollapsed(false)}>
        <div className="collapsed-indicator">
          <span className="collapsed-badge">
            {isMyTurn ? '🟢 Lượt của bạn' : `⏳ ${currentTurnPlayerName}`}
          </span>
          <button className="side-bar-toggle-btn" title="Mở rộng thanh thao tác">
            ➕ Mở
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="side-action-bar">
      {/* Header */}
      <div className="side-bar-header">
        <span className="side-bar-title">
          🎮 Bảng Thao Tác
        </span>
        <button
          className="side-bar-toggle-btn"
          onClick={() => setIsCollapsed(true)}
          title="Thu gọn"
        >
          ➖ Thu gọn
        </button>
      </div>

      {/* 1. Trạng thái lượt chơi */}
      <div className={`turn-status-banner ${isMyTurn ? 'my-turn' : 'other-turn'}`}>
        <div className="turn-status-title">
          {isMyTurn ? '👑 LƯỢT CỦA BẠN' : `⏳ Lượt của: ${currentTurnPlayerName}`}
        </div>
        <div className="turn-status-sub">
          {isMyTurn ? (
            turnsRemaining > 1 ? `Số lượt còn lại: ${turnsRemaining}` : 'Bạn có thể đánh bài hoặc rút bài để kết thúc lượt'
          ) : (
            'Đang chờ đối thủ đánh hoặc rút bài...'
          )}
        </div>
        <TurnTimer />
      </div>

      {/* 2. Cảnh báo khẩn cấp khi có người chơi thẻ (Pending / NOPE) */}
      {pendingCard && (
        <div className="pending-alert-box">
          <div className="pending-alert-header">
            <span>⚠️ {pendingPlayerName} đang đánh:</span>
            <span style={{ color: '#ffffff' }}>{pendingCardInfo?.vietnameseName}</span>
          </div>
          {game.selfPlayer?.canNope && (
            <button className="btn-nope-action" onClick={() => game.playNope()}>
              🛑 CHẶN (NOPE)!
            </button>
          )}
        </div>
      )}

      {/* 3. Phần Thẻ Đang Chọn & Nút Đánh Thẻ */}
      {selectedCard ? (
        <div className="selected-card-box">
          <div className="selected-card-header">
            <span className="selected-card-tag">Thẻ bài đã chọn</span>
            <button className="btn-deselect" onClick={clearSelection}>
              ✕ Bỏ chọn
            </button>
          </div>

          <div className="selected-card-details">
            <div className="selected-card-icon">
              {selectedCardInfo?.category === 'Khẩn Cấp' ? '⚡' : '🃏'}
            </div>
            <div className="selected-card-text">
              <span className="selected-card-name">
                {game.selfPlayer?.isBlinded
                  ? '🙈 Lá bài bí mật (Mông Mèo)'
                  : (selectedCardInfo?.vietnameseName ?? selectedCard.name)}
              </span>
              <span className="selected-card-desc">
                {game.selfPlayer?.isBlinded
                  ? 'Bạn đang bị trúng Lời Nguyền Mông Mèo! Bạn không thể biết lá này là gì cho đến khi đánh ra.'
                  : (selectedCardInfo?.shortEffect ?? selectedCardInfo?.description ?? '')}
              </span>
            </div>
          </div>

          <button
            className="side-action-btn btn-play-card"
            disabled={!canPlaySelectedCard}
            onClick={handlePlaySelectedCard}
          >
            <span>{getPlayButtonLabel()}</span>
            {!canPlaySelectedCard && (
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                (Không thể đánh lúc này)
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="empty-selection-placeholder">
          <span className="empty-selection-title">Chưa chọn thẻ bài</span>
          <span className="empty-selection-hint">
            👉 Nhấp vào 1 lá bài trên tay để chọn và đánh
          </span>
        </div>
      )}

      {/* 3.5. Hành động Mèo Đạo Tặc (Cat Burglar) */}
      {game.canUseCatBurglar() && (
        <button
          className="btn-cat-burglar-action"
          onClick={() => setShowCatBurglarModal(true)}
        >
          <span>🐱‍👤</span>
          <span>DÙNG MÈO ĐẠO TẶC (CƯỚP BÀI)</span>
        </button>
      )}
      {game.gameState.gameMode === GAME_MODE_CAT_BURGLAR &&
        game.gameState.catBurglarHolderId === game.selfPlayerId &&
        game.gameState.catBurglarUsedThisTurn && isMyTurn && (
        <div className="cat-burglar-used-badge">
          ✓ Đã dùng Mèo Đạo Tặc trong lượt này
        </div>
      )}

      {/* 4. Nút Kết Thúc Lượt / Rút Bài */}
      <button
        className="side-action-btn btn-end-turn"
        disabled={!canEndTurn}
        onClick={handleDrawCard}
      >
        <span>📥 KẾT THÚC LƯỢT</span>
        <span className="btn-end-turn-sub">
          {canEndTurn ? (
            turnsRemaining > 1 ? `(Rút 1 lá - Còn ${turnsRemaining} lượt)` : '(Rút 1 lá từ Bộ bài rút)'
          ) : (
            isMyTurn ? '(Đang xử lý hiệu ứng)' : '(Chờ đến lượt)'
          )}
        </span>
      </button>

      {/* 5. Thông tin số lượng bài */}
      <div className="side-bar-stats">
        <div className={`stat-pill ${topDrawCard?.isFaceUp ? 'face-up' : ''}`} title="Số lá bài còn lại trong Chồng bài rút">
          📚 Bài rút: <strong>{game.piles.drawPile.size}</strong>
          {topDrawCard?.isFaceUp && ' (Lộ đỉnh)'}
        </div>
        <div className="stat-pill" title="Số lá bài đã đánh trong Chồng bài bỏ">
          🗑️ Đã đánh: <strong>{game.piles.discardPile.size}</strong>
        </div>
      </div>

      {showCatBurglarModal && (
        <CatBurglarModal onClose={() => setShowCatBurglarModal(false)} />
      )}
    </div>
  );
}
