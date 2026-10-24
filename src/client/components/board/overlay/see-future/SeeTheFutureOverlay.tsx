import { useState } from 'react';
import './SeeTheFutureOverlay.css';
import {useGame} from "../../../../context/GameContext.tsx";
import {VIEWING_FUTURE, VIEWING_FUTURE_5X, VIEWING_FUTURE_1X} from '../../../../../common';
import {Card} from '../../../../../common';
import {TheGameClient} from "../../../../entities/game-client.ts";
import CardInfoBox from '../../CardInfoBox.tsx';
import SimulatedCard, {isCardSimulated} from '../../player/card/SimulatedCard.tsx';

export default function SeeTheFutureOverlay() {
  const game = useGame();
  const [selectedCardIdx, setSelectedCardIdx] = useState<number>(0);

  const isViewing1x = game.selfPlayer?.isInStage(VIEWING_FUTURE_1X);
  const isViewing3x = game.selfPlayer?.isInStage(VIEWING_FUTURE);
  const isViewing5x = game.selfPlayer?.isInStage(VIEWING_FUTURE_5X);

  if (!isViewing1x && !isViewing3x && !isViewing5x) {
    return null;
  }

  // Get the top cards from the draw pile that are visible
  const cards: Card[] = game.piles.drawPile.allCards || [];

  const handleFutureClose = () => {
    if (game.closeFutureView) {
      game.closeFutureView();
    } else if (game.moves.closeFutureView) {
      game.moves.closeFutureView();
    }
  };

  const combo = game.gameState.comboMultiplier || 1;
  const getTitle = () => {
    const comboSuffix = combo > 1 ? ` - ⚡ Liên Hoàn x${combo}` : '';
    return `🔮 Nhìn Trước Tương Lai (${cards.length} lá${comboSuffix})`;
  };

  if (cards.length === 0) {
    return (
      <div className="see-future-overlay" onClick={handleFutureClose}>
        <div className="see-future-content" onClick={(e) => e.stopPropagation()}>
          <h2 className="see-future-title">{getTitle()}</h2>
          <div className="see-future-description">Chồng bài rút hiện không còn lá bài nào!</div>
          <button className="see-future-close-btn" onClick={handleFutureClose}>
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const selectedCard = cards[selectedCardIdx] || cards[0];

  return (
    <div className="see-future-overlay" onClick={handleFutureClose}>
      <div className="see-future-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="see-future-title">
          {getTitle()}
        </h2>
        <div className="see-future-description">
          Đây là {cards.length} lá bài trên đỉnh bộ bài (từ trái qua phải sẽ được rút trước). Nhấn vào lá bài để xem chú thích hiệu ứng:
        </div>
        <div className="see-future-cards">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`see-future-card-wrapper ${selectedCardIdx === index ? 'active-card' : ''}`}
              onClick={() => setSelectedCardIdx(index)}
              style={{ cursor: 'pointer' }}
            >
              <div className="see-future-card-position">
                {index === 0 ? '#1 (Rút đầu tiên)' : `#${index + 1}`}
              </div>
              {isCardSimulated(card?.name) ? (
                <div className="see-future-card simulated">
                  <SimulatedCard card={card} style={{ width: '100%', height: '100%' }} />
                </div>
              ) : (
                <div
                  className="see-future-card"
                  style={{
                    backgroundImage: `url(${TheGameClient.getCardTexture(card)})`,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {selectedCard && (
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
            <CardInfoBox card={selectedCard} />
          </div>
        )}

        <button className="see-future-close-btn" onClick={handleFutureClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}
