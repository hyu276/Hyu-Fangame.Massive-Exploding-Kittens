import { useEffect, useMemo, useState } from 'react';
import { Client } from 'boardgame.io/react';
import Board from '../board/Board';
import GameView from '../game-view/GameView';
import { MatchDetailsProvider, type MatchDetails } from '../../context/MatchDetailsContext';
import { createBotSession } from '../../bots/bot-session';
import { BOT_DIFFICULTIES, type BotMatchOptions } from '../../../common/bots/difficulty';
import { getGameModeInfo } from '../../../common';
import './BotMatch.css';

export default function BotMatch({ options, onLeave }: { options: BotMatchOptions; onLeave: () => void }) {
  const [round, setRound] = useState(0);
  const session = useMemo(() => ({ ...createBotSession(options), round }), [options, round]);
  const diffLabel = BOT_DIFFICULTIES[options.difficulty].label;
  const modeInfo = getGameModeInfo(options.gameMode ?? 0);
  const details = useMemo<MatchDetails>(() => ({
    matchID: session.matchID,
    matchName: `Đấu Bot · ${modeInfo.vietnameseName} · ${diffLabel}`,
    numPlayers: session.numPlayers,
    isBotMatch: true,
    players: Array.from({ length: session.numPlayers }, (_, i) => ({
      id: String(i),
      name: i === 0 ? options.playerName : `🤖 Bot ${i} · ${diffLabel}`,
      isConnected: true,
    })),
  }), [session, options.playerName, diffLabel, modeInfo]);
  const GameClient = useMemo(() => Client({
    game: session.game, multiplayer: session.multiplayer, numPlayers: session.numPlayers, debug: false,
    board: props => <Board {...props} matchData={details.players.map(p => ({ ...p, id: Number(p.id) }))} />,
  }), [session, details]);
  useEffect(() => {
    session.start();
    return () => session.stop();
  }, [session]);

  return (
    <MatchDetailsProvider key={session.matchID} matchID={session.matchID} localDetails={details}>
      <GameView matchID={session.matchID} onLeave={onLeave}>
        <div className="bot-match-bar">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>{modeInfo.icon}</span>
            <strong style={{ color: modeInfo.badgeColor || '#fb923c' }}>{modeInfo.vietnameseName}</strong>
            <span>• 🤖 {options.botCount} bot · {diffLabel}</span>
          </span>
          <button className="btn btn-secondary" onClick={() => setRound(value => value + 1)}>Chơi lại</button>
        </div>
        <GameClient key={session.matchID} matchID={session.matchID} playerID="0" />
      </GameView>
    </MatchDetailsProvider>
  );
}
