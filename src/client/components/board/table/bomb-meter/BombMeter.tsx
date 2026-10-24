import { useEffect, useRef } from 'react';
import './BombMeter.css';
import { useGame } from '../../../../context/GameContext';
import { GAME_MODE_QUICK_PLAY, DEFUSE_EXPLODING_KITTEN } from '../../../../../common';
import { soundService } from '../../../../services/audio';

export default function BombMeter() {
  const game = useGame();
  const isQuickPlay = game.gameState.gameMode === GAME_MODE_QUICK_PLAY;
  const isPlaying = game.isPlayingPhase();

  const drawPileSize = game.piles.drawPile.size;
  // Bất kỳ người chơi nào (người chơi hoặc bot) đang trong giai đoạn gỡ bom
  const isAnyoneDefusing = game.players.allPlayers.some(p => p.isInStage(DEFUSE_EXPLODING_KITTEN));
  const remainingKittens = Math.min(drawPileSize, isAnyoneDefusing ? 1 : 2);

  const rawPercent = drawPileSize > 0
    ? (remainingKittens / drawPileSize) * 100
    : 0;

  // Format phần trăm: hiển thị 1 chữ số thập phân nếu có phần dư (vd 12.5%, 6.3%), hoặc số nguyên nếu chẵn (vd 25%, 50%)
  const percentageStr = rawPercent % 1 === 0
    ? rawPercent.toFixed(0)
    : rawPercent.toFixed(1);

  const prevPercent = useRef(rawPercent);

  // Play heartbeat sound when probability jumps to >= 50%
  useEffect(() => {
    if (isQuickPlay && isPlaying && rawPercent >= 50 && Math.round(rawPercent) !== Math.round(prevPercent.current)) {
      soundService.playHeartbeat();
    }
    prevPercent.current = rawPercent;
  }, [rawPercent, isQuickPlay, isPlaying]);

  if (!isQuickPlay || !isPlaying) return null;

  // Status classification
  let levelClass = 'safe';
  let statusText = '🍃 Chill phết! Rút bài an toàn';
  let catEmoji = '🐱';

  if (rawPercent >= 60) {
    levelClass = 'critical';
    statusText = '💥 CỰC KỲ NGUY CƠ! NỔ CHẮC CHẮN!';
    catEmoji = '🙀💦';
  } else if (rawPercent >= 35) {
    levelClass = 'danger';
    statusText = '🔥 RUNG TAY! TỶ LỆ NỔ RẤT CAO!';
    catEmoji = '😿';
  } else if (rawPercent >= 20) {
    levelClass = 'warning';
    statusText = '👀 Hơi rén nhẹ rồi đấy...';
    catEmoji = '😼';
  }

  return (
    <div className={`bomb-meter-panel ${levelClass}`}>
      {/* Flame Particles VFX for high probability */}
      {rawPercent >= 35 && (
        <div className="meter-flames-vfx">
          <span className="flame-particle flame-1">🔥</span>
          <span className="flame-particle flame-2">✨</span>
          <span className="flame-particle flame-3">🔥</span>
          <span className="flame-particle flame-4">⚡</span>
        </div>
      )}

      <div className="bomb-meter-header">
        <span className={`meter-bomb-icon ${rawPercent >= 50 ? 'heartbeat' : ''}`}>
          💣
        </span>
        <div className="meter-title-wrap">
          <span className="meter-title">XÁC SUẤT BÓM</span>
          <span className="meter-mode-tag">Quick Play 1v1</span>
        </div>
        <span className="meter-cat-reaction">{catEmoji}</span>
      </div>

      <div className="bomb-meter-display">
        <span className="meter-percentage">{percentageStr}%</span>
        <div className="meter-ratio-info">
          <span className="meter-ratio-bombs">{remainingKittens} Mèo Nổ</span>
          <span className="meter-ratio-pile">/{drawPileSize} Thẻ cọc</span>
        </div>
      </div>

      <div className="bomb-meter-progress-track">
        <div
          className="bomb-meter-progress-bar"
          style={{ width: `${Math.min(100, rawPercent)}%` }}
        />
      </div>

      <div className="bomb-meter-status">
        <span>{statusText}</span>
      </div>
    </div>
  );
}
