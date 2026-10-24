import { useState } from 'react';
import './MatchCard.css';
import {getPlayerName, MatchPlayer} from '../../utils/matchData';
import {getGameModeDefinition} from '../../../common';

interface MatchSetupData {
  matchName: string;
  maxPlayers: number;
  openCards: boolean;
  spectatorsSeeCards?: boolean;
  deckType?: string;
  selectedDecks?: string[];
  gameMode?: number;
}

interface MatchCardProps {
  matchID: string;
  matchName: string;
  players: Array<MatchPlayer>;
  setupData: MatchSetupData;
  onJoin: (matchID: string, asSpectator?: boolean) => void;
}

export function MatchCard({matchID, matchName, players, setupData, onJoin}: MatchCardProps) {
  const [copied, setCopied] = useState(false);
  const maxPlayers = setupData.maxPlayers;
  const joinedCount = players.filter(p => p?.name).length;
  const modeInfo = getGameModeDefinition(setupData.gameMode ?? 0);
  const expansionCount = modeInfo.allowsExpansionSelection
    ? (setupData.selectedDecks ?? []).filter(id => id !== 'original').length
    : 0;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/${matchID}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="match-card">
      <div className="match-card-header">
        <span className={`match-status ${joinedCount < maxPlayers ? 'match-status-waiting' : 'match-status-playing'}`}>
          {joinedCount < maxPlayers ? 'Đang chờ' : 'Đang chơi'}
        </span>
        <h3 className="match-card-name">{matchName}</h3>
        <button
          className="btn-copy-link-pill"
          onClick={handleCopyLink}
          title="Sao chép link mời phòng này"
        >
          {copied ? '✓ Đã chép' : '🔗 Link'}
        </button>
        <div className="match-info-item">
          <span>👥</span>
          <span>{joinedCount} / {maxPlayers}</span>
        </div>
      </div>

      <div className="match-card-content">
        <div className="match-card-left">
          <div className="match-card-players">
            {Array.from({length: maxPlayers}).map((_, i) => (
              <div
                key={i}
                className={`player-badge ${players[i]?.isConnected ? 'player-badge-joined' : ''}`}
                title={players[i]?.isConnected ? (players[i]?.name || "Người chơi") : "Chỗ trống"}
              >
               <span className="player-badge-name">
                 {getPlayerName(players[i] || null, players)}
               </span>
              </div>
            ))}
          </div>

          <div className="match-card-rules">
            {setupData?.gameMode !== undefined && (
              <span className="rule-badge" style={{
                background: modeInfo.badgeBg || 'rgba(255, 255, 255, 0.1)',
                color: modeInfo.badgeColor || '#cbd5e1',
                fontWeight: 'bold'
              }}>
                {modeInfo.icon} {modeInfo.badge}
              </span>
            )}
            <span className="rule-badge">
              {modeInfo.allowsExpansionSelection ? '🃏 Bản Gốc' : '🔒 Bộ bài cố định'}
            </span>
            {expansionCount > 0 && (
              <span className="rule-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
                ✨ +{expansionCount} Mở Rộng
              </span>
            )}
            {setupData?.openCards && (
              <span className="rule-badge">👁️ Mở Bài</span>
            )}
            {setupData && setupData.spectatorsSeeCards && !setupData.openCards && (
              <span className="rule-badge">👁️ Khán Giả Xem</span>
            )}
          </div>
        </div>

        <div className="match-card-actions">
          {joinedCount < maxPlayers && (
            <button
              className="btn btn-success btn-small"
              onClick={() => onJoin(matchID, false)}
            >
              Tham gia
            </button>
          )}
          
          <button
              className="btn btn-secondary btn-small"
              onClick={() => onJoin(matchID, true)}
            >
              Khán giả
          </button>
        </div>
      </div>
    </div>
  );
}
