import { useState } from 'react';
import './LobbyOverlay.css';
import {useMatchDetails} from "../../../../context/MatchDetailsContext.tsx";
import {useGame} from "../../../../context/GameContext.tsx";
import {deckRegistry, getGameModeInfo, GAME_MODE_TEAM_UP} from "../../../../../common";

export default function LobbyOverlay() {
  const game = useGame();
  const { matchDetails } = useMatchDetails();
  const [copied, setCopied] = useState(false);
  const isHost = game.selfPlayerId === '0';

  if (!game.isLobbyPhase()) {
    return null;
  }

  const { players, numPlayers } = matchDetails || {players: [], numPlayers: 1};

  const filledSlots = players?.filter(p => p.isConnected).length || 0;
  const allPlayersFilled = filledSlots === numPlayers;

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handStartButton = () => {
    if (game.moves.startGame) {
      game.moves.startGame();
    }
  };

  const availableDecks = deckRegistry.getAll();
  const selectedDecks = game.selectedDecks;
  const modeInfo = getGameModeInfo(game.gameState.gameMode);
  const isTeamMode = game.gameState.gameMode === GAME_MODE_TEAM_UP;
  const isLockedDecks = !modeInfo.allowsExpansionSelection;

  const toggleDeck = (deckName: string, isBase: boolean) => {
    if (isBase || !isHost || isLockedDecks) return;
    const isSelected = selectedDecks.includes(deckName);
    const nextDecks = isSelected
      ? selectedDecks.filter(id => id !== deckName)
      : [...selectedDecks, deckName];

    game.updateSelectedDecks(nextDecks);
  };

  return (
    <div className="game-lobby-overlay">
      <div className="game-lobby-content">
        <h2 className="game-lobby-title">{matchDetails?.isBotMatch ? matchDetails.matchName : 'Đang Chờ Người Chơi'}</h2>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          alignSelf: 'center',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1.5px solid var(--color-accent)',
          boxShadow: '0 0 12px var(--color-accent-glow-light)'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{modeInfo.icon}</span>
          <span style={{ fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '0.5px' }}>{modeInfo.vietnameseName}</span>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.75)' }}>• {modeInfo.badge}</span>
        </div>
        <p className="game-lobby-subtitle">
          {matchDetails?.isBotMatch ? 'Bot đã sẵn sàng. Chọn bộ bài rồi bấm bắt đầu để đấu.' : 'Trò chơi sẽ bắt đầu khi tất cả người chơi đã tham gia đủ phòng'}
        </p>

        {!matchDetails?.isBotMatch && <div className="game-lobby-invite">
             <span className="invite-label">Link mời:</span>
             <div className="invite-link-container">
               <input type="text" readOnly value={window.location.href} className="invite-link-input" />
               <button className="invite-copy-btn" onClick={copyLink}>{copied ? '✓ Đã chép!' : 'Sao chép'}</button>
             </div>
        </div>}

        <div className="game-lobby-progress">
          <div className="game-lobby-progress-bar">
            <div
              className="game-lobby-progress-fill"
              style={{width: `${(filledSlots / numPlayers) * 100}%`}}
            />
          </div>
          <div className="game-lobby-progress-text">
            {filledSlots} / {numPlayers} người đã vào phòng
          </div>
        </div>

        {/* Khu vực xem & chọn các bộ bài tham gia trận đấu */}
        <div className="game-lobby-decks-section">
          <div className="game-lobby-decks-title">
            <span>🃏 Các Bộ Bài Tham Gia Trận Đấu:</span>
            {!modeInfo.allowsExpansionSelection && (
              <span style={{ fontSize: '0.8rem', color: modeInfo.badgeColor || '#fbbf24', marginLeft: '8px', fontWeight: 'normal' }}>
                ({modeInfo.icon} {modeInfo.vietnameseName} cố định bộ bài riêng)
              </span>
            )}
          </div>
          <div className="game-lobby-decks-chips">
            {availableDecks.map((deck) => {
              const isSelected = selectedDecks.includes(deck.name);
              const isBase = deck.isBase;

              return (
                <div
                  key={deck.name}
                  className={`lobby-deck-chip ${isSelected ? 'active' : ''} ${isBase ? 'locked' : ''}`}
                  onClick={() => toggleDeck(deck.name, isBase)}
                  title={deck.description}
                >
                  <div className="deck-chip-main">
                    {deck.avatarUrl ? (
                      <img src={deck.avatarUrl} alt={deck.displayName} className="deck-chip-avatar" />
                    ) : (
                      <span className="deck-chip-icon">{deck.icon}</span>
                    )}
                    <span className="deck-chip-name">{deck.displayName}</span>
                  </div>
                  {isBase ? (
                    <span className="deck-chip-badge base">Bắt buộc</span>
                  ) : (
                    <span className={`deck-chip-badge ${isSelected ? 'exp-active' : 'exp-inactive'}`}>
                      {isSelected ? '✓ Đã Bật' : '+ Bấm Để Thêm'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="game-lobby-players">
          {Array.from({length: numPlayers}).map((_, i) => {
            const player = players?.[i];
            const hasJoined = player?.isConnected;
            const isSelf = game.isSelf(player);
            const team = isTeamMode ? (i % 2 === 0 ? 'red' : 'blue') : null;

            return (
              <div
                key={i}
                className={`game-lobby-player-slot ${hasJoined ? 'joined' : 'empty'}`}
              >
                <div className="game-lobby-player-icon">
                  {hasJoined ? '👤' : '⏳'}
                </div>
                <div className="game-lobby-player-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>{hasJoined ? (player?.name + (isSelf ? " (Bạn)" : "")) || "Người chơi" : `Đang chờ người chơi...`}</span>
                  {isTeamMode && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: team === 'red' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                      color: team === 'red' ? '#f87171' : '#60a5fa',
                      border: `1px solid ${team === 'red' ? '#ef4444' : '#3b82f6'}`,
                      letterSpacing: '0.5px'
                    }}>
                      {team === 'red' ? '🔴 Đội Đỏ' : '🔵 Đội Xanh'}
                    </span>
                  )}
                </div>
                {hasJoined && (
                  <div className="game-lobby-player-status">✓ Sẵn sàng</div>
                )}
              </div>
            );
          })}
        </div>

        {allPlayersFilled && isHost && (
          <button className="game-lobby-start-btn" onClick={handStartButton}>
            🚀 Bắt Đầu Trò Chơi
          </button>
        )}
      </div>
    </div>
  );
}
