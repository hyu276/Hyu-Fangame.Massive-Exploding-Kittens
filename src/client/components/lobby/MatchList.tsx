import { MatchCard } from './MatchCard';
import { MatchPlayer } from '../../utils/matchData';
import './LobbyStyles.css';

interface MatchSetupData {
  matchName: string;
  maxPlayers: number;
  openCards: boolean;
  spectatorsSeeCards?: boolean;
  deckType?: string;
  selectedDecks?: string[];
}

interface LobbyMatch {
  matchID: string;
  gameName: string;
  players: Array<MatchPlayer>;
  setupData: MatchSetupData;
}

interface MatchListProps {
  matches: LobbyMatch[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onJoinMatch: (matchID: string, asSpectator?: boolean) => void;
}

export function MatchList({ matches, loading, error, onRefresh, onJoinMatch }: MatchListProps) {
  // Sort matches
  const sortedMatches = [...matches].sort((a, b) => {
    const joinedA = a.players.filter(p => p?.isConnected).length;
    const joinedB = b.players.filter(p => p?.isConnected).length;
    const isWaitingA = joinedA < a.setupData.maxPlayers;
    const isWaitingB = joinedB < b.setupData.maxPlayers;

    if (isWaitingA && !isWaitingB) return -1;
    if (!isWaitingA && isWaitingB) return 1;
    return 0;
  });

  return (
    <div className="lobby-section lobby-section-matches">
      <div className="lobby-section-header">
        <h2 className="lobby-section-title">Danh Sách Trận Đấu</h2>
        <button className="lobby-refresh-btn" onClick={onRefresh} title="Làm mới">
          🔄
        </button>
      </div>

      {error && (
        <div className="lobby-error">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="lobby-loading">
          <div className="lobby-spinner" />
          <p className="lobby-loading-text">Đang tải danh sách phòng...</p>
        </div>
      ) : sortedMatches.length === 0 ? (
        <div className="lobby-empty-state">
          <div className="lobby-empty-icon">🎲</div>
          <p className="lobby-empty-text">
            Chưa có trận đấu nào khả dụng.<br />Hãy tạo phòng mới để bắt đầu ngay!
          </p>
        </div>
      ) : (
        <div className="lobby-match-list">
          {sortedMatches.map((match) => (
            <MatchCard
              key={match.matchID}
              matchID={match.matchID}
              matchName={match.setupData?.matchName || match.matchID}
              players={match.players}
              setupData={match.setupData}
              onJoin={onJoinMatch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export type { LobbyMatch, MatchSetupData };
