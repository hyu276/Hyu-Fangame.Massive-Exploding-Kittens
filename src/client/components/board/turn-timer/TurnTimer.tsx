import { useState, useEffect, useRef } from 'react';
import './TurnTimer.css';
import { useGame } from '../../../context/GameContext';
import { soundService } from '../../../services/audio';
import { DEFUSE_EXPLODING_KITTEN } from '../../../../common';

interface TurnTimerProps {
  maxSeconds?: number;
}

export default function TurnTimer({ maxSeconds = 30 }: TurnTimerProps) {
  const game = useGame();
  const [timeLeft, setTimeLeft] = useState(maxSeconds);
  const currentPlayerId = game.players.currentPlayerId;
  const isPlaying = game.isPlayingPhase();
  const isCurrentTurn = game.isSelfCurrentPlayer;
  const isSelfAlive = game.isSelfAlive;
  const inDefuse = game.selfPlayer?.isInStage(DEFUSE_EXPLODING_KITTEN);

  const prevPlayerId = useRef(currentPlayerId);
  const prevInDefuse = useRef(inDefuse);
  const hasTriggeredTimeout = useRef(false);

  // Reset timer on turn change or stage change
  useEffect(() => {
    if (currentPlayerId !== prevPlayerId.current || inDefuse !== prevInDefuse.current) {
      setTimeLeft(maxSeconds);
      hasTriggeredTimeout.current = false;
    }
    prevPlayerId.current = currentPlayerId;
    prevInDefuse.current = inDefuse;
  }, [currentPlayerId, inDefuse, maxSeconds]);

  // Countdown effect
  useEffect(() => {
    if (!isPlaying || !isSelfAlive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        // Warning tick sound at <= 5s on local player's turn
        if (prev <= 6 && isCurrentTurn) {
          soundService.playFuse();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isSelfAlive, isCurrentTurn, currentPlayerId]);

  // Handle timeout action (Auto-draw / Auto-defuse)
  useEffect(() => {
    if (timeLeft === 0 && !hasTriggeredTimeout.current && isCurrentTurn && isPlaying && isSelfAlive) {
      hasTriggeredTimeout.current = true;

      if (inDefuse) {
        // Auto-insert defuse at random position
        const maxIdx = game.piles.drawPile.size;
        const randomPos = Math.floor(Math.random() * (maxIdx + 1));
        game.playDefuse(randomPos);
      } else {
        // Auto-draw card
        game.playDrawCard();
      }
    }
  }, [timeLeft, isCurrentTurn, inDefuse, game, isPlaying, isSelfAlive]);

  if (!isPlaying || !isSelfAlive) return null;

  const percentage = (timeLeft / maxSeconds) * 100;
  const isUrgent = timeLeft <= 6;
  const isWarning = timeLeft <= 12 && !isUrgent;

  return (
    <div className={`turn-timer-container ${isUrgent ? 'urgent' : isWarning ? 'warning' : ''}`}>
      <div className="turn-timer-track">
        <div
          className="turn-timer-bar"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="turn-timer-label">
        <span className="timer-icon">{isUrgent ? '🔥' : '⏳'}</span>
        <span className="timer-value">{timeLeft}s</span>
      </div>
    </div>
  );
}
