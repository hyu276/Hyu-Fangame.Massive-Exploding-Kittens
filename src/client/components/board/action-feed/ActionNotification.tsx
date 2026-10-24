import { useState, useEffect, useRef } from 'react';
import './ActionNotification.css';
import { useGame } from '../../../context/GameContext';
import { getPlayerName } from '../../../utils/matchData';
import { getCardInfo } from '../../../../common';

interface ActionToast {
  id: string;
  icon: string;
  text: string;
  type?: 'default' | 'alert' | 'success';
}

export default function ActionNotification() {
  const game = useGame();
  const [toast, setToast] = useState<ActionToast | null>(null);
  const prevDeadCount = useRef(game.gameState.deadPlayers?.length || 0);
  const prevPendingCard = useRef(game.piles.pendingCard);

  // 1. Listen for new pending card (someone played a card)
  useEffect(() => {
    const currentPending = game.piles.pendingCard;
    if (currentPending && (currentPending.card.id !== prevPendingCard.current?.card.id ||
        currentPending.startedAtMs !== prevPendingCard.current?.startedAtMs)) {
      const playerName = getPlayerName(currentPending.playedBy, game.matchData);
      const cardInfo = getCardInfo(currentPending.card);
      const cardName = cardInfo?.vietnameseName ?? currentPending.card.name;

      setToast({
        id: `pending-${Date.now()}`,
        icon: '🃏',
        text: `${playerName} vừa đánh: ${cardName}`,
        type: 'default'
      });
    }
    prevPendingCard.current = currentPending;
  }, [game.piles.pendingCard, game.matchData]);

  // 2. Listen for eliminated players
  useEffect(() => {
    const deadPlayers = game.gameState.deadPlayers || [];
    if (deadPlayers.length > prevDeadCount.current) {
      const newlyDeadId = deadPlayers[deadPlayers.length - 1];
      const newlyDeadName = getPlayerName(newlyDeadId, game.matchData);

      setToast({
        id: `dead-${Date.now()}`,
        icon: '💥',
        text: game.players.getPlayer(newlyDeadId).hasLeft ? `${newlyDeadName} đã rời trận.` : `${newlyDeadName} đã nổ tung và bị loại!`,
        type: 'alert'
      });
    }
    prevDeadCount.current = deadPlayers.length;
  }, [game]);

  // 3. Listen for defuse success
  const defuse = game.gameState.lastDefuseSuccess;
  const previousDefuse = useRef(defuse?.sequence ?? 0);
  useEffect(() => {
    if (defuse && defuse.sequence > previousDefuse.current) {
      previousDefuse.current = defuse.sequence;
      const currentPlayerName = getPlayerName(defuse.playerID, game.matchData);
      setToast({
        id: `defuse-${Date.now()}`,
        icon: '🛡️',
        text: `${currentPlayerName} đã gỡ Mèo Nổ thành công!`,
        type: 'success'
      });
    }
  }, [defuse, game.matchData]);

  // 4. Listen for Combo multiplier notification (Mode 2)
  const prevComboTime = useRef(0);
  useEffect(() => {
    const combo = game.gameState.lastComboNotification;
    if (combo && combo.timestamp > prevComboTime.current) {
      prevComboTime.current = combo.timestamp;
      const isX3 = combo.multiplier === 3;
      setToast({
        id: `combo-${combo.timestamp}`,
        icon: isX3 ? '🔥' : '⚡',
        text: `LIÊN HOÀN x${combo.multiplier}! ${combo.cardName} kích hoạt hiệu ứng x${combo.multiplier}!`,
        type: isX3 ? 'alert' : 'success'
      });
    }
  }, [game.gameState.lastComboNotification]);

  // 5. Listen for Cat Burglar actions (Mode 4)
  const catBurglarAction = game.gameState.lastCatBurglarAction;
  const prevCatActionTimestamp = useRef(catBurglarAction?.timestamp ?? 0);
  useEffect(() => {
    if (catBurglarAction && catBurglarAction.timestamp > prevCatActionTimestamp.current) {
      prevCatActionTimestamp.current = catBurglarAction.timestamp;
      const robberName = getPlayerName(catBurglarAction.robberId, game.matchData);
      const targetName = getPlayerName(catBurglarAction.targetId, game.matchData);
      const isSuccess = catBurglarAction.success;

      setToast({
        id: `burglar-${catBurglarAction.timestamp}`,
        icon: '🐱‍👤',
        text: isSuccess
          ? `${robberName} dùng Mèo Đạo Tặc cướp thành công 1 lá [${catBurglarAction.catName}] từ ${targetName}!`
          : `${robberName} đòi lá [${catBurglarAction.catName}] nhưng ${targetName} không có! Tượng Mèo đã được chuyển.`,
        type: isSuccess ? 'success' : 'default'
      });
    }
  }, [catBurglarAction, game.matchData]);

  // Auto-dismiss after 3.5 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast || game.isLobbyPhase() || game.gameState.winner) {
    return null;
  }

  return (
    <div className="action-notification-container">
      <div className={`action-notification-toast ${toast.type || ''}`}>
        <span className="action-toast-icon">{toast.icon}</span>
        <span className="action-toast-text">{toast.text}</span>
      </div>
    </div>
  );
}
