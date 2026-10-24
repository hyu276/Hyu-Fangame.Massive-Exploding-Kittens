import { useState } from 'react';
import { useGame } from '../../../../context/GameContext.tsx';
import { STAGE_PICK_STOLEN_CARD } from '../../../../../common/constants/stages';
import './PickCardToStealOverlay.css';

/** Only hidden card positions are shown: the target hand is never revealed. */
export default function PickCardToStealOverlay() {
  const game = useGame();
  const pending = game.gameState.pendingCardSteal;
  const [selected, setSelected] = useState<number | null>(null);
  const active = !!pending && game.selfPlayerId === pending.attackerId &&
    !!game.selfPlayer?.isInStage(STAGE_PICK_STOLEN_CARD);
  if (!active || !pending) return null;

  const target = game.players.getPlayer(pending.targetPlayerId);
  const stash = game.gameState.towerOfPowerCrownBearer === pending.targetPlayerId
    ? game.gameState.towerOfPowerStash : undefined;
  const cardCount = stash?.length || target?.handSize || 0;
  const name = game.matchData?.find(p => String(p.id) === String(pending.targetPlayerId))?.name ||
    `Người chơi ${pending.targetPlayerId}`;

  return (
    <div className="steal-pick-overlay" role="dialog" aria-modal="true"
      aria-label={`Chọn bài úp từ ${name}`}>
      <div className="steal-pick-panel">
        <h2>CHỌN BÀI ĐỂ CƯỚP</h2>
        <p>Chọn một lá bài úp từ tay <strong>{name}</strong>.
          {pending.cardsToSteal > 1 && ` Còn ${pending.cardsToSteal} lần chọn.`}
        </p>
        <div className="steal-pick-cards">
          {Array.from({ length: cardCount }, (_, index) => (
            <button type="button" className="steal-pick-card" key={index}
              disabled={selected !== null}
              aria-label={`Bốc lá bài úp số ${index + 1}`}
              onClick={() => {
                if (selected !== null || !game.moves.pickCardToSteal) return;
                setSelected(index);
                game.moves.pickCardToSteal(index);
                // Re-enable for a second combo pick on the next render.
                window.setTimeout(() => setSelected(null), 450);
              }}>
              <img src="/assets/cards/back/0.jpg" alt="" draggable={false} />
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
        <p className="steal-pick-hint">Bài của đối thủ được giữ bí mật cho tới khi chuyển sang tay bạn.</p>
      </div>
    </div>
  );
}
