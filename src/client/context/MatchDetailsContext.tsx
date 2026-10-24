import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { LobbyClient } from 'boardgame.io/client';
import { MatchPlayer } from '../utils/matchData';
import {GAME_NAME, SERVER_URL} from "../config.ts";
export interface MatchDetails {
  matchID: string;
  players: MatchPlayer[];
  numPlayers: number;
  matchName: string;
  isBotMatch?: boolean;
}

interface MatchDetailsContextType {
  matchDetails: MatchDetails | null;
  loading: boolean;
  error: string | null;
  refreshMatchDetails: () => Promise<void>;
  setPollingInterval: (interval: number) => void;
}

const MatchDetailsContext = createContext<MatchDetailsContextType | undefined>(undefined);

interface MatchDetailsProviderProps {
  matchID: string;
  localDetails?: MatchDetails;
  children: ReactNode;
}

export function MatchDetailsProvider({ matchID, children, localDetails }: MatchDetailsProviderProps) {
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(localDetails ?? null);
  const [loading, setLoading] = useState(!localDetails);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number>(3000);

  const requestVersion = useRef(0);
  const fetchMatchDetails = useCallback(async () => {
    if (localDetails || !matchID) return;
    const version = ++requestVersion.current;
    try {
      const match = await new LobbyClient({ server: SERVER_URL }).getMatch(GAME_NAME, matchID);
      if (version !== requestVersion.current) return;
      setMatchDetails({
        matchID: match.matchID,
        matchName: match.setupData?.matchName || 'Match',
        numPlayers: match.players.length,
        players: match.players.map(p => ({ id: String(p.id), name: p.name, isConnected: p.isConnected })),
      });
      setError(null);
    } catch (err) {
      if (version === requestVersion.current) setError(err instanceof Error ? err.message : 'Không thể tải thông tin phòng');
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [matchID, localDetails]);

  useEffect(() => {
    setMatchDetails(localDetails ?? null);
    setError(null);
    setLoading(!localDetails && !!matchID);
    void fetchMatchDetails();
    const requests = requestVersion;
    return () => { requests.current++; };
  }, [matchID, localDetails, fetchMatchDetails]);

  useEffect(() => {
    if (localDetails || !matchID) return;
    const interval = setInterval(() => void fetchMatchDetails(), Math.max(500, pollingInterval));
    return () => clearInterval(interval);
  }, [matchID, localDetails, pollingInterval, fetchMatchDetails]);

  return (
    <MatchDetailsContext.Provider value={{ 
      matchDetails: localDetails ?? matchDetails, 
      loading, 
      error, 
      refreshMatchDetails: fetchMatchDetails,
      setPollingInterval
    }}>
      {children}
    </MatchDetailsContext.Provider>
  );
}

export function useMatchDetails() {
  const context = useContext(MatchDetailsContext);
  if (context === undefined) {
    throw new Error('useMatchDetails must be used within a MatchDetailsProvider');
  }
  return context;
}
