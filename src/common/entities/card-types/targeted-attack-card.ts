import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';
import {CHOOSE_PLAYER_FOR_TARGETED_ATTACK} from "../../constants/stages";
import {targetedAttack} from "../../moves/targeted-attack-move";
import type {ICard} from "../../models";

export class TargetedAttackCard extends CardType {
  constructor(name: string = 'targeted_attack') {
    super(name);
  }

  createCard(index: number, game: TheGame): ICard {
    const card = super.createCard(index, game);
    if (game) {
      const g = game as any;
      if (!g._targetedAttackBag || g._targetedAttackBag.length === 0) {
        // Khởi tạo túi bài ngẫu nhiên [0, 1, 2] đảm bảo cả 3 ảnh đều có cơ hội xuất hiện
        const bag = [0, 1, 2];
        for (let i = bag.length - 1; i > 0; i--) {
          const rand = game.random ? game.random.Number() : Math.random();
          const j = Math.floor(rand * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        g._targetedAttackBag = bag;
      }
      card.index = g._targetedAttackBag.pop()!;
    } else {
      card.index = Math.floor(Math.random() * 3);
    }
    return card;
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.players.getValidCardActionTargets(game.players.actingPlayer).length > 0;
  }

  onPlayed(game: TheGame, _card: Card) {
    const candidates = game.players.getValidCardActionTargets(game.players.actingPlayer);

    if (candidates.length === 1) {
      // Tự động chọn nếu chỉ còn 1 đối thủ
      targetedAttack(game, candidates[0].id);
    } else if (candidates.length > 1) {
      // Chuyển sang stage chọn người để tấn công
      game.turnManager.setStage(CHOOSE_PLAYER_FOR_TARGETED_ATTACK);
    }
  }

  sortOrder(): number {
    return 10;
  }
}
