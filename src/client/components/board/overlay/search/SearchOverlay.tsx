import { useState } from 'react';
import './SearchOverlay.css';
import { useGame } from '../../../../context/GameContext';
import { SEARCHING_DECK, getCardInfo } from '../../../../../common';
import SimulatedCard, { isCardSimulated } from '../../player/card/SimulatedCard';
import { TheGameClient } from '../../../../entities/game-client';

export default function SearchOverlay() {
  const game = useGame();
  const isSearching = game.selfPlayer?.isInStage(SEARCHING_DECK);

  const rawCards = (game.gameState as any).searchTopCards || game.piles.drawPile.allCards?.slice(0, 5) || [];
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!isSearching) {
    return null;
  }

  if (rawCards.length === 0) {
    return (
      <div className="search-overlay">
        <div className="search-content">
          <h2 className="search-title">🔍 Tìm Kiếm (Search)</h2>
          <p className="search-description">Không còn lá bài nào trong cọc bài rút.</p>
          <button className="btn btn-pick-direct" onClick={() => game.moves.pickSearchCard ? game.moves.pickSearchCard(0) : game.closeFutureView()}>
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const selectedCard = selectedIdx !== null ? rawCards[selectedIdx] : null;
  const selectedCardInfo = selectedCard ? getCardInfo(selectedCard) : null;

  const handlePick = (index: number) => {
    game.pickSearchCard(index);
  };

  return (
    <div className="search-overlay">
      <div className="search-content">
        <h2 className="search-title">🔍 Tìm Kiếm (Search)</h2>
        <p className="search-description">
          Bạn đang xem 5 lá trên cùng của Chồng bài rút. Hãy chọn 1 lá để nhận về tay (các lá còn lại sẽ được xáo trộn trở lại bộ bài):
        </p>

        <div className="search-cards-list">
          {rawCards.map((card: any, index: number) => {
            const cardInfo = getCardInfo(card);
            const isSimulated = isCardSimulated(card?.name);
            const cardTexture = TheGameClient.getCardTexture(card);
            const isSelected = selectedIdx === index;

            return (
              <div
                key={card.id || index}
                className={`search-card-wrapper ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedIdx(index)}
              >
                <div className="search-card-slot">Lá #{index + 1}</div>
                <div className="search-card-item">
                  {isSimulated ? (
                    <SimulatedCard card={card} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <img src={cardTexture} alt={cardInfo?.vietnameseName ?? 'Card'} />
                  )}
                </div>
                <div className="search-card-name">
                  {cardInfo?.vietnameseName ?? card.name}
                </div>
                <button
                  className="btn btn-pick-direct"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePick(index);
                  }}
                >
                  Chọn Lá Này
                </button>
              </div>
            );
          })}
        </div>

        {selectedCard && (
          <div className="search-card-detail">
            <div className="search-card-detail-title">
              {selectedCardInfo?.vietnameseName ?? selectedCard.name}
            </div>
            <div className="search-card-detail-desc">
              {selectedCardInfo?.description || selectedCardInfo?.shortEffect || ''}
            </div>
            <button
              className="btn btn-confirm-pick"
              onClick={() => selectedIdx !== null && handlePick(selectedIdx)}
            >
              ✅ Xác Nhận Lấy Lá Này Về Tay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
