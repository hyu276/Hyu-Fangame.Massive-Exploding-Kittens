import { useEffect, useState, useRef } from 'react';
import { Pile } from './Pile';
import back from '/assets/cards/back/0.jpg';
import { useGame } from '../../../../context/GameContext';
import { useAnimationNode } from '../../../../context/AnimationContext';
import { DRAW } from '../../../../../common';
import { NAME_SHUFFLE } from '../../../../../common';
import SimulatedCard, { isCardSimulated } from '../../player/card/SimulatedCard';
import { TheGameClient } from '../../../../entities/game-client';

export function DrawPile() {
  const game = useGame();
  const drawPileAnimRef = useAnimationNode(DRAW);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [lastDrawPileSize, setLastDrawPileSize] = useState(game.piles.drawPile.size);
  const [lastDiscardPileSize, setLastDiscardPileSize] = useState(game.piles.discardPile.size);
  const [isHoveringDrawPile, setIsHoveringDrawPile] = useState(false);
  const pendingCardRef = useRef(game.piles.pendingCard);

  // Detect when a card is drawn
  useEffect(() => {
    if (game.piles.drawPile.size < lastDrawPileSize) {
      setIsDrawing(true);
      setTimeout(() => setIsDrawing(false), 400);
    }
    setLastDrawPileSize(game.piles.drawPile.size);
  }, [game.piles.drawPile.size, lastDrawPileSize]);

  // Handle shuffling animation detection
  useEffect(() => {
    // If there is an active pending play, do not trigger shuffle yet
    if (game.piles.pendingCard) {
      pendingCardRef.current = game.piles.pendingCard;
      return;
    }

    const wasPending = pendingCardRef.current;
    pendingCardRef.current = null;

    const discardChanged = game.piles.discardPile.size > lastDiscardPileSize;
    
    // Check if we just finished a pending play that was a Shuffle and NOT noped
    const resolvedShuffle = wasPending && 
                            !wasPending.isNoped && 
                            wasPending.card.name === NAME_SHUFFLE;

    const lastCard = game.piles.discardPile.topCard;

    // Trigger if newly placed shuffle
    if ((discardChanged || resolvedShuffle) && lastCard?.name === NAME_SHUFFLE) {
      // Double check it wasn't noped if it came from pending
      if (!(wasPending && wasPending.isNoped)) {
        setIsShuffling(true);
        setTimeout(() => setIsShuffling(false), 800);
      }
    }

    if (!game.piles.pendingCard) {
      setLastDiscardPileSize(game.piles.discardPile.size);
    }
  }, [game.piles.discardPile.size, lastDiscardPileSize, game.piles.discardPile, game.piles.pendingCard]);

  const handleDrawClick = () => {
    // wait for previous draw animation to finish before allowing another draw
    if (!isDrawing) {
      game.playDrawCard();
    }
  };

  const topFaceUpCard = (game.gameState as any).topDrawCard;
  const isTopFaceUp = !!topFaceUpCard?.isFaceUp;
  const isSimulated = topFaceUpCard && isCardSimulated(topFaceUpCard.name);
  const topCardTexture = topFaceUpCard ? TheGameClient.getCardTexture(topFaceUpCard) : back;
  const displayImage = isTopFaceUp && !isSimulated ? topCardTexture : (isTopFaceUp ? undefined : back);

  return (
    <Pile
      ref={drawPileAnimRef}
      className={`draw-pile ${isDrawing ? 'drawing' : ''} ${isShuffling ? 'shuffling' : ''} ${isTopFaceUp ? 'face-up-card' : ''}`}
      image={displayImage}
      onClick={handleDrawClick}
      onMouseEnter={() => setIsHoveringDrawPile(true)}
      onMouseLeave={() => setIsHoveringDrawPile(false)}
    >
      {isTopFaceUp && isSimulated && (
        <SimulatedCard card={topFaceUpCard} />
      )}
      {isTopFaceUp && (
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          right: '4px',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#38bdf8',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '0.65rem',
          fontWeight: 700,
          textAlign: 'center',
          border: '1px solid #38bdf8',
          zIndex: 5,
          pointerEvents: 'none'
        }}>
          👁️ Lộ Mặt
        </div>
      )}
      {isHoveringDrawPile && game.piles.drawPile.size > 0 && (
        <div className="card-counter">
          {game.piles.drawPile.size}
        </div>
      )}
    </Pile>
  );
}

