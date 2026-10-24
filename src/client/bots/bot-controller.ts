import type { _ClientImpl } from 'boardgame.io/dist/types/src/client/client';
import type { IGameState, IPluginAPIs } from '../../common/models';
import type { KittenBot } from '../../common/bots/kitten-bot';

/** One cancellable deadline per seat; an intervening state update replaces it. */
export function watchBotClient(client: _ClientImpl<IGameState, IPluginAPIs>, bot: KittenBot): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let plannedVersion: number | undefined;
  const unsubscribe = client.subscribe(state => {
    if (state && state._stateID === plannedVersion) return;
    clearTimeout(timer);
    plannedVersion = state?._stateID;
    const next = bot.decide(state);
    if (!next || !state) return;
    const version = state._stateID;
    timer = setTimeout(() => {
      if (client.getState()?._stateID === version) client.moves[next.move](...next.args);
    }, next.delay ?? 650);
  });
  return () => { clearTimeout(timer); unsubscribe(); };
}
