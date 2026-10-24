import './Card.css';
import {CSSProperties, useRef, useState} from 'react';
import CardPreview from '../../CardPreview.tsx';
import {useResponsive} from "../../../../context/ResponsiveContext.tsx";
import {useGame} from "../../../../context/GameContext.tsx";
import {Player} from '../../../../../common';
import {CardWithServerIndex} from "../player-cards/PlayerCards.tsx";
import {TheGameClient} from "../../../../entities/game-client.ts";

import SimulatedCard, { isCardSimulated } from './SimulatedCard';
import { useCardSelection } from '../../../../context/CardSelectionContext';

interface CardProps {
  owner: Player,
  card: CardWithServerIndex | null;
  index: number;
  angle: number;
  offsetX: number;
  offsetY: number;
}

export default function Card({
                               owner,
                               card,
                               index,
                               angle,
                               offsetX,
                               offsetY,
                             }: CardProps) {

  const game = useGame();
  const { isMobile } = useResponsive();
  const { selectedCard, selectCard, clearSelection } = useCardSelection();

  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isSelf = game.isSelf(owner);
  const isSelectedInHand = isSelf && card && selectedCard?.serverIndex === card.serverIndex;

  const isBlinded = owner.isBlinded && !game.gameRules?.openCards;
  const isMarked = card?.isMarked;
  const isLocked = card?.isLocked;
  const isSimulated = !isBlinded && card && isCardSimulated(card.name);
  const cardImage = isBlinded ? '/assets/cards/back/0.jpg' : TheGameClient.getCardTexture(card);

  const isGivingCard = game.canGiveCard() || game.canGiveGarbageCard() || game.canGivePotluckCard() || game.canGiveCardToFeedDead() || game.canGiveCardForGraveRobber();
  const couldBePlayed = isSelf && (isGivingCard || (!isLocked && card && game.canPlayCard(card.serverIndex)));

  const getActionLabel = () => {
    if (game.canGiveCard()) return "Giao nộp lá này (Favor)";
    if (game.canGiveGarbageCard()) return "Bỏ lá này vào bộ bài (Garbage)";
    if (game.canGivePotluckCard()) return "Đặt úp lên đỉnh bộ bài (Potluck)";
    if (game.canGiveCardToFeedDead()) return "Dâng nộp cho Người Chết (Feed the Dead)";
    if (game.canGiveCardForGraveRobber()) return "Nộp lại vào bộ bài (Grave Robber)";
    if (isLocked) return "🔒 Lá bài bị khóa (Annoy)";
    if (isBlinded) return "Đánh mù lá này (Cat Butt)";
    if (card && card.type?.isNowCard?.() && !game.isSelfCurrentPlayer) {
      return "⚡ Đánh ngay lập tức (NOW)";
    }
    return "Đánh lá này";
  };

  const handleAction = () => {
    if (!card) {
      return;
    }
    clearSelection();
    game.selectCard(card.serverIndex);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelf && card) {
      if (isMobile && isSelectedInHand) {
        // Tap a second time on the already-selected card opens the detailed card modal
        setIsSelected(true);
      } else {
        // First tap: select the card in hand
        selectCard(card);
      }
    } else if (isMobile) {
      setIsSelected(true);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelf && couldBePlayed) {
      handleAction();
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`card ${isHovered ? 'hovered' : ''} ${isSelectedInHand ? 'is-selected-hand' : ''} ${isLocked ? 'is-locked' : ''} ${couldBePlayed ? 'can-play' : ''}`}
        style={{
          backgroundImage: isSimulated ? 'none' : `url(${cardImage})`,
          position: 'absolute',
          '--base-transform': `translate(${offsetX}%, ${offsetY}%) rotate(${angle}deg)`,
          transformOrigin: 'center 200%',
          zIndex: isSelectedInHand ? 50 : (owner.handSize - index),
        } as CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {isSelectedInHand && (
          <>
            <div className="selected-card-tag-hand">✓ Đã chọn</div>
            {isMobile && (
              <div
                className="selected-card-inspect-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSelected(true);
                }}
                title="Xem chi tiết"
              >
                🔍
              </div>
            )}
          </>
        )}
        {isSimulated && <SimulatedCard card={card} />}
        {isMarked && <div className="marked-card-badge">👁️ Đã đánh dấu</div>}
        {isLocked && <div className="locked-card-badge">🔒 Đã khóa</div>}
        {isBlinded && <div className="blinded-card-badge">🙈</div>}
      </div>
      <CardPreview
        card={isBlinded ? null : card}
        cardImage={cardImage} 
        anchorRef={cardRef} 
        isVisible={(isMobile ? isSelected : isHovered) && (!!card || isBlinded)}
        actionLabel={getActionLabel()}
        canPlay={!!couldBePlayed}
        onAction={() => {
          setIsSelected(false);
          handleAction();
        }}
        onClose={() => setIsSelected(false)}
      />
    </>
  );
}
