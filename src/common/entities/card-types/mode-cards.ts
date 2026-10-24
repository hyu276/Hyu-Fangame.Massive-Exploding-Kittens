import { CardType } from '../card-type';
import { TheGame } from '../game';
import { Card } from '../card';
import { DEFUSE_EXPLODING_KITTEN } from '../../constants/stages';

/**
 * Armageddon Card (Good vs Evil)
 * Kích hoạt đấu tay đôi Godcat vs Devilcat giữa người đánh và mục tiêu.
 */
export class ArmageddonCard extends CardType {
  canBePlayed(game: TheGame): boolean {
    const gve = game.gameState.goodVsEvil;
    return !!gve
      && gve.godcatInPlaymat
      && gve.devilcatInPlaymat
      && gve.godcatHolderId === null;
  }

  onPlayed(game: TheGame, _card: Card, targetPlayerId?: string) {
    const gve = game.gameState.goodVsEvil;
    const attacker = game.players.currentPlayer;
    if (!attacker) return;

    const targets = game.players.alivePlayers.filter(p => p.id !== attacker.id);
    const target = (targetPlayerId ? game.players.getPlayer(targetPlayerId) : null) || targets[0];

    if (gve && target) {
      // 50/50 kết quả chọn bí mật giữa Godcat và Devilcat
      const attackerWins = game.random.Number() > 0.5;
      const winner = attackerWins ? attacker : target;
      const loser = attackerWins ? target : attacker;

      // Người thắng nhận Godcat
      gve.godcatInPlaymat = false;
      gve.godcatHolderId = winner.id;

      // Người thua nhận Devilcat: phải gỡ bom hoặc nổ
      gve.devilcatInPlaymat = true;
      const defuseIdx = loser.findCardIndex('defuse') !== -1 ? loser.findCardIndex('defuse') : loser.findCardIndex('zombie_kitten');
      if (defuseIdx !== -1) {
        const defuseCard = loser.removeCardAt(defuseIdx);
        if (defuseCard) {
          game.piles.discardPile.addCard(defuseCard);
        }
      } else {
        loser.eliminate();
      }
    }

    game.turnManager.endTurn();
  }

  sortOrder(): number {
    return 10;
  }
}

/**
 * Godcat Card (Good vs Evil)
 * Thần bài vạn năng. Khi đánh xong sẽ trở về playmat thay vì vào cọc bỏ.
 */
export class GodcatCard extends CardType {
  onPlayed(game: TheGame, _card: Card) {
    if (game.gameState.goodVsEvil) {
      game.gameState.goodVsEvil.godcatInPlaymat = true;
      game.gameState.goodVsEvil.godcatHolderId = null;
    }
    // Mặc định hoạt động như Skip nếu không chọn giả lá khác
    game.turnManager.endTurn();
  }

  sortOrder(): number {
    return 1;
  }
}

/**
 * Devilcat Card (Good vs Evil)
 * Lá ma quỷ gây nổ trong Armageddon, luôn trả về playmat.
 */
export class DevilcatCard extends CardType {
  canBePlayed(): boolean {
    return false;
  }

  onPlayed(game: TheGame, _card: Card) {
    if (game.gameState.goodVsEvil) {
      game.gameState.goodVsEvil.devilcatInPlaymat = true;
    }
  }

  sortOrder(): number {
    return 0;
  }
}

/**
 * Reveal the Future 3x Card (Good vs Evil)
 * Công khai 3 lá đầu cọc rút cho tất cả mọi người cùng xem mà không đổi thứ tự.
 */
export class RevealTheFuture3xCard extends CardType {
  onPlayed(game: TheGame, _card: Card) {
    const top3 = game.piles.drawPile.cards.slice(0, 3);
    top3.forEach(c => {
      game.animationsQueue.enqueue(c, game.piles.drawPile, game.piles.drawPile, { visibleTo: [] });
    });
  }

  sortOrder(): number {
    return 4;
  }
}

/**
 * Booby Trap Kitten Card (Rage Mode)
 * Rút từ cọc thì an toàn trên tay. Nếu bị người khác cướp, người cướp phải Defuse hoặc nổ.
 */
export class BoobyTrapKittenCard extends CardType {
  canBePlayed(): boolean {
    return false;
  }

  onPlayed(_game: TheGame, _card: Card) {
    // Không đánh trực tiếp như bài thường
  }

  sortOrder(): number {
    return 0;
  }
}

/**
 * Shared Suffering Card (Rage Mode)
 * Bắt đầu từ bên trái, mỗi người chọn rút 1 lá hoặc bỏ 1 lá trên tay. Kết thúc lượt.
 */
export class SharedSufferingCard extends CardType {
  onPlayed(game: TheGame, _card: Card) {
    const alive = game.players.alivePlayers;
    for (const player of alive) {
      if (player.handSize > 2) {
        // Ưu tiên bỏ 1 lá không phải defuse
        const nonDefuseIdx = player.rawCards.findIndex(c => c.name !== 'defuse' && c.name !== 'zombie_kitten');
        if (nonDefuseIdx !== -1) {
          const removed = player.removeCardAt(nonDefuseIdx);
          if (removed) {
            game.piles.discardPile.addCard(removed);
            continue;
          }
        }
      }
      // Rút 1 lá
      const drawn = game.piles.drawPile.drawCard();
      if (drawn) {
        player.addCard(drawn);
        if (drawn.name === 'exploding_kitten') {
          const defuseIdx = player.findCardIndex('defuse') !== -1 ? player.findCardIndex('defuse') : player.findCardIndex('zombie_kitten');
          if (defuseIdx !== -1) {
            const defuse = player.removeCardAt(defuseIdx);
            if (defuse) {
              game.piles.discardPile.addCard(defuse);
              game.piles.drawPile.addCard(drawn);
              game.piles.drawPile.shuffle();
            }
          } else {
            player.eliminate();
          }
        }
      }
    }
    game.turnManager.endTurn();
  }

  sortOrder(): number {
    return 6;
  }
}

/**
 * Reveal & Steal Card (Rage Mode)
 * Đối thủ chọn 2 lá cho xem, người đánh lấy 1 lá.
 */
export class RevealAndStealCard extends CardType {
  onPlayed(game: TheGame, _card: Card, targetPlayerId?: string) {
    const actor = game.players.currentPlayer;
    if (!actor) return;
    const target = targetPlayerId ? game.players.getPlayer(targetPlayerId) : game.players.alivePlayers.find(p => p.id !== actor.id);
    if (target && target.handSize > 0) {
      const stolenIndex = Math.floor(game.random.Number() * target.handSize);
      const stolen = target.removeCardAt(stolenIndex);
      if (stolen) {
        actor.addCard(stolen);
        actor.resolveStolenCardHazard(stolen);
      }
    }
  }

  sortOrder(): number {
    return 5;
  }
}

/**
 * Bad Decision Card (Rage Mode)
 * Đối thủ phải chịu mất 1 lá ngẫu nhiên hoặc bỏ 2 lá.
 */
export class BadDecisionCard extends CardType {
  onPlayed(game: TheGame, _card: Card, targetPlayerId?: string) {
    const actor = game.players.currentPlayer;
    if (!actor) return;
    const target = targetPlayerId ? game.players.getPlayer(targetPlayerId) : game.players.alivePlayers.find(p => p.id !== actor.id);
    if (target && target.handSize > 0) {
      const stolenIndex = Math.floor(game.random.Number() * target.handSize);
      const stolen = target.removeCardAt(stolenIndex);
      if (stolen) {
        actor.addCard(stolen);
        actor.resolveStolenCardHazard(stolen);
      }
    }
  }

  sortOrder(): number {
    return 5;
  }
}

/**
 * Peek Card (Curse You!)
 * Xem lá đầu cọc rút, chọn đặt lại lên đỉnh hoặc đáy.
 */
export class PeekCard extends CardType {
  onPlayed(game: TheGame, _card: Card) {
    // Xem riêng lá đầu
    const top = game.piles.drawPile.topCard;
    if (top) {
      // Nếu là bom thì chuyển xuống đáy
      if (top.name === 'exploding_kitten') {
        const drawn = game.piles.drawPile.drawCard();
        if (drawn) game.piles.drawPile.addCard(drawn);
      }
    }
  }

  sortOrder(): number {
    return 3;
  }
}

/**
 * Charm Card (Curse You!)
 * Bùa lợi đặt thường trực trước mặt người chơi.
 */
export class CharmCard extends CardType {
  onPlayed(game: TheGame, card: Card, targetPlayerId?: string) {
    const player = targetPlayerId ? game.players.getPlayer(targetPlayerId) : game.players.currentPlayer;
    if (player && game.gameState.curseYou) {
      const current = game.gameState.curseYou.charms[player.id] || [];
      current.push(card.name);
      game.gameState.curseYou.charms[player.id] = current;
    }
  }

  sortOrder(): number {
    return 8;
  }
}

/**
 * Curse Card (Curse You!)
 * Lời nguyền đặt thường trực trước mặt đối thủ.
 */
export class CurseCard extends CardType {
  onPlayed(game: TheGame, card: Card, targetPlayerId?: string) {
    const actor = game.players.currentPlayer;
    const targets = game.players.alivePlayers.filter(p => p.id !== actor?.id);
    const target = targetPlayerId ? game.players.getPlayer(targetPlayerId) : targets[0];
    if (target && game.gameState.curseYou) {
      const current = game.gameState.curseYou.curses[target.id] || [];
      current.push(card.name);
      game.gameState.curseYou.curses[target.id] = current;
    }
  }

  sortOrder(): number {
    return 8;
  }
}

/**
 * 10th Anniversary Bonus Card
 */
export class AnniversaryBonusCard extends CardType {
  onPlayed(game: TheGame, card: Card, targetPlayerId?: string) {
    const actor = game.players.currentPlayer;
    if (!actor) return;

    if (card.name === 'plus_plus') {
      if (game.gameState.anniversary) {
        game.gameState.anniversary.plusPlusActive = true;
      }
    } else if (card.name === 'amateur_archeology' || card.name === 'hip_cat') {
      const retrieved = game.piles.discardPile.drawCard();
      if (retrieved) actor.addCard(retrieved);
    } else if (card.name === 'battle_hamster') {
      const target = targetPlayerId ? game.players.getPlayer(targetPlayerId) : game.players.alivePlayers.find(p => p.id !== actor.id);
      if (target && target.handSize > 1) {
        while (target.handSize > 1) {
          const removed = target.removeCardAt(target.handSize - 1);
          if (removed) game.piles.discardPile.addCard(removed);
        }
      }
    } else if (card.name === 'robin_hood') {
      // Phân phối lại 1 lá từ người nhiều bài nhất cho người ít bài nhất
      const alive = [...game.players.alivePlayers].sort((a, b) => b.handSize - a.handSize);
      if (alive.length >= 2 && alive[0].handSize > alive[alive.length - 1].handSize + 1) {
        const rich = alive[0];
        const poor = alive[alive.length - 1];
        const cardToGive = rich.removeCardAt(rich.handSize - 1);
        if (cardToGive) poor.addCard(cardToGive);
      }
    }
  }

  sortOrder(): number {
    return 7;
  }
}

/**
 * Exploding Minion Card (Exploding Minions)
 */
export class ExplodingMinionCard extends CardType {
  canBePlayed(): boolean {
    return false;
  }

  onDrawn(game: TheGame, _card: Card) {
    const player = game.players.actingPlayer;
    if (player.hasCard('minion_defuse') || player.hasCard('defuse')) {
      game.turnManager.setStage(DEFUSE_EXPLODING_KITTEN);
    } else {
      player.eliminate();
    }
  }

  sortOrder(): number {
    return 0;
  }
}

/**
 * Minion Defuse Card (Exploding Minions)
 */
export class MinionDefuseCard extends CardType {
  canBePlayed(): boolean {
    return false;
  }

  onPlayed(_game: TheGame, _card: Card) {
    // Hoạt động như Defuse tiêu chuẩn
  }

  sortOrder(): number {
    return 1;
  }
}
