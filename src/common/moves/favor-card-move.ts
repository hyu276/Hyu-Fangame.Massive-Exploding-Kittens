import {TheGame} from "../entities/game";
import {PlayerID} from "boardgame.io";
import {CHOOSE_CARD_TO_GIVE} from "../constants/stages";
import {Card} from "../entities/card";

/**
 * Request a card from a target player (favor card - first stage)
 */
export const requestCard = (game: TheGame, targetPlayerId: PlayerID) => {
  // Validate target player
  game.players.validateTarget(targetPlayerId);

  // 1. Kiểm tra nếu đối phương đang đội Vương miện Tower of Power và còn kho bài dự trữ
  if (
    targetPlayerId === game.gameState.towerOfPowerCrownBearer &&
    game.gameState.towerOfPowerStash &&
    game.gameState.towerOfPowerStash.length > 0
  ) {
    const stash = game.gameState.towerOfPowerStash;
    const index = Math.floor(game.random.Number() * stash.length);
    const rawCard = stash.splice(index, 1)[0];
    const requestingPlayer = game.players.currentPlayer;
    const card = new Card(game, rawCard);
    requestingPlayer.addCard(card);

    if (stash.length === 0) {
      game.gameState.towerOfPowerCrownBearer = null;
    }
    game.turnManager.endStage();
    requestingPlayer.checkExplodingKittenHazard();
    return;
  }

  // End current player's stage and set the target player to choose a card to give
  game.turnManager.endStage();
  game.turnManager.setActivePlayers({
    value: {
      [targetPlayerId]: CHOOSE_CARD_TO_GIVE,
    },
  });
};

/**
 * Give a card to the requesting player (favor card - second stage)
 */
export const giveCard = (game: TheGame, cardIndex: number) => {
  const {ctx} = game.context;

  // Find who is giving the card (the player in the chooseCardToGive stage)
  const givingPlayerId = Object.keys(ctx.activePlayers || {}).find(
    playerId => ctx.activePlayers?.[playerId] === CHOOSE_CARD_TO_GIVE
  );

  if (!givingPlayerId) {
    throw Error('No player is in the card giving stage');
  }

  const givingPlayer = game.players.getPlayer(givingPlayerId);
  const requestingPlayer = game.players.currentPlayer;

  // Kết thúc stage cho nhận bài trước để không ghi đè Defuse nếu nhận phải bom
  game.turnManager.endStage();

  // Transfer the card from giving player to requesting player
  givingPlayer.giveCard(cardIndex, requestingPlayer);

  const favorCountRemaining = (game.gameState.favorCountRemaining || 1) - 1;
  game.gameState.favorCountRemaining = favorCountRemaining;

  if (favorCountRemaining > 0 && givingPlayer.handSize > 0) {
    // Vẫn còn lượt xin xỏ liên hoàn (x2 hoặc x3) và đối thủ vẫn còn bài trên tay
    game.turnManager.setActivePlayers({
      value: {
        [givingPlayerId]: CHOOSE_CARD_TO_GIVE,
      },
    });
  } else {
    game.gameState.favorCountRemaining = 0;
    game.gameState.comboMultiplier = 1;
  }
};
