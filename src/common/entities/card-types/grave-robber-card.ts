import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_GRAVE_ROBBER} from '../../constants/cards';
import {CHOOSE_CARD_FOR_GRAVE_ROBBER} from '../../constants/stages';

export class GraveRobberCard extends CardType {
  constructor(name: string = NAME_GRAVE_ROBBER) {
    super(name);
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    const deadPlayers = game.context.G.deadPlayers || [];
    return deadPlayers.some(pId => {
      const p = game.players.getPlayer(pId);
      return p && p.handSize > 0;
    });
  }

  onPlayed(game: TheGame, _card: Card) {
    const deadPlayers = game.context.G.deadPlayers || [];
    const deadWithCards = deadPlayers.filter(pId => {
      const p = game.players.getPlayer(pId);
      return p && p.handSize > 0;
    });

    if (deadWithCards.length === 0) {
      return;
    }

    game.gameState.graveRobberPending = [...deadWithCards];
    const firstPlayer = deadWithCards[0];
    game.turnManager.setActivePlayers({
      value: {
        [firstPlayer]: CHOOSE_CARD_FOR_GRAVE_ROBBER,
      },
    });
  }

  sortOrder(): number {
    return 26;
  }
}
