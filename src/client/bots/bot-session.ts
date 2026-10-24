import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { KittenBot, type BotFutureIntel } from '../../common/bots/kitten-bot';
import { BOT_DIFFICULTIES, type BotMatchOptions } from '../../common/bots/difficulty';
import { createBotGame } from './bot-game';
import { watchBotClient } from './bot-controller';

/** A private, in-browser match. Every seat still goes through the game engine. */
export function createBotSession(options: BotMatchOptions) {
  if (!Number.isInteger(options.botCount) || options.botCount < 1 || options.botCount > 10 ||
      !Object.prototype.hasOwnProperty.call(BOT_DIFFICULTIES, options.difficulty)) throw new Error('Thiết lập bot không hợp lệ');
  let futureIntel: BotFutureIntel | undefined;
  const game = createBotGame(options, cards => {
    futureIntel = { revision: (futureIntel?.revision ?? 0) + 1, cards };
  });
  const multiplayer = Local();
  const matchID = `bots-${crypto.randomUUID()}`;
  const numPlayers = options.botCount + 1;
  const clients = Array.from({ length: options.botCount }, (_, i) => Client({
    game, multiplayer, numPlayers, matchID, playerID: String(i + 1), debug: false,
  }));
  const cleanups: (() => void)[] = [];
  return {
    game, multiplayer, matchID, numPlayers,
    start() {
      if (cleanups.length) return;
      for (const client of clients) {
        const bot = new KittenBot(client.playerID!, options.difficulty, Math.random, () => futureIntel);
        const stopWatching = watchBotClient(client, bot);
        client.start();
        cleanups.push(() => { stopWatching(); client.stop(); });
      }
    },
    stop() {
      cleanups.splice(0).forEach(cleanup => cleanup());
    },
  };
}
