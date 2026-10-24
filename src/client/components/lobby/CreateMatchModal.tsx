import { useRef, useState } from 'react';
import { SelectedGameMode } from './SelectedGameMode';
import { Modal } from '../common/Modal';
import '../common/Button.css';
import '../common/Form.css';
import {
  deckRegistry,
  GAME_MODE_QUICK_PLAY,
  GAME_MODE_TEAM_UP,
  GAME_MODE_CAT_BURGLAR,
  GAME_MODE_ZOMBIE_STANDALONE,
  GAME_MODE_ZOMBIE_APOCALYPSE,
  GAME_MODE_RECIPES_FOR_DISASTER,
  RECIPE_CATALOG,
  getGameModeDefinition,
} from '../../../common';

interface CreateMatchModalProps {
  matchName: string;
  numPlayers: number;
  deckType?: string;
  selectedDecks: string[];
  openCards: boolean;
  spectatorsSeeCards: boolean;
  gameMode: number;
  creating: boolean;
  onMatchNameChange: (name: string) => void;
  onNumPlayersChange: (num: number) => void;
  onDeckTypeChange?: (type: string) => void;
  onSelectedDecksChange: (decks: string[]) => void;
  onOpenCardsChange: (checked: boolean) => void;
  onSpectatorsSeeCardsChange: (checked: boolean) => void;
  onBack: () => void;
  open?: boolean;
  error?: string | null;
  onCreateMatch: () => void;
  onClose: () => void;
}

export function CreateMatchModal({
  matchName,
  numPlayers,
  selectedDecks,
  openCards,
  spectatorsSeeCards,
  gameMode,
  creating,
  onMatchNameChange,
  onNumPlayersChange,
  onSelectedDecksChange,
  onOpenCardsChange,
  onSpectatorsSeeCardsChange,
  onBack,
  open = true,
  error,
  onCreateMatch,
  onClose,
}: CreateMatchModalProps) {
  const [nameError, setNameError] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const availableDecks = deckRegistry.getAll();
  const currentDef = getGameModeDefinition(gameMode);

  const toggleDeck = (deckName: string, isBase: boolean) => {
    if (isBase || !currentDef.allowsExpansionSelection) return;
    if (selectedDecks.includes(deckName)) {
      onSelectedDecksChange(selectedDecks.filter(id => id !== deckName));
    } else {
      onSelectedDecksChange([...selectedDecks, deckName]);
    }
  };

  if (!open) return null;

  const submit = () => {
    if (!matchName.trim()) {
      setNameError(true);
      nameInput.current?.focus();
      return;
    }
    onCreateMatch();
  };

  return (
    <Modal onClose={onClose} closeDisabled={creating} title="Tạo phòng đấu" footer={
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onClose} disabled={creating}>
          Quay lại
        </button>
        <button className="btn btn-primary" onClick={submit} disabled={creating}>
          {creating ? 'Đang tạo phòng...' : 'Tạo phòng'}
        </button>
      </div>
    }>
      <SelectedGameMode gameMode={gameMode} onBack={onBack} disabled={creating} />
      {error && <p className="gms-form-error" role="alert">{error}</p>}
      <div className="form-group">
        <label className="form-label" htmlFor="match-name">Tên phòng đấu</label>
        <input
          ref={nameInput}
          id="match-name"
          aria-invalid={nameError || undefined}
          aria-describedby={nameError ? "match-name-error" : undefined}
          type="text"
          className="form-input"
          value={matchName}
          onChange={(e) => { onMatchNameChange(e.target.value); if (e.target.value.trim()) setNameError(false); }}
          placeholder="Nhập tên phòng..."
          maxLength={100}
        />
        {nameError && <p className="gms-form-error" id="match-name-error" role="alert">Nhập tên phòng, không chỉ dùng khoảng trắng.</p>}
      </div>

      {gameMode === GAME_MODE_RECIPES_FOR_DISASTER && <div className="form-group">
        <strong>Recipes for Disaster · catalog online</strong>
        <p>Hiện chỉ Sticky Fingers có bản chơi thử. Ingredients từng recipe chưa được đối chiếu nên các công thức khác bị khóa.</p>
        <details><summary>Xem 15 recipe và trạng thái</summary>
          <ul>{RECIPE_CATALOG.map(recipe => <li key={recipe.slug}>
            <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">{recipe.name}</a>
            {' · '}{recipe.availability === 'playtest' ? 'Chơi thử, chưa xác minh Ingredients' : 'Đã khóa: thiếu Ingredients xác minh'}
          </li>)}</ul>
        </details>
      </div>}

      <div className="form-group">
        <label className="form-label" htmlFor="match-player-count">Số lượng người chơi</label>
        {gameMode === GAME_MODE_QUICK_PLAY ? (
          <select id="match-player-count" className="form-select" value={2} disabled>
            <option value={2}>2 Người chơi (Cố định cho chế độ Đấu Nhanh)</option>
          </select>
        ) : gameMode === GAME_MODE_CAT_BURGLAR ? (
          <select
            id="match-player-count"
            className="form-select"
            value={numPlayers > 5 ? 5 : numPlayers}
            onChange={(e) => onNumPlayersChange(parseInt(e.target.value))}
          >
            <option value={2}>2 Người chơi</option>
            <option value={3}>3 Người chơi</option>
            <option value={4}>4 Người chơi</option>
            <option value={5}>5 Người chơi (Tối đa 5 người cho Cat Burglar Edition)</option>
          </select>
        ) : gameMode === GAME_MODE_ZOMBIE_STANDALONE ? (
          <select
            id="match-player-count"
            className="form-select"
            value={numPlayers < 4 || numPlayers > 5 ? 4 : numPlayers}
            onChange={(e) => onNumPlayersChange(parseInt(e.target.value))}
          >
            <option value={4}>4 Người chơi (Hộp 61 lá · 57 lá không bom + 3 Mèo Nổ)</option>
            <option value={5}>5 Người chơi (Hộp 61 lá · 57 lá không bom + 4 Mèo Nổ)</option>
          </select>
        ) : gameMode === GAME_MODE_ZOMBIE_APOCALYPSE ? (
          <select
            id="match-player-count"
            className="form-select"
            value={numPlayers < 2 || numPlayers > 9 ? (numPlayers > 9 ? 9 : 2) : numPlayers}
            onChange={(e) => onNumPlayersChange(parseInt(e.target.value))}
          >
            <option value={2}>2 Người chơi (2 Zombie · 0 Defuse · 15 bài · 1 Bom)</option>
            <option value={3}>3 Người chơi (3 Zombie · 0 Defuse · 20 bài · 2 Bom)</option>
            <option value={4}>4 Người chơi (4 Zombie · 0 Defuse · 25 bài · 3 Bom)</option>
            <option value={5}>5 Người chơi (5 Zombie · 0 Defuse · 30 bài · 4 Bom)</option>
            <option value={6}>6 Người chơi (5 Zombie · 1 Defuse · 35 bài · 5 Bom)</option>
            <option value={7}>7 Người chơi (5 Zombie · 2 Defuse · 35 bài · 6 Bom)</option>
            <option value={8}>8 Người chơi (5 Zombie · 3 Defuse · 35 bài · 7 Bom)</option>
            <option value={9}>9 Người chơi (5 Zombie · 4 Defuse · 35 bài · 8 Bom)</option>
          </select>
        ) : gameMode === GAME_MODE_TEAM_UP ? (
          <select
            id="match-player-count"
            className="form-select"
            value={numPlayers}
            onChange={(e) => onNumPlayersChange(parseInt(e.target.value))}
          >
            <option value={2}>2 Người chơi (1 vs 1 · Đội Đỏ vs Đội Xanh)</option>
            <option value={4}>4 Người chơi (2 vs 2 · Đội Đỏ vs Đội Xanh)</option>
            <option value={6}>6 Người chơi (3 vs 3 · Đội Đỏ vs Đội Xanh)</option>
            <option value={8}>8 Người chơi (4 vs 4 · Tối đa cho Đấu Đội)</option>
          </select>
        ) : (
          <select
            id="match-player-count"
            className="form-select"
            value={numPlayers}
            onChange={(e) => {
              const count = parseInt(e.target.value);
              onNumPlayersChange(count);
              if (count > 5 && selectedDecks.filter(id => id !== 'original').length === 0) {
                onSelectedDecksChange(['original', 'imploding_kittens', 'streaking_kittens']);
              }
            }}
          >
            {Array.from(
              { length: currentDef.maxPlayers - currentDef.minPlayers + 1 },
              (_, index) => currentDef.minPlayers + index
            ).map(count => (
              <option key={count} value={count}>
                {count} Người chơi
                {currentDef.allowsExpansionSelection && count > 5 ? ' (Gợi ý: Bật thêm Gói mở rộng)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="form-label" style={{ margin: 0 }}>
            {!currentDef.allowsExpansionSelection
              ? `Bộ bài sử dụng (Cố định theo luật ${currentDef.vietnameseName})`
              : `Chọn các bộ bài (${selectedDecks.length}/${availableDecks.length})`}
          </label>
          {currentDef.allowsExpansionSelection && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectedDecksChange(availableDecks.map(d => d.name))}
              >
                ✓ Chọn tất cả
              </button>
              <button
                type="button"
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectedDecksChange(['original'])}
              >
                ✕ Chỉ Tiêu Chuẩn
              </button>
            </div>
          )}
        </div>

        {gameMode === GAME_MODE_QUICK_PLAY && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            color: '#7dd3fc',
            fontSize: '0.8rem',
            marginBottom: '8px'
          }}>
            ⚡ <strong>Chế độ Đấu Nhanh:</strong> Chồng bài rút được tinh gọn còn đúng 16 lá gồm đầy đủ các loại lá tiêu chuẩn (2 Mèo Nổ, 1 Gỡ Bom, 2 Tấn Công, 2 Bỏ Lượt, 2 Xin Xỏ, 2 Xáo Bài, 2 Tương Lai, 2 Nope, 1 Thẻ Mèo). Không dùng gói mở rộng.
          </div>
        )}

        {gameMode === GAME_MODE_CAT_BURGLAR && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '6px',
            color: '#fcd34d',
            fontSize: '0.8rem',
            marginBottom: '8px'
          }}>
            🐱‍👤 <strong>Chế độ Mèo Đạo Tặc (Cat Burglar):</strong> Sử dụng trọn vẹn Bộ Tiêu Chuẩn 56 lá kết hợp tượng Mèo Đạo Tặc. Tượng sẽ bắt đầu trước mặt người bên phải người đi đầu tiên. Không dùng gói mở rộng.
          </div>
        )}

        {gameMode === GAME_MODE_ZOMBIE_STANDALONE && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            color: '#6ee7b7',
            fontSize: '0.8rem',
            marginBottom: '8px'
          }}>
            🧟 <strong>Chế độ Zombie Kittens Độc Lập:</strong> Sử dụng trọn vẹn hộp bài 61 lá riêng của Zombie Kittens (không ghép expansion). Người chơi chết không bị loại mà vẫn giữ bài trên tay, có thể dùng bài NOW và Nope, và được hồi sinh bằng Zombie Kitten!
          </div>
        )}

        {!currentDef.allowsExpansionSelection ? (
          <div className="gms-fixed-deck">
            {currentDef.avatarUrl && <img src={currentDef.avatarUrl} alt="" />}
            <span>{currentDef.vietnameseName}<small>Bộ bài cố định theo luật, không ghép gói mở rộng.</small></span>
          </div>
        ) : <div className="gms-deck-list">
          {availableDecks.map(deck => <label key={deck.name} className="gms-deck-option">
            {deck.avatarUrl ? <img src={deck.avatarUrl} alt="" /> : <span aria-hidden="true">{deck.icon}</span>}
            <span>{deck.displayName}<small>{deck.isBase ? 'Mặc định, bắt buộc' : deck.description.substring(0, 65)}</small></span>
            <input type="checkbox" checked={selectedDecks.includes(deck.name)} disabled={deck.isBase}
              aria-label={deck.displayName} onChange={() => toggleDeck(deck.name, deck.isBase)} />
          </label>)}
        </div>}

      </div>

      <div className="form-group">
        <label className="form-label">Tùy chọn hiển thị bài</label>
        <div className="checkbox-group">
          <label className="checkbox-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={openCards}
              onChange={(e) => onOpenCardsChange(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>👀 Lật bài công khai (Open Cards)</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cho phép tất cả người chơi trong phòng thấy được bài của nhau trên bàn đấu.</div>
            </div>
          </label>
          <label className="checkbox-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', marginTop: '8px' }}>
            <input
              type="checkbox"
              checked={spectatorsSeeCards}
              onChange={(e) => onSpectatorsSeeCardsChange(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>👻 Khán giả & Người chết thấy bài (Spectators See Cards)</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cho phép người xem và người đã bị loại nhìn thấy toàn bộ lá bài trên tay mọi người.</div>
            </div>
          </label>
        </div>
      </div>


    </Modal>
  );
}
