import {createPortal} from 'react-dom';
import {useEffect, useState, CSSProperties, RefObject} from 'react';
import './player/card/Card.css';
import {useResponsive} from "../../context/ResponsiveContext.tsx";
import CardInfoBox from './CardInfoBox';
import SimulatedCard, { isCardSimulated } from './player/card/SimulatedCard';

interface HoverCardPreviewProps {
  // Common props
  card?: { name: string; index?: number } | string | null;
  cardImage: string;
  isVisible: boolean;
  
  // Desktop props
  anchorRef?: RefObject<HTMLElement | null>;

  // Mobile props
  isMobile?: boolean;
  canPlay?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}

export default function CardPreview({
  card,
  cardImage, 
  anchorRef, 
  isVisible,
  canPlay = false,
  actionLabel = "Đánh thẻ này",
  onAction,
  onClose
}: HoverCardPreviewProps) {
  const { isMobile } = useResponsive();

  const [showOnLeft, setShowOnLeft] = useState(false);

  const cardName = typeof card === 'string' ? card : card?.name;
  const isSimulated = isCardSimulated(cardName);

  useEffect(() => {
    // Only calculate position for desktop
    if (isVisible && anchorRef?.current && !isMobile) {
      const rect = anchorRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const viewportCenterX = window.innerWidth / 2;
      const viewportWidth = window.innerWidth;

      const previewWidth = Math.min(40 * (viewportWidth / 100), 40 * (window.innerHeight / 100));
      const tableRadius = Math.min(45 * (viewportWidth / 100), 45 * (window.innerHeight / 100));
      const rightEdgeOfTable = viewportCenterX + tableRadius;
      const spaceOnRight = viewportWidth - rightEdgeOfTable;

      const notEnoughSpaceOnRight = spaceOnRight < (previewWidth + 20);
      const isOnRightSide = cardCenterX > viewportCenterX;

      setShowOnLeft(isOnRightSide && notEnoughSpaceOnRight);
    }
  }, [isVisible, anchorRef, isMobile]);

  if (!isVisible) return null;

  // Render Mobile Overlay
  if (isMobile) {
    return createPortal(
      <div 
        className="card-preview-mobile-overlay"
        onClick={(e) => {
         e.stopPropagation();
         if (onClose) onClose();
      }}>
        
        <div 
          onClick={(e) => e.stopPropagation()}
          className="card-preview-mobile-content"
        >
           {/* Card Preview Image or Simulated Card */}
           <div 
             className="card-preview-mobile-image card-preview"
             style={{
               backgroundImage: isSimulated ? 'none' : `url(${cardImage})`,
             }} 
           >
             {isSimulated && card && <SimulatedCard card={card} />}
           </div>

           {/* Card Info Box tiếng Việt */}
           {card && <CardInfoBox card={card} className="mobile-card-info" />}

          <div className="card-preview-mobile-actions">
            {canPlay && onAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction();
                }}
                className="card-preview-action-btn"
              >
                {actionLabel}
              </button>
            )}
            
            <button
               onClick={(e) => {
                 e.stopPropagation();
                 if (onClose) onClose();
               }}
               className="card-preview-cancel-btn"
            >
              {canPlay ? "Hủy" : "Đóng"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Render Desktop Overlay
  return createPortal(
    <div className={`card-preview-overlay ${showOnLeft ? 'show-left' : 'show-right'}`}>
      <div className="card-preview-desktop-wrapper">
        <div
          className="card-preview"
          style={{
            backgroundImage: isSimulated ? 'none' : `url(${cardImage})`,
          } as CSSProperties}
        >
          {isSimulated && card && <SimulatedCard card={card} />}
        </div>
        {card && <CardInfoBox card={card} className="desktop-card-info" />}
      </div>
    </div>,
    document.body
  );
}
