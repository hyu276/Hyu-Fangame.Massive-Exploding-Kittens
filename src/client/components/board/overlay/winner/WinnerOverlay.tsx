import React from 'react';
import {useGame} from '../../../../context/GameContext';
import {getPlayerName} from '../../../../utils/matchData';
import {GAME_MODE_TEAM_UP} from '../../../../../common';
import "./WinnerOverlay.css"

const WinnerOverlay: React.FC = () => {
  const game = useGame();
  const winner = game.players.winner;
  const isTeamMode = game.gameState.gameMode === GAME_MODE_TEAM_UP;
  const winningTeam = game.gameState.winningTeam;

  if (!game.isGameOver() && !winningTeam && !winner) return null;

  if (isTeamMode && winningTeam) {
    const isSelfWinningTeam = game.selfPlayerId
      ? (game.gameState.teams?.[game.selfPlayerId] || (Number(game.selfPlayerId) % 2 === 0 ? 'red' : 'blue')) === winningTeam
      : false;
    const teamName = winningTeam === 'red' ? 'Đội Đỏ 🔴' : 'Đội Xanh 🔵';

    const winningMembers = game.players.allPlayers
      .filter(p => (game.gameState.teams?.[p.id] || (Number(p.id) % 2 === 0 ? 'red' : 'blue')) === winningTeam)
      .map(p => getPlayerName(p.id, game.matchData));

    return (
      <div className="winner-overlay">
        <div className="winner-content">
          <div className="winner-trophy">🏆</div>
          <div className="winner-title">Kết Thúc Trận Đấu (Đấu Đội)!</div>
          <div className="winner-name" style={{ color: winningTeam === 'red' ? '#f87171' : '#60a5fa' }}>
            {isSelfWinningTeam ? `Đội Của Bạn (${teamName}) Đã Chiến Thắng! 🎉` : `${teamName} Đã Chiến Thắng!`}
          </div>
          <div className="winner-subtitle">
            {isSelfWinningTeam
              ? 'Chúc mừng đội bạn đã phối hợp xuất sắc và quét sạch đối phương!'
              : 'Toàn bộ thành viên đội bạn đã bị tiêu diệt. Chúc may mắn lần sau!'}
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            border: `1.5px solid ${winningTeam === 'red' ? '#ef4444' : '#3b82f6'}`,
            fontSize: '0.95rem'
          }}>
            <div style={{ fontWeight: 'bold', color: winningTeam === 'red' ? '#fca5a5' : '#93c5fd', marginBottom: '4px' }}>
              🎖️ Thành viên {teamName}:
            </div>
            <div>{winningMembers.join(', ')}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!winner) return null;

  const winnerName = getPlayerName(winner.id, game.matchData);

  return (
    <div className="winner-overlay">
      <div className="winner-content">
        <div className="winner-trophy">🏆</div>
        <div className="winner-title">Kết Thúc Trận Đấu!</div>
        <div className="winner-name">
          {game.selfPlayerId === winner.id ? 'Bạn Đã Chiến Thắng! 🎉' : `${winnerName} Đã Chiến Thắng!`}
        </div>
        <div className="winner-subtitle">
          {game.selfPlayerId === winner.id
            ? 'Chúc mừng bạn đã xuất sắc sống sót đến cuối cùng!'
            : 'Chúc bạn may mắn lần sau!'}
        </div>
      </div>
    </div>
  );
}

export default WinnerOverlay;
