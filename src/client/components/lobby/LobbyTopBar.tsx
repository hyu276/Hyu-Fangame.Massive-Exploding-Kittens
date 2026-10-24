import { PlayerProfile } from './PlayerProfile';
import '../common/Button.css';
import './LobbyStyles.css';

interface LobbyTopBarProps {
  playerName: string;
  onEditName: () => void;
  onCreateMatch: () => void;
  onPlayBots: () => void;
}

export function LobbyTopBar({ playerName, onEditName, onCreateMatch, onPlayBots }: LobbyTopBarProps) {
  return (
    <div className="lobby-top-bar">
      <PlayerProfile playerName={playerName} onEditName={onEditName} />
      <button className="btn btn-secondary btn-large" onClick={onPlayBots}>🤖 Đấu Bot</button>
      <button
        className="btn btn-primary btn-large"
        onClick={onCreateMatch}
      >
        💥 Tạo Trận Đấu Mới
      </button>
    </div>
  );
}

