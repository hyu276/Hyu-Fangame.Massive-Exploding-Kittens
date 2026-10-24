import { useEffect, useMemo, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Client as EngineClient } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { BoardGame, createBoardState, type BoardRaceState } from '../../../common/board-game/board-race';
import type { BoardEdition } from '../../../common/board-game/manifest';
import BoardGameBoard, { BoardExitContext } from './BoardGameBoard';

const catKinds = new Set(['cat_taco', 'cat_beard', 'cat_rainbow']);

export default function BoardBotMatch({ edition, botCount, onLeave }: { edition: BoardEdition; botCount: number; onLeave: () => void }) {
  const [round, setRound] = useState(0);
  const session = useMemo(() => {
    const game = { ...BoardGame, setup: (context: Parameters<NonNullable<typeof BoardGame.setup>>[0]) =>
      createBoardState(context.ctx.numPlayers, edition, context.random) };
    const multiplayer = Local();
    const matchID = `board-bot-${round}-${crypto.randomUUID()}`;
    const numPlayers = botCount + 1;
    const clients = Array.from({ length: botCount }, (_, i) => EngineClient({ game, multiplayer, matchID, numPlayers, playerID: String(i + 1), debug: false }));
    return { game, multiplayer, matchID, numPlayers, clients };
  // New match only when rematching or changing initial options.
  }, [edition, botCount, round]);
  const GameClient = useMemo(() => Client({ game: session.game, multiplayer: session.multiplayer,
    numPlayers: session.numPlayers, debug: false, board: BoardGameBoard }), [session]);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    for (const client of session.clients) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const unsub = client.subscribe(state => {
        clearTimeout(timer);
        if (!state || state.ctx.gameover) return;
        const G = state.G as BoardRaceState;
        const id = client.playerID!;
        const myTurn = state.ctx.currentPlayer === id;
        if (!myTurn) return;
        const moves = client.moves;
        timer = setTimeout(() => {
          if (client.getState()?._stateID !== state._stateID) return;
          if (G.pendingAction) { moves.resolveAction(); return; }
          if (G.phase === 'move_choice') { moves.chooseMoveOption(true); return; }
          if (G.phase === 'alter_choice') { if (G.privateReveal?.owner === id) moves.reorderFuture(G.privateReveal.discIds); return; }
          if (G.phase === 'ek_choice') { moves.chooseExplosion(G.players[Number(id)].hand.some(c => c.kind === 'defuse')); return; }
          if (G.phase === 'swap_choice') { moves.chooseSwap(G.swapTargets?.[0]); return; }
          if (G.phase === 'discard_choice') { moves.discardToThree(G.players[Number(id)].hand.slice(3).map(c => c.id)); return; }
          if (G.phase !== 'actions') return;
          const hand = G.players[Number(id)].hand;
          const replacement = hand.find(c => ['one_small_step', 'mega_move', 'slow_steady', 'draw_bottom', 'fast_pass', 'ditto', 'skip_draw_3'].includes(c.kind)
            && (c.kind !== 'ditto' || G.moveDiscardPile.length > 0)
            && (c.kind !== 'fast_pass' || [...G.moveDrawPile, ...G.moveDiscardPile].some(d => d.kind.includes('move_4') || d.kind.includes('move_5'))));
          if (replacement) { moves.playAction(replacement.id); return; }
          const cat = hand.find(c => catKinds.has(c.kind));
          const partner = cat && hand.find(c => c.id !== cat.id && (c.kind === cat.kind || c.kind === 'feral_cat'));
          const target = G.players.find(p => p.id !== id && p.handCount && p.handCount > 0);
          if (cat && partner && target) { moves.playAction(cat.id, partner.id, target.id); return; }
          moves.drawMove();
        }, 350);
      });
      client.start();
      cleanups.push(() => { clearTimeout(timer); unsub(); client.stop(); });
    }
    return () => cleanups.forEach(fn => fn());
  }, [session]);

  return <BoardExitContext.Provider value={onLeave}><div className="board-match-shell">
    <button className="board-match-exit" onClick={() => setRound(value => value + 1)}>Chơi lại</button>
    <GameClient key={session.matchID} matchID={session.matchID} playerID="0" />
  </div></BoardExitContext.Provider>;
}
