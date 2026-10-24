import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LobbyClient } from 'boardgame.io/client';
import type { BoardEdition } from '../../../common/board-game/manifest';
import { BOARD_GAME_NAME } from '../../../common/board-game/manifest';
import './BoardGame.css';
import { CreditsButton } from '../credits/CreditsButton';

interface MatchSummary {
  matchID: string;
  players: Array<{ id: number; name?: string }>;
  setupData?: { matchName?: string; edition?: BoardEdition };
}

export default function BoardLobby({ server, onJoin, onBot }: {
  server: string;
  onJoin: (matchID: string, playerID: string | null, credentials: string | null) => void;
  onBot: (edition: BoardEdition, botCount: number) => void;
}) {
  const lobby = useMemo(() => new LobbyClient({ server }), [server]);
  const [name, setName] = useState(localStorage.getItem('playerName') || '');
  const [matchName, setMatchName] = useState('Board Race');
  const [edition, setEdition] = useState<BoardEdition>('classic');
  const [numPlayers, setNumPlayers] = useState(2);
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const autoJoinAttempted = useRef(false);

  const refresh = useCallback(async () => {
    try { const result = await lobby.listMatches(BOARD_GAME_NAME, { isGameover: false }); setMatches(result.matches as MatchSummary[]); }
    catch { setError('Không kết nối được máy chủ Board Game.'); }
  }, [lobby]);
  useEffect(() => { void refresh(); const id = setInterval(() => void refresh(), 5000); return () => clearInterval(id); }, [refresh]);
  useEffect(() => {
    const matchID = window.location.pathname.slice(1);
    if (!matchID || !name.trim() || !localStorage.getItem('playerName') || autoJoinAttempted.current) return;
    autoJoinAttempted.current = true;
    let canceled = false;
    void lobby.getMatch(BOARD_GAME_NAME, matchID).then(match => {
      if (canceled) return;
      const saved = localStorage.getItem(`ek_session_${matchID}`);
      if (saved) {
        try {
          const session = JSON.parse(saved) as { playerID: string; credentials: string };
          if (session.playerID && session.credentials) { onJoin(matchID, session.playerID, session.credentials); return; }
        } catch { /* Fall through to spectator or fresh join. */ }
      }
      if (match.players.every(p => p.name)) onJoin(matchID, null, null);
      else if (name.trim()) void join(matchID);
    }).catch(() => { if (!canceled) setError('Phòng Board Game trong đường dẫn không tồn tại.'); });
    return () => { canceled = true; };
  // A saved share link is retried when a first-time visitor enters a player name.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const join = async (matchID: string) => {
    if (!name.trim()) { setError('Hãy nhập tên người chơi.'); return; }
    setBusy(true); setError('');
    try {
      const result = await lobby.joinMatch(BOARD_GAME_NAME, matchID, { playerName: name.trim() });
      localStorage.setItem('playerName', name.trim());
      onJoin(matchID, result.playerID, result.playerCredentials);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể vào phòng.'); }
    finally { setBusy(false); }
  };
  const create = async () => {
    if (!name.trim() || !matchName.trim()) { setError('Hãy nhập tên người chơi và tên phòng.'); return; }
    setBusy(true); setError('');
    try {
      const result = await lobby.createMatch(BOARD_GAME_NAME, { numPlayers,
        setupData: { edition, matchName: matchName.trim(), maxPlayers: numPlayers } });
      await join(result.matchID);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tạo phòng.'); }
    finally { setBusy(false); }
  };

  return <main className="board-lobby">
    <header><p className="board-kicker">Exploding Kittens · Board Race</p><h1>The Board Game</h1>
      <p>Đua đến Ribbon. Bản chơi thử kỹ thuật; số lượng từng loại lá và sơ đồ từng ô chưa xác minh theo bản in.</p></header>
    <section className="board-lobby-grid">
      <div className="board-panel"><h2>Tạo phòng</h2>
        <label>Tên của bạn<input value={name} maxLength={40} onChange={e => setName(e.target.value)} /></label>
        <label>Tên phòng<input value={matchName} maxLength={100} onChange={e => setMatchName(e.target.value)} /></label>
        <label>Phiên bản<select value={edition} onChange={e => setEdition(e.target.value as BoardEdition)}>
          <option value="classic">Classic · 64 Action Cards</option>
          <option value="super_fan">Super Fan · Charity Case + Feral Cat</option>
        </select></label>
        <label>Số người chơi<select value={numPlayers} onChange={e => setNumPlayers(Number(e.target.value))}>
          {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
        </select></label>
        <button disabled={busy} onClick={() => void create()}>Tạo phòng online</button>
        <button disabled={busy || !name.trim()} onClick={() => { localStorage.setItem('playerName', name.trim()); onBot(edition, numPlayers - 1); }}>Chơi thử với {numPlayers - 1} bot</button>
      </div>
      <div className="board-panel"><h2>Phòng đang mở</h2>
        <button onClick={() => void refresh()}>Làm mới</button>
        {matches.length === 0 ? <p>Chưa có phòng Board Game.</p> : matches.map(m => <div className="board-room" key={m.matchID}>
          <div><strong>{m.setupData?.matchName || m.matchID}</strong><small>{m.setupData?.edition === 'super_fan' ? 'Super Fan' : 'Classic'} · {m.players.filter(p => p.name).length}/{m.players.length}</small></div>
          <button disabled={busy || m.players.every(p => p.name)} onClick={() => void join(m.matchID)}>Tham gia</button>
          <button onClick={() => onJoin(m.matchID, null, null)}>Xem</button>
        </div>)}
      </div>
    </section>
    {error && <p className="board-error" role="alert">{error}</p>}
    <p className="board-disclaimer">Manifest thử nghiệm · Không công bố là bản luật hoặc bộ bài chính thức hoàn chỉnh.</p>
    <div className="board-lobby-credits"><CreditsButton appearance="board" /></div>
  </main>;
}
