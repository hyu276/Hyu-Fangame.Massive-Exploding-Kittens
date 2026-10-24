import './DigDeeperOverlay.css';
import { useGame } from '../../../../context/GameContext';
import { STAGE_DIG_DEEPER, getCardInfo } from '../../../../../common';
import SimulatedCard, { isCardSimulated } from '../../player/card/SimulatedCard';
import { TheGameClient } from '../../../../entities/game-client';

export default function DigDeeperOverlay() {
  const game = useGame();

  const isDigging = game.selfPlayer?.isInStage(STAGE_DIG_DEEPER);
  const card = (game.gameState as any).digDeeperCard;

  if (!isDigging || !card) {
    return null;
  }

  const cardInfo = getCardInfo(card);
  const isSimulated = isCardSimulated(card.name);
  const cardTexture = TheGameClient.getCardTexture(card);

  return (
    <div className="dig-deeper-overlay">
      <div className="dig-deeper-content">
        <h2>⛏️ Đào Sâu (Dig Deeper)</h2>
        <p>Bạn đang bí mật xem lá bài trên cùng của Chồng bài rút:</p>

        <div className="dig-card-preview">
          {isSimulated ? (
            <SimulatedCard card={card} />
          ) : (
            <img src={cardTexture} alt={cardInfo?.vietnameseName ?? 'Card'} />
          )}
        </div>

        <div className="dig-card-info-box">
          <div className="dig-card-title">{cardInfo?.vietnameseName ?? card.name}</div>
          <div className="dig-card-desc">{cardInfo?.description ?? cardInfo?.shortEffect ?? ''}</div>
        </div>

        <div className="dig-actions">
          <button className="btn dig-btn-take" onClick={() => game.takeTopCard()}>
            ✅ Lấy Lá Bài Này Vào Tay (Kết thúc lượt)
          </button>
          <button className="btn dig-btn-skip" onClick={() => game.takeSecondCard()}>
            🔄 Trả Lại & Bắt Buộc Rút Lá Thứ 2
          </button>
        </div>
      </div>
    </div>
  );
}
