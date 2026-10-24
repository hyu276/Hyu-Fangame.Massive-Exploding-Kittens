import { getGameModeDefinition } from '../../../common/constants/game-modes';

export function SelectedGameMode({ gameMode, onBack, disabled = false }: {
  gameMode: number; onBack: () => void; disabled?: boolean;
}) {
  const mode = getGameModeDefinition(gameMode);
  return <div className="gms-mode-summary">
    <div><strong>{mode.vietnameseName}</strong>
      <p>{mode.rulesHint}</p>
      {mode.availability === 'experimental' && <span className="gms-experimental">Thử nghiệm: một số cơ chế chưa hoàn thiện.</span>}
    </div>
    <button type="button" className="gms-change-mode" disabled={disabled} onClick={onBack}>Đổi chế độ</button>
  </div>;
}
