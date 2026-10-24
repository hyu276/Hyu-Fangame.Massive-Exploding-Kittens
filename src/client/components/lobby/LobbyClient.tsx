import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { LobbyClient as BgioLobbyClient } from 'boardgame.io/client';
import { LobbyHeader } from './LobbyHeader';
import { LobbyTopBar } from './LobbyTopBar';
import { MatchList, LobbyMatch } from './MatchList';
import { CreateMatchModal } from './CreateMatchModal';
import { NameModal } from './NameModal';
import { LobbyFooter } from './LobbyFooter';
import { InitialSetup } from './InitialSetup';
import './LobbyStyles.css';
import { RulebookButton } from '../rulebook/Rulebook';
import { BotSetupModal } from './BotSetupModal';
import type { BotMatchOptions } from '../../../common/bots/difficulty';
import { GameModeSelector } from './GameModeSelector';
import type { MatchPlayType } from './GameModeSelector';
import { getGameModeDefinition } from '../../../common/constants/game-modes';
import { getModeDeckSelection, getModePlayerCount } from './game-mode-selection';

interface LobbyClientProps {
  gameServer: string;
  gameName: string;
  onJoinMatch: (matchID: string, playerID: string | null, credentials: string | null) => void;
  onStartBotMatch: (options: BotMatchOptions) => void;
}

export default function LobbyClient({ gameServer, gameName, onJoinMatch, onStartBotMatch }: LobbyClientProps) {
  const lobbyClient = useMemo(() => new BgioLobbyClient({ server: gameServer }), [gameServer]);
  const autoJoinAttempted = useRef(false);

  const [matches, setMatches] = useState<LobbyMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [showNameModal, setShowNameModal] = useState(!playerName);
  const [tempPlayerName, setTempPlayerName] = useState(playerName);
  const [matchName, setMatchName] = useState(`${playerName}'s Match`);
  const [numPlayers, setNumPlayers] = useState(2);
  const [deckType, setDeckType] = useState('original');
  const [selectedDecks, setSelectedDecks] = useState<string[]>(['original']);
  const [openCards, setOpenCards] = useState(false);
  const [spectatorsSeeCards, setSpectatorsSeeCards] = useState(false);
  const [gameMode, setGameMode] = useState<number>(0);
  const [creating, setCreating] = useState(false);
  const [setupType, setSetupType] = useState<MatchPlayType | null>(null);
  const [configuring, setConfiguring] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const openSetup = (type: MatchPlayType) => {
    setSetupType(type);
    setConfiguring(false);
    setCreateError(null);
  };

  const selectGameMode = (modeId: number) => {
    const mode = getGameModeDefinition(modeId);
    if (mode.availability === 'planned') return;
    setGameMode(mode.id);
    setNumPlayers(previous => getModePlayerCount(mode, previous));
    setSelectedDecks(previous => getModeDeckSelection(mode, previous));
    setCreateError(null);
  };

  const joinMatch = useCallback(async (matchID: string, asSpectator: boolean = false) => {
    if (asSpectator) {
      console.log(`Spectating match ${matchID}`);
      onJoinMatch(matchID, null, null);
      return;
    }

    console.log(`Joining match ${matchID}`);
    await lobbyClient.joinMatch(gameName, matchID, {
      playerName
    }).then(({ playerID, playerCredentials }) => {
      onJoinMatch(matchID, playerID, playerCredentials);
    }).catch((err) => {
      setError('Failed to join match');
      console.error('Error joining match:', err);
      throw err;
    });
  }, [lobbyClient, gameName, playerName, onJoinMatch]);

  const handleAutoJoin = useCallback(async (matchID: string) => {
    setLoading(true);
    let match;
    
    // First try to find the match
    try {
      console.log('Attempting auto-join for match:', matchID);
      match = await lobbyClient.getMatch(gameName, matchID);
    } catch {
      console.log('Match not found or invalid, redirecting to root');
      window.history.replaceState({}, '', '/');
      setLoading(false);
      return;
    }

    // 1. Check if we have saved session credentials for this match (e.g. from reload)
    try {
      const savedSession = localStorage.getItem(`ek_session_${matchID}`);
      if (savedSession) {
        const { playerID, credentials } = JSON.parse(savedSession);
        if (playerID && credentials) {
          console.log(`Restoring saved player seat ${playerID} for match ${matchID}`);
          onJoinMatch(matchID, playerID, credentials);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Error reading saved session from localStorage:", e);
    }

    // 2. Otherwise join normally or as spectator if full
    try {
      const occupiedSeats = match.players.filter((p: any) => p.name).length;
      const maxPlayers = match.setupData?.maxPlayers || match.players.length;
      const isFull = occupiedSeats >= maxPlayers;

      if (isFull) {
         console.log('Match full and no saved session, joining as spectator...');
         await joinMatch(matchID, true);
      } else {
         console.log('Joining match as new player...');
         await joinMatch(matchID, false);
      }
    } catch (err: any) {
      console.error("Auto-join failed:", err);
      if (err.message && err.message.includes('full')) {
          try {
            await joinMatch(matchID, true);
          } catch (e: any) {
            setError(`Could not join match: ${e.message}`);
          }
      } else {
         setError(`Failed to join match from link: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [lobbyClient, gameName, onJoinMatch, joinMatch]);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await lobbyClient.listMatches(gameName, { isGameover: false });
      setMatches(data.matches.map(match => ({
        ...match,
        setupData: { matchName: match.matchID, openCards: false, ...match.setupData, maxPlayers: match.players.length },
        players: match.players.map(player => ({ ...player, id: String(player.id) })),
      })));
      setError(null);
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  }, [lobbyClient, gameName]);

  const createMatch = async () => {
    if (!matchName.trim()) {
      alert('Please enter a match name');
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const { matchID } = await lobbyClient.createMatch(gameName, {
        numPlayers,
        setupData: {
          matchName: matchName.trim(),
          maxPlayers: numPlayers,
          deckType: deckType,
          selectedDecks: selectedDecks,
          openCards: openCards,
          spectatorsSeeCards: openCards ? true : spectatorsSeeCards,
          gameMode: gameMode
        }
      });

      await joinMatch(matchID);
      setMatchName('');
      setSetupType(null);
    } catch (err) {
      setError('Failed to create match');
      setCreateError('Không thể tạo hoặc vào phòng. Kiểm tra kết nối và thử lại.');
      console.error('Error creating match:', err);
    } finally {
      setCreating(false);
    }
  };

  const savePlayerName = () => {
    if (!tempPlayerName.trim()) {
      alert('Please enter a name');
      return;
    }
    const trimmedName = tempPlayerName.trim();
    localStorage.setItem('playerName', trimmedName);
    setPlayerName(trimmedName);
    setShowNameModal(false);
    setMatchName(`${trimmedName}'s Match`);
  };

  const openNameModal = () => {
    setTempPlayerName(playerName);
    setShowNameModal(true);
  };

  useEffect(() => {
    if (playerName) {
      fetchMatches();
      const interval = setInterval(fetchMatches, 3000);
      return () => clearInterval(interval);
    }
  }, [playerName, fetchMatches]);

  // Validate match existence immediately on load
  useEffect(() => {
    const pathMatchID = window.location.pathname.substring(1);
    if (pathMatchID && !autoJoinAttempted.current) {
      lobbyClient.getMatch(gameName, pathMatchID).catch(() => {
        console.log('Match not found on load, redirecting to root');
        window.history.replaceState({}, '', '/');
      });
    }
  }, [lobbyClient, gameName]);

  // Handle auto-join from URL
  useEffect(() => {
    // Check path for matchID (e.g., "/matchID")
    const pathMatchID = window.location.pathname.substring(1);

    if (pathMatchID && playerName && !autoJoinAttempted.current) {
      if (pathMatchID.length > 0) {
        autoJoinAttempted.current = true;
        handleAutoJoin(pathMatchID);
      }
    }
  }, [playerName, handleAutoJoin]);

  const isInitialSetup = !playerName;

  if (showNameModal && isInitialSetup) {
    return (
      <InitialSetup
        name={tempPlayerName}
        onNameChange={setTempPlayerName}
        onSave={savePlayerName}
      />
    );
  }

  return (
    <div className="lobby-container">
      <RulebookButton />
      <LobbyHeader />

      <div className="lobby-content">
        <LobbyTopBar
          playerName={playerName}
          onEditName={openNameModal}
          onCreateMatch={() => openSetup('online')}
          onPlayBots={() => openSetup('bot')}
        />

        <MatchList
          matches={matches}
          loading={loading}
          error={error}
          onRefresh={fetchMatches}
          onJoinMatch={(...args) => { void joinMatch(...args).catch(() => {}); }}
        />
      </div>

      {setupType && <GameModeSelector
        gameMode={gameMode} playType={setupType} configuring={configuring} busy={creating}
        onGameModeChange={selectGameMode} onPlayTypeChange={setSetupType}
        onContinue={() => setConfiguring(true)} onBack={() => setConfiguring(false)}
        onClose={() => setSetupType(null)}>
        {setupType === 'bot' ? <BotSetupModal
          gameMode={gameMode} open={configuring} playerName={playerName}
          onStart={onStartBotMatch} onBack={() => setConfiguring(false)} onClose={() => setConfiguring(false)}
        /> : <CreateMatchModal
          open={configuring}
          matchName={matchName}
          numPlayers={numPlayers}
          deckType={deckType}
          selectedDecks={selectedDecks}
          openCards={openCards}
          spectatorsSeeCards={spectatorsSeeCards}
          gameMode={gameMode}
          creating={creating}
          onMatchNameChange={setMatchName}
          onNumPlayersChange={setNumPlayers}
          onDeckTypeChange={setDeckType}
          onSelectedDecksChange={setSelectedDecks}
          onOpenCardsChange={setOpenCards}
          onSpectatorsSeeCardsChange={setSpectatorsSeeCards}
          onBack={() => setConfiguring(false)}
          error={createError}
          onCreateMatch={createMatch}
          onClose={() => { if (!creating) setConfiguring(false); }}
        />}
      </GameModeSelector>}

      {showNameModal && !isInitialSetup && (
        <NameModal
          name={tempPlayerName}
          onNameChange={setTempPlayerName}
          onSave={savePlayerName}
          onClose={() => setShowNameModal(false)}
        />
      )}

      <LobbyFooter />
    </div>
  );
}
