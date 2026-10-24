import { useMatchDetails } from '../../../context/MatchDetailsContext';
import { useState } from 'react';
import './GameStatusList.css';
import { useResponsive } from '../../../context/ResponsiveContext';
import {useGame} from "../../../context/GameContext.tsx";
import {getPlayerName} from "../../../utils/matchData.ts";
import {getGameModeInfo, GAME_MODE_TEAM_UP} from "../../../../common";

export default function GameStatusList() {
  const game = useGame();
  const { isMobile } = useResponsive();

  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const { matchDetails } = useMatchDetails();
  const modeInfo = getGameModeInfo(game.gameState.gameMode);
  const isTeamMode = game.gameState.gameMode === GAME_MODE_TEAM_UP;

  // Use matchPlayers from context, fallback to empty array
  const matchPlayers = matchDetails?.players || [];

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      <div 
        className={`game-info-badge ${isCollapsed ? 'collapsed' : ''}`}
      >
        <div className="game-info-header">
          <button 
            className="collapse-toggle-btn"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Hiện danh sách người chơi" : "Ẩn danh sách người chơi"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
          
          <div className="game-info-item">
            <span>{matchDetails?.matchName || 'Trận đấu'}</span>
          </div>
          <div className="game-info-item" title={`${modeInfo.vietnameseName}: ${modeInfo.description}`}>
            <span>{modeInfo.icon}</span>
            <span>{modeInfo.vietnameseName}</span>
          </div>
          <div className="game-info-item">
            <span>👥</span>
            <span>{game.players.playerCount}</span>
          </div>
        </div>

        {!isCollapsed && (
          <div className="game-player-list">
            <div className="list-section-title">Người chơi</div>
            {game.turnManager.playOrder.map(orderEntry => {
              const player = game.players.getPlayer(orderEntry);

              const matchInfo = matchPlayers.find(p => p.id === player.id);
              const isEmpty = !(matchInfo && matchInfo.name);
              const isConnected = matchInfo ? (matchInfo.isConnected ?? true) : false;
              const team = isTeamMode ? (game.gameState.teams?.[player.id] || (Number(player.id) % 2 === 0 ? 'red' : 'blue')) : null;

              return (
                <div
                  key={player.id}
                  className={`player-list-item 
                  ${player.isCurrentPlayer ? 'active-turn' : ''} 
                  ${!player.isAlive && !isEmpty ? 'dead' : (isEmpty ? 'empty' : 'occupied')} 
                  ${!isConnected && !isEmpty ? 'disconnected' : ''}`
                  }
                >
                <span
                  className="player-status-dot"
                  style={{
                    backgroundColor: isEmpty ? 'transparent' :
                      (!isConnected ? '#cbd5e0' :
                        (!player.isAlive ? '#ef4444' : '#4ade80')),
                    border: isEmpty ? '1px dashed #cbd5e0' : 'none'
                  }}
                  title={isEmpty ? "Chỗ trống" : (!isConnected ? "Mất kết nối" : (!player.isAlive ? "Đã nổ tung" : "Còn sống"))}
                ></span>

                  <span className="player-name">
                    {isTeamMode && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          marginRight: '4px',
                          fontWeight: 'bold',
                          color: team === 'red' ? '#ef4444' : '#3b82f6'
                        }}
                        title={team === 'red' ? 'Đội Đỏ' : 'Đội Xanh'}
                      >
                        {team === 'red' ? '🔴' : '🔵'}
                      </span>
                    )}
                    {getPlayerName(matchInfo)} {game.isSelf(player) ? '(Bạn)' : ''}
                  </span>

                  {!player.isAlive && (
                    <span className="dead-indicator" title="Đã nổ tung">☠️</span>
                  )}

                  {player.isCurrentPlayer && (
                    <span className="turn-indicator" title="Đang trong lượt">🎲</span>
                  )}
                </div>
              );
            })}

            {/* Spectators placeholder */}
            {game.isSpectator && (
              <div className="spectator-indicator" style={{marginTop: '0.5rem', fontSize: '0.8rem', color: '#60a5fa'}}>
                Bạn đang theo dõi ván đấu
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
