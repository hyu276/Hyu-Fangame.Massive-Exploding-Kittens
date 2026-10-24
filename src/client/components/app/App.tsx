import { Component } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { ExplodingKittens } from '../../../common';
import ExplodingKittensBoard from '../board/Board';
import { LobbyClient as BgioLobbyClient } from 'boardgame.io/client';
import LobbyClient from '../lobby/LobbyClient';
import GameView from '../game-view/GameView';
import { preloadCardImages } from '../../utils/preloadImages';
import { MatchDetailsProvider } from '../../context/MatchDetailsContext';
import { SERVER_URL, GAME_NAME } from '../../config';
import BotMatch from '../bot-match/BotMatch';
import type { BotMatchOptions } from '../../../common/bots/difficulty';
import { BoardGame } from '../../../common/board-game/board-race';
import { BOARD_GAME_NAME } from '../../../common/board-game/manifest';
import type { BoardEdition } from '../../../common/board-game/manifest';
import BoardGameBoard, { BoardExitContext } from '../board-game/BoardGameBoard';
import BoardLobby from '../board-game/BoardLobby';
import BoardBotMatch from '../board-game/BoardBotMatch';
import '../board-game/BoardGame.css';

const ExplodingKittensClient = Client({
  game: ExplodingKittens,
  board: ExplodingKittensBoard,
  debug: false,
  multiplayer: SocketIO({ server: SERVER_URL }),
});
const BoardRaceClient = Client({
  game: BoardGame, board: BoardGameBoard, debug: false,
  multiplayer: SocketIO({ server: SERVER_URL }),
});

interface AppState {
  botMatch?: BotMatchOptions;
  boardBot?: { edition: BoardEdition; botCount: number };
  family: 'card' | 'board';
  inMatch: boolean;
  matchID: string | null;
  playerID: string | null;
  credentials: string | null;
  matchName?: string;
  numPlayers?: number;
}

export default class App extends Component<Record<string, never>, AppState> {
  private lobbyClient = new BgioLobbyClient({server: SERVER_URL});

  state: AppState = {
    family: new URLSearchParams(window.location.search).get('family') === 'board' ? 'board' : 'card',
    inMatch: false,
    matchID: null,
    playerID: null,
    credentials: null,
    matchName: undefined,
    numPlayers: undefined
  };

  componentDidMount() {
    try {
      const savedTheme = localStorage.getItem('ek_theme');
      if (savedTheme && savedTheme !== 'red') {
        document.body.classList.add(`theme-${savedTheme}`);
      }
    } catch { /* Storage or browser capabilities may be unavailable. */ }

    preloadCardImages().then(() => {
      console.log('All card images preloaded successfully');
    }).catch((err: any) => {
      console.error('Error preloading card images:', err);
    });

  }

  handleJoinMatch = (matchID: string, playerID: string | null, credentials: string | null) => {
    // Update URL with matchID
    const newPath = `/${matchID}${this.state.family === 'board' ? '?family=board' : ''}`;
    if (window.location.pathname !== newPath) window.history.pushState({}, '', newPath);

    // Save session to localStorage so reloading keeps player in their seat
    if (playerID && credentials) {
      try {
        localStorage.setItem(`ek_session_${matchID}`, JSON.stringify({ playerID, credentials }));
      } catch (e) {
        console.error('Failed to save session to localStorage', e);
      }
    }

    this.setState({ inMatch: true, matchID, playerID, credentials });
  };

  handleLeaveMatch = async () => {
    const { matchID, playerID, credentials } = this.state;

    if (matchID) {
      console.log('Leaving match...');

      // Clear saved session
      try {
        localStorage.removeItem(`ek_session_${matchID}`);
      } catch (e) {
        console.error('Failed to remove session from localStorage', e);
      }

      // Clear matchID from URL, return to root
      window.history.pushState({}, '', this.state.family === 'board' ? '/?family=board' : '/');

      this.setState({
        inMatch: false,
        matchID: null,
        playerID: null,
        credentials: null,
        matchName: undefined,
        numPlayers: undefined
      });

      console.log('Returned to lobby');

      // Only attempt to leave on server if we were a registered player
      if (playerID && credentials) {
        // Wait for React to process the state change and unmount the component
        // This ensures Socket.IO disconnects before we call the API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Now leave the match via the lobby API
        // By this time, the client has been unmounted and Socket.IO has disconnected
        try {
          await this.lobbyClient.leaveMatch(this.state.family === 'board' ? BOARD_GAME_NAME : GAME_NAME, matchID, {
            playerID: playerID,
            credentials: credentials
          });
          console.log('Successfully left match via API');
        } catch (err) {
          console.error('Error calling leaveMatch API:', err);
        }
      }

      console.log('Successfully left match');
    }
  };

  render() {
    if (this.state.boardBot) {
      return <BoardBotMatch edition={this.state.boardBot.edition} botCount={this.state.boardBot.botCount}
        onLeave={() => this.setState({ boardBot: undefined })} />;
    }
    if (this.state.botMatch) {
      return <BotMatch options={this.state.botMatch} onLeave={() => this.setState({ botMatch: undefined })} />;
    }
    const {inMatch, matchID, playerID, credentials, matchName, numPlayers, family} = this.state;

    if (!inMatch) {
      return (
        <><nav className="game-family-switch" aria-label="Chọn dòng game">
          <button aria-pressed={family === 'card'} onClick={() => { window.history.pushState({}, '', '/'); this.setState({ family: 'card' }); }}>Card Game</button>
          <button aria-pressed={family === 'board'} onClick={() => { window.history.pushState({}, '', '/?family=board'); this.setState({ family: 'board' }); }}>The Board Game · thử nghiệm</button>
        </nav>{family === 'board'
          ? <BoardLobby server={SERVER_URL} onJoin={this.handleJoinMatch} onBot={(edition, botCount) => this.setState({ boardBot: { edition, botCount } })} />
          : <LobbyClient gameServer={SERVER_URL} gameName={GAME_NAME} onJoinMatch={this.handleJoinMatch}
            onStartBotMatch={botMatch => this.setState({ botMatch })} />}</>
      );
    }

    console.log('Mounting game view for match', matchID, 'with player', playerID);

    if (!matchID) {
      return <div>Error: Invalid match data</div>;
    }

    if (family === 'board') {
      return <BoardExitContext.Provider value={() => void this.handleLeaveMatch()}><div className="board-match-shell">
        <BoardRaceClient key={matchID} matchID={matchID} playerID={playerID || undefined} credentials={credentials || undefined} />
      </div></BoardExitContext.Provider>;
    }


    return (
      <MatchDetailsProvider matchID={matchID}>
        <GameView
          matchID={matchID}
          matchName={matchName}
          numPlayers={numPlayers}
          onLeave={this.handleLeaveMatch}
        >
          <ExplodingKittensClient
            key={matchID}
            matchID={matchID}
            playerID={playerID || undefined}
            credentials={credentials || undefined}
          />
        </GameView>
      </MatchDetailsProvider>
    );
  }
}
