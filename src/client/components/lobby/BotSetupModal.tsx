import { useState } from 'react';
import { Modal } from '../common/Modal';
import { SelectedGameMode } from './SelectedGameMode';
import { getModeDeckSelection } from './game-mode-selection';
import {
  deckRegistry,
  GAME_MODE_QUICK_PLAY,
  GAME_MODE_TEAM_UP,
  GAME_MODE_CAT_BURGLAR,
  GAME_MODE_ZOMBIE_STANDALONE,
  GAME_MODE_ZOMBIE_CARL,
  GAME_MODE_ZOMBIE_APOCALYPSE,
  GAME_MODE_RECIPES_FOR_DISASTER,
  GAME_MODE_GOOD_VS_EVIL,
  GAME_MODE_RAGE_MODE,
  GAME_MODE_CURSE_YOU,
  GAME_MODE_ANNIVERSARY_LEGACY,
  GAME_MODE_EXPLODING_MINIONS,
  getGameModeDefinition,
} from '../../../common';
import { BOT_DIFFICULTIES, type BotDifficulty, type BotMatchOptions } from '../../../common/bots/difficulty';
import './BotSetupModal.css';

interface Props {
  playerName: string;
  gameMode: number;
  open?: boolean;
  onBack: () => void;
  onStart: (options: BotMatchOptions) => void;
  onClose: () => void;
}

function getBotCountOptions(modeId: number): Array<{ value: number; label: string }> {
  if (modeId === GAME_MODE_QUICK_PLAY) {
    return [{ value: 1, label: '1 bot · 2 người chơi (Cố định cho Đấu Nhanh)' }];
  }
  if (modeId === GAME_MODE_ZOMBIE_CARL) {
    return [{ value: 1, label: '1 bot · 2 người chơi thật + Carl (Hệ thống)' }];
  }
  if (
    modeId === GAME_MODE_CAT_BURGLAR ||
    modeId === GAME_MODE_RECIPES_FOR_DISASTER ||
    modeId === GAME_MODE_GOOD_VS_EVIL ||
    modeId === GAME_MODE_RAGE_MODE ||
    modeId === GAME_MODE_CURSE_YOU ||
    modeId === GAME_MODE_EXPLODING_MINIONS
  ) {
    return [
      { value: 1, label: '1 bot · 2 người chơi' },
      { value: 2, label: '2 bot · 3 người chơi' },
      { value: 3, label: '3 bot · 4 người chơi' },
      { value: 4, label: '4 bot · 5 người chơi (Tối đa 5 người)' },
    ];
  }
  if (modeId === GAME_MODE_ZOMBIE_STANDALONE) {
    return [
      { value: 3, label: '3 bot · 4 người chơi (Hộp 61 lá · 57 lá không bom + 3 Bom)' },
      { value: 4, label: '4 bot · 5 người chơi (Hộp 61 lá · 57 lá không bom + 4 Bom)' },
    ];
  }
  if (modeId === GAME_MODE_ZOMBIE_APOCALYPSE) {
    return [
      { value: 1, label: '1 bot · 2 người chơi (2 Zombie · 0 Defuse · 15 bài · 1 Bom)' },
      { value: 2, label: '2 bot · 3 người chơi (3 Zombie · 0 Defuse · 20 bài · 2 Bom)' },
      { value: 3, label: '3 bot · 4 người chơi (4 Zombie · 0 Defuse · 25 bài · 3 Bom)' },
      { value: 4, label: '4 bot · 5 người chơi (5 Zombie · 0 Defuse · 30 bài · 4 Bom)' },
      { value: 5, label: '5 bot · 6 người chơi (5 Zombie · 1 Defuse · 35 bài · 5 Bom)' },
      { value: 6, label: '6 bot · 7 người chơi (5 Zombie · 2 Defuse · 35 bài · 6 Bom)' },
      { value: 7, label: '7 bot · 8 người chơi (5 Zombie · 3 Defuse · 35 bài · 7 Bom)' },
      { value: 8, label: '8 bot · 9 người chơi (5 Zombie · 4 Defuse · 35 bài · 8 Bom)' },
    ];
  }
  if (modeId === GAME_MODE_TEAM_UP) {
    return [
      { value: 1, label: '1 bot · 2 người chơi (1 vs 1 · Đội Đỏ vs Đội Xanh)' },
      { value: 3, label: '3 bot · 4 người chơi (2 vs 2 · Đội Đỏ vs Đội Xanh)' },
      { value: 5, label: '5 bot · 6 người chơi (3 vs 3 · Đội Đỏ vs Đội Xanh)' },
      { value: 7, label: '7 bot · 8 người chơi (4 vs 4 · Tối đa cho Đấu Đội)' },
    ];
  }
  if (modeId === GAME_MODE_ANNIVERSARY_LEGACY) {
    return Array.from({ length: 4 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1} bot · ${i + 2} người chơi (2-5 người · Thử nghiệm)`,
    }));
  }
  // Normal, Combo (2 to 10 players)
  return Array.from({ length: 9 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} bot · ${i + 2} người chơi`,
  }));
}

export function BotSetupModal({ playerName, gameMode, open = true, onBack, onStart, onClose }: Props) {
  const [requestedBotCount, setBotCount] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const [deckDraft, setSelectedDecks] = useState<string[]>(['original']);

  const currentDef = getGameModeDefinition(gameMode);
  const botOptions = getBotCountOptions(gameMode);
  const botCount = botOptions.some(option => option.value === requestedBotCount) ? requestedBotCount : botOptions[0].value;
  const selectedDecks = getModeDeckSelection(currentDef, deckDraft);

  const toggleDeck = (deckName: string, isBase: boolean) => {
    if (isBase || !currentDef.allowsExpansionSelection) return;
    if (selectedDecks.includes(deckName)) {
      setSelectedDecks(selectedDecks.filter(id => id !== deckName));
    } else {
      setSelectedDecks([...selectedDecks, deckName]);
    }
  };

  const handleStart = () => {
    const finalDecks = getModeDeckSelection(currentDef, selectedDecks);

    onStart({
      botCount,
      difficulty,
      playerName,
      selectedDecks: finalDecks,
      gameMode,
    });
  };

  if (!open) return null;

  return (
    <Modal onClose={onClose} title="Thiết lập đấu bot" footer={
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Quay lại
          </button>
          <button className="btn btn-primary" onClick={handleStart}>
            Vào bàn đấu · {botCount} bot
          </button>
        </div>
    }>
      <SelectedGameMode gameMode={gameMode} onBack={onBack} />
      {gameMode === GAME_MODE_RECIPES_FOR_DISASTER && <p className="gms-experimental">
        Hiện chỉ Sticky Fingers có bản chơi thử. Các công thức khác bị khóa do chưa xác minh Ingredients.
      </p>}
      <div className="bot-setup">
        <p>
          Chọn đối thủ và bộ bài. Trận đấu chạy ngay trong trình duyệt, không cần chờ phòng.
        </p>

        {/* 2. Chọn Số lượng Bot */}
        <div className="form-group">
          <label className="form-label" htmlFor="bot-count">Số lượng bot đối đầu</label>
          <select
            id="bot-count"
            className="form-select"
            value={botCount}
            onChange={(e) => setBotCount(Number(e.target.value))}
          >
            {botOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Chọn Độ khó Bot */}
        <div className="form-group">
          <label className="form-label" htmlFor="bot-difficulty">Độ khó của bot</label>
          <select
            id="bot-difficulty"
            className="form-select"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as BotDifficulty)}
          >
            {Object.entries(BOT_DIFFICULTIES).map(([id, mode]) => (
              <option key={id} value={id}>
                {mode.label}
              </option>
            ))}
          </select>
          <p style={{ marginTop: '4px' }}>{BOT_DIFFICULTIES[difficulty].description}</p>
          <small>Các bot cũng tương tác và đấu đá lẫn nhau theo cùng thuật toán.</small>
        </div>

        {/* 4. Chọn Bộ bài (Expansion packs) */}
        <div className="form-group">
          <label className="form-label">Bộ bài tham gia</label>
          {!currentDef.allowsExpansionSelection ? (
            <div className="bot-locked-deck-notice">
              <span>🔒</span>
              <span>
                <strong>{currentDef.vietnameseName}</strong> sử dụng cấu trúc bộ bài cố định theo luật chuẩn, không ghép thêm expansion.
              </span>
            </div>
          ) : (
            <>
              <div className="checkbox-group">
                {deckRegistry.getAll().map((deck) => (
                  <label className="checkbox-label" key={deck.name}>
                    <input
                      type="checkbox"
                      disabled={deck.isBase}
                      checked={selectedDecks.includes(deck.name)}
                      onChange={() => toggleDeck(deck.name, deck.isBase)}
                    />
                    <span>{deck.displayName}{deck.isBase ? ' (bắt buộc)' : ''}</span>
                  </label>
                ))}
              </div>
              {botCount > 4 && <small>Bàn đông sẽ tự động bổ sung số lá bài an toàn để mỗi người đều nhận đủ 8 lá khởi đầu.</small>}
            </>
          )}
        </div>


      </div>
    </Modal>
  );
}
