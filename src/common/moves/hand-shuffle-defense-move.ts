import { PlayerID } from "boardgame.io";
import { TheGame } from "../entities/game";
import { STAGE_HAND_SHUFFLE_DEFENSE, STAGE_PICK_STOLEN_CARD } from "../constants/stages";
import { HandShuffleDefense } from '../entities/hand-shuffle-defense';

export function startHandShuffleDefense(
  game: TheGame,
  attackerId: PlayerID,
  targetPlayerId: PlayerID,
  actionType: 'steal' | 'mark' | 'buried_treasure' | 'discard'
) {
  const target = game.players.getPlayer(targetPlayerId);
  if (!target || !target.isAlive || target.handSize <= 1) {
    // Nếu chỉ có 0 hoặc 1 lá, không cần tráo bài, thực thi hành động ngay
    executeActionWithoutDefense(game, attackerId, targetPlayerId, actionType);
    return;
  }

  // Khởi tạo phòng thủ tráo bài tối đa 10 giây
  const startedAtMs = Date.now();
  new HandShuffleDefense(game).begin({
    attackerId,
    targetPlayerId,
    actionType,
    startedAtMs,
    expiresAtMs: startedAtMs + 10000,
  });

  // Đưa người bị nhắm mục tiêu vào stage tráo bài
  game.turnManager.setActivePlayers({
    value: {
      [targetPlayerId]: STAGE_HAND_SHUFFLE_DEFENSE,
    },
  });
}

export function swapHandCards(game: TheGame, fromIndex: number, toIndex: number) {
  const player = game.players.actingPlayer;
  if (!player) return;

  player.swap(fromIndex, toIndex);
}

export function randomShuffleHand(game: TheGame) {
  new HandShuffleDefense(game).shuffle();
}

export function publishHandShuffleSnapshot(game: TheGame) {
  if (game.gameState.handShuffleDefense?.targetPlayerId !== game.players.actingPlayerId) return;
  new HandShuffleDefense(game).publishSnapshot();
}

export function finishHandShuffleDefense(game: TheGame) {
  const defense = game.gameState.handShuffleDefense;
  if (!defense) return;

  const actingPlayerId = game.players.actingPlayer?.id;
  const isDefender = actingPlayerId === defense.targetPlayerId;
  const isExpired = Date.now() >= defense.expiresAtMs;

  // Defender can finish early (skip remaining time), or anyone can finish once expired
  if (!isDefender && !isExpired) {
    return;
  }

  new HandShuffleDefense(game).publishSnapshot();
  // Dọn dẹp trạng thái phòng thủ
  game.gameState.handShuffleDefense = null;

  // Thực thi hành động trên bộ bài đã tráo
  executeActionWithoutDefense(
    game,
    defense.attackerId,
    defense.targetPlayerId,
    defense.actionType
  );
}

function executeActionWithoutDefense(
  game: TheGame,
  attackerId: PlayerID,
  targetPlayerId: PlayerID,
  actionType: 'steal' | 'mark' | 'buried_treasure' | 'discard'
) {
  // Dọn dẹp stage phòng thủ trước để không ghi đè nếu hành động gây ra Defuse
  game.turnManager.endStage();
  game.turnManager.setActivePlayers({ value: {} });

  if (actionType === 'steal') {
    const attacker = game.players.getPlayer(attackerId);
    const target = game.players.getPlayer(targetPlayerId);
    const stash = game.gameState.towerOfPowerCrownBearer === targetPlayerId
      ? game.gameState.towerOfPowerStash : null;
    const available = stash?.length || target?.handSize || 0;
    const count = Math.min(game.gameState.comboMultiplier || 1, available);
    game.gameState.comboMultiplier = 1;
    if (attacker?.isAlive && target?.isAlive && count > 0) {
      // Human and bot attackers both select a hidden index; only bots automate it.
      game.gameState.pendingCardSteal = { attackerId, targetPlayerId, cardsToSteal: count };
      game.turnManager.setActivePlayers({ value: { [attackerId]: STAGE_PICK_STOLEN_CARD } });
    }
  } else if (actionType === 'mark') {
    const target = game.players.getPlayer(targetPlayerId);
    if (target && target.isAlive && target.handSize > 0) {
      const unmarked = target.hand.filter(c => !c.isMarked);
      const pool = unmarked.length > 0 ? unmarked : target.hand;
      const chosenIndex = Math.floor(game.random.Number() * pool.length);
      const chosenCard = pool[chosenIndex];
      if (chosenCard) {
        chosenCard.setMarked(true);
      }
    }
  } else if (actionType === 'buried_treasure') {
    const attacker = game.players.getPlayer(attackerId);
    if (attacker) {
      const opponents = game.players.alivePlayers.filter(
        p => p.id !== attacker.id && p.handSize > 0
      );
      const stolenCards: any[] = [];
      for (const opp of opponents) {
        if (opp.handSize > 0) {
          const randIdx = Math.floor(game.random.Number() * opp.handSize);
          const card = opp.getCardAt(randIdx);
          if (card) stolenCards.push(card);
        }
      }
      if (stolenCards.length > 0) {
        const shuffled = game.random.Shuffle(stolenCards);
        for (const c of shuffled) {
          c.setMarked(false);
          c.moveTo(game.piles.drawPile, { insertIndex: game.piles.drawPile.size });
        }
        for (const opp of opponents) {
          opp.checkExplodingKittenHazard();
        }
      }
    }
  } else if (actionType === 'discard') {
    const target = game.players.getPlayer(targetPlayerId);
    if (target && target.isAlive && target.handSize > 0) {
      const countToDiscard = Math.min(2, target.handSize);
      for (let i = 0; i < countToDiscard; i++) {
        if (target.handSize === 0) break;
        const randIdx = Math.floor(game.random.Number() * target.handSize);
        const card = target.getCardAt(randIdx);
        if (card) {
          card.setMarked(false);
          card.moveTo(game.piles.discardPile);
        }
      }
      target.checkExplodingKittenHazard();
    }
  }
}
