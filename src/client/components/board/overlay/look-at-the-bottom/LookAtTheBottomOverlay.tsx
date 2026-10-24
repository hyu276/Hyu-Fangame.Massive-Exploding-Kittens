import './LookAtTheBottomOverlay.css';
import { useGame } from '../../../../context/GameContext';
import { STAGE_LOOK_AT_THE_BOTTOM, getCardInfo } from '../../../../../common';
import SimulatedCard, { isCardSimulated } from '../../player/card/SimulatedCard';
import { TheGameClient } from '../../../../entities/game-client';

export default function LookAtTheBottomOverlay() {
  const game = useGame();

  const isLooking = game.selfPlayer?.isInStage(STAGE_LOOK_AT_THE_BOTTOM);
  const card = (game.gameState as any).bottomCard;

  if (!isLooking || !card) {
    return null;
  }

  const cardInfo = getCardInfo(card);
  const isSimulated = isCardSimulated(card.name);
  const cardTexture = TheGameClient.getCardTexture(card);

  return (
    <div className="look-at-bottom-overlay">
      <div className="look-at-bottom-content">
        <h2>🔍 Nhìn Đáy Bài (Look at the Bottom)</h2>
        <p>Bạn đang bí mật xem lá bài dưới cùng của Chồng bài rút:</p>

        <div className="look-card-preview">
          {isSimulated ? (
            <SimulatedCard card={card} />
          ) : (
            <img src={cardTexture} alt={cardInfo?.vietnameseName ?? 'Card'} />
          )}
        </div>

        <div className="look-card-info-box">
          <div className="look-card-title">{cardInfo?.vietnameseName ?? card.name}</div>
          <div className="look-card-desc">{cardInfo?.description ?? cardInfo?.shortEffect ?? ''}</div>
        </div>

        <div className="look-actions">
          <button className="btn look-btn-top" onClick={() => game.moveBottomToTop()}>
            ⬆️ Chuyển Lên Trên Cùng (Đỉnh Bộ Bài)
          </button>
          <button className="btn look-btn-keep" onClick={() => game.keepAtBottom()}>
            ⬇️ Giữ Nguyên Ở Đáy Bài
          </button>
        </div>
      </div>
    </div>
  );
}
