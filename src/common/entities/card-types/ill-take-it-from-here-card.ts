import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {NAME_ILL_TAKE_IT_FROM_HERE, NAME_ZOMBIE_KITTEN} from '../../constants/cards';
import {DEFUSE} from '../../registries/card-registry';
import {DEFUSE_EXPLODING_KITTEN} from '../../constants/stages';

export class IllTakeItFromHereCard extends CardType {
  constructor(name: string = NAME_ILL_TAKE_IT_FROM_HERE) {
    super(name);
  }

  isNowCard(): boolean {
    return true;
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return false;

    // Tìm người chơi đang ở trong giai đoạn DEFUSE_EXPLODING_KITTEN
    const activePlayers = game.context.ctx.activePlayers || {};
    const defusingPlayerId = Object.keys(activePlayers).find(
      pId => activePlayers[pId] === DEFUSE_EXPLODING_KITTEN
    ) || (game.turnManager.isInStage(game.players.currentPlayerId, DEFUSE_EXPLODING_KITTEN) ? game.players.currentPlayerId : null);

    // Không thể tự đánh lên chính mình khi bản thân đang defuse
    return !!defusingPlayerId && defusingPlayerId !== actingPlayer.id;
  }

  onPlayed(game: TheGame, _card: Card) {
    const actingPlayer = game.players.actingPlayer;
    if (!actingPlayer) return;

    // Xác định người chơi là nạn nhân đang bị Mèo Nổ / Imploding Kitten
    const activePlayers = game.context.ctx.activePlayers || {};
    const victimId = Object.keys(activePlayers).find(
      pId => activePlayers[pId] === DEFUSE_EXPLODING_KITTEN
    ) || game.players.currentPlayerId;

    const victim = game.players.getPlayer(victimId);
    if (!victim) return;

    // 1. Lá Defuse hoặc Zombie Kitten của nạn nhân vẫn được tiêu thụ
    const zombieCardIdx = victim.findCardIndex(NAME_ZOMBIE_KITTEN);
    const defuseCardIdx = victim.findCardIndex(DEFUSE.name);
    const saveCard = zombieCardIdx !== -1 ? victim.hand[zombieCardIdx] : (defuseCardIdx !== -1 ? victim.hand[defuseCardIdx] : null);
    if (saveCard) {
      saveCard.moveTo(game.piles.discardPile);
    }

    // 2. Ghi nhận ai là nạn nhân để lấy Mèo Nổ từ tay họ nhét vào bộ bài
    game.gameState.defusingVictimId = victimId;

    // 3. Chuyển quyền quyết định vị trí đặt bom sang cho người vừa đánh lá này
    game.turnManager.setActivePlayers({
      value: {
        [actingPlayer.id]: DEFUSE_EXPLODING_KITTEN,
      },
    });
  }

  sortOrder(): number {
    return 32;
  }
}
