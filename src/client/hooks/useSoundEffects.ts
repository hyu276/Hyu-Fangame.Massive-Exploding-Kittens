import { useEffect, useRef } from 'react';
import { soundService } from '../services/audio';
import { NAME_NOPE, DEFUSE_EXPLODING_KITTEN } from '../../common';
import type { TheGameClient } from '../entities/game-client';

export function useSoundEffects(game: TheGameClient) {

  const prevTurn = useRef(game.isSelfCurrentPlayer);
  const prevPending = useRef(game.piles.pendingCard);
  const prevDrawPileSize = useRef(game.piles.drawPile.size);
  const prevDeadCount = useRef(game.gameState.deadPlayers?.length || 0);
  const prevInDefuse = useRef(game.selfPlayer?.isInStage(DEFUSE_EXPLODING_KITTEN));
  const prevWinner = useRef(game.players.winner);
  const titleIntervalRef = useRef<number | null>(null);
  const resetTitle = useRef<(() => void) | null>(null);
  useEffect(() => () => resetTitle.current?.(), []);

  // 1. Alert when it becomes player's turn
  useEffect(() => {
    if (game.isSelfCurrentPlayer && !prevTurn.current && game.isPlayingPhase() && game.isSelfAlive) {
      soundService.playTurnAlert();

      // Flash title if player is on another tab
      if (document.hidden) {
        resetTitle.current?.();
        let isAlt = false;
        const originalTitle = document.title;
        if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);

        titleIntervalRef.current = window.setInterval(() => {
          document.title = isAlt ? '🔔 (TỚI LƯỢT BẠN!) Mèo Nổ' : '⚡ Nhanh lên nào! - Mèo Nổ';
          isAlt = !isAlt;
        }, 1000);

        const onFocus = () => {
          if (titleIntervalRef.current) clearInterval(titleIntervalRef.current);
          titleIntervalRef.current = null;
          document.title = originalTitle;
          window.removeEventListener('focus', onFocus);
          resetTitle.current = null;
        };
        resetTitle.current = onFocus;
        window.addEventListener('focus', onFocus);
      }
    }
    prevTurn.current = game.isSelfCurrentPlayer;
  }, [game.isSelfCurrentPlayer, game]);

  // 2. Play sound when cards are played
  useEffect(() => {
    const currentPending = game.piles.pendingCard;
    if (currentPending) {
      if (currentPending.card.name === NAME_NOPE || currentPending.nopeCount > (prevPending.current?.nopeCount ?? 0)) {
        soundService.playNope();
      } else if (currentPending.card.id !== prevPending.current?.card.id) {
        soundService.playCardPlay();
      }
    }
    prevPending.current = currentPending;
  }, [game]);

  // 3. Play sound when a card is drawn
  useEffect(() => {
    const currentSize = game.piles.drawPile.size;
    if (currentSize < prevDrawPileSize.current && game.isPlayingPhase()) {
      soundService.playCardDraw();
    }
    prevDrawPileSize.current = currentSize;
  }, [game.piles.drawPile.size, game]);

  // 4. Play explosion sound when a player dies
  useEffect(() => {
    const deadCount = game.gameState.deadPlayers?.length || 0;
    if (deadCount > prevDeadCount.current) {
      soundService.playExplosion();
    }
    prevDeadCount.current = deadCount;
  }, [game]);

  // 5. Play fuse sound when entering defuse stage
  useEffect(() => {
    const inDefuse = game.selfPlayer?.isInStage(DEFUSE_EXPLODING_KITTEN);
    if (inDefuse && !prevInDefuse.current) {
      soundService.playFuse();
    }
    prevInDefuse.current = inDefuse;
  }, [game]);

  // 6. Play victory or defeat fanfare
  useEffect(() => {
    const currentWinner = game.players.winner;
    if (currentWinner && !prevWinner.current) {
      if (game.selfPlayer && String(game.selfPlayer.id) === String(currentWinner.id)) {
        soundService.playVictory();
      } else {
        soundService.playDefeat();
      }
    }
    prevWinner.current = currentWinner;
  }, [game]);
}
