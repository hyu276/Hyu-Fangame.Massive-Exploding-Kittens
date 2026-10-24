import './Board.css';
import Table from './table/Table';
import PlayerList from './player/player-list/PlayerList';
import BoardOverlays from './overlay/BoardOverlays.tsx';
import GameStatusList from './game-status/GameStatusList';
import {useEffect, useMemo, useRef} from 'react';
import {Chat} from '../chat/Chat';
import {useMatchDetails} from "../../context/MatchDetailsContext.tsx";
import {AnimationOverlay} from '../animations/AnimationOverlay.tsx';
import {TheGameClient} from "../../entities/game-client.ts";
import {GameProvider} from "../../context/GameContext.tsx";
import {AnimationProvider} from "../../context/AnimationContext.tsx";
import {CardSelectionProvider} from "../../context/CardSelectionContext.tsx";
import SideActionBar from "./action-panel/SideActionBar.tsx";
import ActionNotification from "./action-feed/ActionNotification.tsx";
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { QuickEmotes, FloatingEmoteOverlay } from './emotes/QuickEmotes';
import type { BoardProps } from 'boardgame.io/react';
import {IContext, IGameState} from '../../../common';

export default function ExplodingKittensBoard(props: BoardProps<IGameState> & { plugins: any }) {

  const game = useMemo(() => {
  const context: IContext = {
    G: props.G,
    ctx: props.ctx,
    playerID: props.playerID || undefined,
    matchID: props.matchID,
    events: props.events as IContext['events'],
    random: props.plugins.random,
    player: props.plugins.player,
  };

  return new TheGameClient(
    context,
    props.moves,
    props.matchID,
    props.playerID || null,
    props.matchData,
    props.sendChatMessage,
    props.chatMessages,
    props.isMultiplayer
  );
  }, [props]);

  const { setPollingInterval, matchDetails } = useMatchDetails();

  useEffect(() => {
    setPollingInterval(game.isLobbyPhase() ? 500 : 3000);
  }, [game, setPollingInterval]);

  // Resolve pending card immediately without countdown delay
  useEffect(() => {
    const pending = game.piles.pendingCard;
    if (!pending || game.isSpectator) return;
    const isPlayer = game.selfPlayerId === pending.playedBy || game.isSelfCurrentPlayer;
    if (!isPlayer) return;
    let retry: ReturnType<typeof setInterval> | undefined;
    const delay = Math.max(0, (pending.expiresAtMs ?? 0) - Date.now());
    const timeout = setTimeout(() => {
      game.moves.resolvePendingCard();
      retry = setInterval(() => game.moves.resolvePendingCard(), 300);
    }, Math.min(delay, 20));
    return () => { clearTimeout(timeout); clearInterval(retry); };
  }, [game]);

  useEffect(() => {
    const defense = game.gameState.handShuffleDefense;
    if (!defense || game.isSpectator) return;
    const isDefender = game.selfPlayerId === defense.targetPlayerId;
    if (matchDetails?.isBotMatch && !isDefender) return;
    if (!isDefender) return; // Only this stage can dispatch the completion move.
    let retry: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      game.moves.finishHandShuffleDefense();
      retry = setInterval(() => game.moves.finishHandShuffleDefense(), 1000);
    }, Math.max(0, defense.expiresAtMs - Date.now() + 50));
    return () => { clearTimeout(timeout); clearInterval(retry); };
  }, [game, matchDetails?.isBotMatch]);

  const snapshotDefense = game.gameState.handShuffleDefense;
  useEffect(() => {
    const defense = snapshotDefense;
    if (!defense || game.selfPlayerId !== defense.targetPlayerId || !game.moves.publishHandShuffleSnapshot) return;
    const timers = [3000, 6000, 9000].map(offset => {
      const at = defense.startedAtMs + offset;
      if (at <= (defense.snapshotAtMs ?? defense.startedAtMs)) return undefined;
      return window.setTimeout(() => game.moves.publishHandShuffleSnapshot(), Math.max(0, at - Date.now()));
    });
    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [snapshotDefense, game.moves, game.selfPlayerId]);

  const leaveAcknowledged = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (game.selfPlayer?.hasLeft || !game.isPlayingPhase()) leaveAcknowledged.current?.();
    const handleForfeit = (event: Event) => {
      if (!game.isPlayingPhase() || !game.selfPlayer || game.selfPlayer.hasLeft) return;
      const detail = (event as CustomEvent<{ waitUntil: (work: Promise<void>) => void }>).detail;
      const confirmation = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          leaveAcknowledged.current = null;
          reject(new Error('Chưa nhận được xác nhận từ máy chủ. Vui lòng kiểm tra kết nối và thử lại.'));
        }, 5000);
        leaveAcknowledged.current = () => {
          clearTimeout(timeout);
          leaveAcknowledged.current = null;
          resolve();
        };
      });
      detail.waitUntil(confirmation);
      game.forfeit();
    };
    window.addEventListener('ek_forfeit', handleForfeit);
    return () => window.removeEventListener('ek_forfeit', handleForfeit);
  }, [game]);

  useSoundEffects(game);

  return (
    <>
      <GameProvider game={game}>
        <AnimationProvider>
          <CardSelectionProvider>
            <div className={`board-container ${game.isSpectator ? 'hand-interactable' : ''} ${!game.selfPlayer?.isAlive ? 'dimmed' : ''} ${game.isLobbyPhase() ? 'pointer-events-none' : ''}`}>
              <div className={"game-elements"}>
                <Table />
                <PlayerList />
              </div>
            </div>

            <BoardOverlays />
            <GameStatusList />
            <SideActionBar />
            <ActionNotification />
            <QuickEmotes />
            <FloatingEmoteOverlay />
            <Chat />
            <AnimationOverlay />
          </CardSelectionProvider>
        </AnimationProvider>
      </GameProvider>
    </>
  );
}
