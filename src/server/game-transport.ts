import { SocketIO } from 'boardgame.io/dist/cjs/server.js';
import { Master } from 'boardgame.io/master';
import { ExplodingKittens } from '../common';
import type { IGameState } from '../common/models';
import type { Async, Sync } from 'boardgame.io/dist/types/src/server/db/base';
import type { Auth } from 'boardgame.io/dist/types/src/server/auth';

export class GameTransport extends SocketIO {
  init(...args: Parameters<SocketIO['init']>): void {
    super.init(...args);
    const [app, games] = args;
    for (const game of games) {
      app._io!.of(game.name!).on('connection', socket => {
        socket.use((packet, next) => {
          if (packet[0] === 'update') {
            const [, action, stateID, matchID, playerID] = packet;
            // Players submit moves only. Engine events and another seat's identity
            // must never be accepted directly from a network client.
            if (action?.type !== 'MAKE_MOVE' || typeof playerID !== 'string' ||
                action.payload?.playerID !== playerID || typeof matchID !== 'string' ||
                !Number.isInteger(stateID) || !Array.isArray(action.payload?.args)) {
              next(new Error('Invalid game action'));
              return;
            }
          }
          next();
        });
      });
    }
  }

  /** Serialized with socket moves; deadlines also progress without a connected owner. */
  async tickDeadlines(db: Async | Sync, auth: Auth): Promise<void> {
    const matches = await db.listMatches({ gameName: ExplodingKittens.name, where: { isGameover: false } });
    for (const matchID of matches) {
      await this.getMatchQueue(matchID).add(async () => {
        const { state, metadata } = await db.fetch(matchID, { state: true, metadata: true });
        if (!state || state.ctx.gameover || state.ctx.phase !== 'play') return;
        const G = state.G as IGameState;
        const now = Date.now();
        const defense = G.handShuffleDefense;
        let move: string | undefined;
        let playerID = state.ctx.currentPlayer;
        if (G.piles.pendingCardPlay && now >= G.piles.pendingCardPlay.expiresAtMs) move = 'resolvePendingCard';
        else if (defense) {
          playerID = defense.targetPlayerId;
          if (now >= defense.expiresAtMs) move = 'finishHandShuffleDefense';
          else if (Math.floor((now - defense.startedAtMs) / 3000) >
            Math.floor(((defense.snapshotAtMs ?? defense.startedAtMs) - defense.startedAtMs) / 3000)) move = 'publishHandShuffleSnapshot';
        }
        if (!move) return;
        const credentials = metadata?.players[Number(playerID)]?.credentials;
        if (!credentials) return;
        const master = new Master(ExplodingKittens as unknown as ConstructorParameters<typeof Master>[0], db, {
          send: () => {},
          sendAll: payload => this.pubSub.publish(`MATCH-${matchID}`, payload),
        }, auth);
        await master.onUpdate({ type: 'MAKE_MOVE', payload: {
          type: move, args: [], playerID, credentials,
        } }, state._stateID, matchID, playerID);
      });
    }
  }
}
