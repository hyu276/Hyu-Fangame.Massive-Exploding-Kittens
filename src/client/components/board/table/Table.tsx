import {useEffect, useState} from "react";
import TurnBadge from './turn-badge/TurnBadge';
import {DrawPile} from './pile/DrawPile';
import {DiscardPile} from './pile/DiscardPile';
import BombMeter from './bomb-meter/BombMeter';
import {useGame} from "../../../context/GameContext.tsx";
import {getPlayerName} from "../../../utils/matchData.ts";
import {GAME_MODE_CAT_BURGLAR} from "../../../../common";
import './Table.css';

export default function Table() {
  const game = useGame()

  // Timer calculation
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const pending = game.piles.pendingCard;
  useEffect(() => {
    if (!pending) {
      setTimeLeftMs(0);
      return;
    }
    const update = () => setTimeLeftMs(Math.max(0, pending.expiresAtMs - Date.now()));
    update();
    const i = setInterval(update, 50);
    return () => clearInterval(i);
  }, [pending]);

  // Calculate generic progress 0-1
  const windowDuration = game.piles.pendingCard ? Math.max(0, game.piles.pendingCard.expiresAtMs - game.piles.pendingCard.startedAtMs) : 0;
  const progressRatio = windowDuration > 0 ? (timeLeftMs / windowDuration) : 0;
  const degrees = progressRatio * 360;

  const isNoped = game.piles.pendingCard?.isNoped ?? false;
  const crownBearerId = game.gameState.towerOfPowerCrownBearer;
  const stashCount = game.gameState.towerOfPowerStash?.length ?? 0;
  const crownBearerName = crownBearerId ? getPlayerName(crownBearerId, game.matchData) : null;

  return (
    <div className="table">
      <div 
        className={`table-center ${game.piles.pendingCard ? 'has-pending-play' : ''} ${isNoped ? 'is-noped' : ''}`}
        style={{
          '--timer-deg': `${degrees}deg`,
          '--timer-opacity': (game.piles.pendingCard && windowDuration > 500) ? 1 : 0
        } as any}
      >
        <div className="table-timer-overlay" />
        <div className="center-stack">
          <div className="center-top-anchor">
            <TurnBadge />
            <BombMeter />
          </div>

          <div className="card-piles">
            <DiscardPile />
            <DrawPile />
          </div>

          {game.gameState.towerOfPowerStash !== undefined && (
            <div className="tower-of-power-crown-widget flex items-center gap-1 px-3 py-1 bg-yellow-400 text-yellow-950 font-bold rounded-full border-2 border-yellow-600 shadow-md text-xs mt-2 select-none">
              <span>👑</span>
              <span>
                {crownBearerName
                  ? `Vương Miện: ${crownBearerName} (${stashCount} lá)`
                  : `Vương Miện: Chưa ai đội (${stashCount} lá dự trữ)`}
              </span>
            </div>
          )}

          {game.gameState.gameMode === GAME_MODE_CAT_BURGLAR && (
            <div className={`cat-burglar-widget flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg text-xs mt-2 select-none font-bold border ${
              game.gameState.catBurglarHolderId
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300'
                : 'bg-slate-800 text-slate-400 border-slate-600'
            }`}>
              <img
                src="/assets/modes/cat-burglar.jpg"
                alt="Cat Burglar"
                style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span>
                {game.gameState.catBurglarHolderId
                  ? `Tượng Mèo Đạo Tặc: ${getPlayerName(game.gameState.catBurglarHolderId, game.matchData)}${game.gameState.catBurglarHolderId === game.selfPlayerId ? ' (Bạn)' : ''}`
                  : 'Tượng Mèo Đạo Tặc: Đã bị loại khỏi trận'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
