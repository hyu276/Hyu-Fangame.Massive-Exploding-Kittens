import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { GAME_MODES, getGameModeDefinition } from '../../../common/constants/game-modes';
import { getModePresentation } from './game-mode-presentation';
import './GameModeSelector.css';

export type MatchPlayType = 'online' | 'bot';
type Category = 'all' | 'stable' | 'zombie' | 'experimental';

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'Tất cả' }, { id: 'stable', label: 'Ổn định' },
  { id: 'zombie', label: 'Zombie' }, { id: 'experimental', label: 'Thử nghiệm' },
];

interface Props {
  gameMode: number;
  playType: MatchPlayType;
  configuring: boolean;
  busy: boolean;
  onGameModeChange: (id: number) => void;
  onPlayTypeChange: (type: MatchPlayType) => void;
  onContinue: () => void;
  onBack: () => void;
  onClose: () => void;
  children: ReactNode;
}

function SceneImage({ src, icon, className }: { src: string; icon: string; className: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <span className="art-fallback" aria-hidden="true">{icon}</span>
    : <img className={className} src={src} alt="" onError={() => setFailed(true)} decoding="async" />;
}

export function GameModeSelector({ gameMode, playType, configuring, busy, onGameModeChange,
  onPlayTypeChange, onContinue, onBack, onClose, children }: Props) {
  const [category, setCategory] = useState<Category>('all');
  const dialog = useRef<HTMLDialogElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const rules = useRef<HTMLDetailsElement>(null);
  const lastConfiguring = useRef(false);
  const descriptionId = useId();
  const helpId = useId();
  const mode = getGameModeDefinition(gameMode);
  const visual = getModePresentation(mode);
  const filtered = GAME_MODES.filter(item => category === 'all'
    || (category === 'stable' && item.availability === 'stable')
    || (category === 'zombie' && item.slug.startsWith('zombie'))
    || (category === 'experimental' && item.availability === 'experimental'));

  useEffect(() => {
    const node = dialog.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    node?.showModal();
    node?.querySelector<HTMLButtonElement>('[data-mode-id][aria-pressed="true"]')?.focus({ preventScroll: true });
    return () => {
      node?.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    const node = rail.current;
    const tile = node?.querySelector<HTMLButtonElement>(`[data-mode-id="${gameMode}"]`);
    if (node && tile && !configuring) {
      node.scrollTo({ left: Math.max(0, tile.offsetLeft + tile.offsetWidth / 2 - node.clientWidth / 2),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
    if (rules.current) rules.current.open = false;
  }, [gameMode, category, configuring]);

  useLayoutEffect(() => {
    if (configuring) dialog.current?.querySelector<HTMLButtonElement>('.modal-close-btn')?.focus();
    else if (lastConfiguring.current) continueButton.current?.focus({ preventScroll: true });
    lastConfiguring.current = configuring;
  }, [configuring]);

  const selectCategory = (value: Category) => {
    setCategory(value);
    const list = GAME_MODES.filter(item => value === 'all'
      || (value === 'stable' && item.availability === 'stable')
      || (value === 'zombie' && item.slug.startsWith('zombie'))
      || (value === 'experimental' && item.availability === 'experimental'));
    if (!list.some(item => item.id === gameMode)) {
      const next = list.find(item => item.availability !== 'planned');
      if (next) onGameModeChange(next.id);
    }
  };

  const moveSelection = (direction: number, focus = false) => {
    const selectable = filtered.filter(item => item.availability !== 'planned');
    if (!selectable.length) return;
    const index = selectable.findIndex(item => item.id === gameMode);
    const next = selectable[(index + direction + selectable.length) % selectable.length];
    onGameModeChange(next.id);
    if (focus) rail.current?.querySelector<HTMLButtonElement>(`[data-mode-id="${next.id}"]`)?.focus({ preventScroll: true });
  };

  const onRailKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); moveSelection(event.key === 'ArrowRight' ? 1 : -1, true);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const selectable = filtered.filter(item => item.availability !== 'planned');
      const next = selectable[event.key === 'Home' ? 0 : selectable.length - 1];
      if (!next) return;
      onGameModeChange(next.id);
      rail.current?.querySelector<HTMLButtonElement>(`[data-mode-id="${next.id}"]`)?.focus({ preventScroll: true });
    }
  };

  return createPortal(
    <dialog ref={dialog} className="gms-dialog" aria-label={configuring ? 'Thiết lập trận đấu' : 'Chọn chế độ chơi'}
      onCancel={event => {
        event.preventDefault();
        if (busy) return;
        if (rules.current?.open && !configuring) {
          rules.current.open = false; rules.current.querySelector('summary')?.focus();
        } else if (configuring) onBack(); else onClose();
      }}>
      <div className="gms-stage" inert={configuring} aria-hidden={configuring || undefined}>
        <div className="scene" aria-hidden="true">
          <div className="ambient-art" style={{ backgroundImage: `url("${visual.scene}")` }} />
          <div className="art-stage changing" key={visual.scene}>
            <SceneImage src={visual.scene} icon={mode.icon} className="mode-art" />
          </div>
          <div className="scene-shade" />
        </div>
        <header className="topbar">
          <button type="button" className="screen-label" onClick={onClose} aria-label="Trở về sảnh">
            <span className="back-chevron" aria-hidden="true">‹</span><span>Chọn chế độ</span>
          </button>
          <div className="top-right"><span className="game-wordmark">EXPLODING KITTENS</span>
            <div className="play-tabs" role="group" aria-label="Kiểu trận đấu">
              <button type="button" className={playType === 'online' ? 'active' : ''} aria-pressed={playType === 'online'} onClick={() => onPlayTypeChange('online')}>Tạo phòng</button>
              <button type="button" className={playType === 'bot' ? 'active' : ''} aria-pressed={playType === 'bot'} onClick={() => onPlayTypeChange('bot')}>Đấu bot</button>
            </div>
          </div>
        </header>
        <div className="gms-content">
          <nav className="side-nav" aria-label="Nhóm chế độ">
            {categories.map(item => <button type="button" key={item.id} className={`category ${category === item.id ? 'active' : ''}`}
              aria-pressed={category === item.id} onClick={() => selectCategory(item.id)}><span aria-hidden="true">◇</span>{item.label}</button>)}
          </nav>
          <section className="hero" aria-label="Chi tiết chế độ đang chọn">
            <div className="mode-info">
              <div className="mode-heading">
                {mode.availability !== 'stable' && <div className="eyebrow">{mode.availability === 'experimental' ? 'Thử nghiệm' : 'Sắp có'}</div>}
                <h1>{visual.title}</h1>
                <div className="mode-meta"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  {mode.minPlayers === mode.maxPlayers ? mode.minPlayers : `${mode.minPlayers}–${mode.maxPlayers}`} người chơi</span>
                  <span>{mode.allowsExpansionSelection ? 'Tùy chọn gói mở rộng' : 'Bộ bài cố định'}</span></div>
                <details className="rules" ref={rules}><summary><span className="info-icon" aria-hidden="true">?</span>Luật chơi</summary><p>{mode.rulesHint}</p></details>
              </div>
              <div className="mode-bottom">
                <p className="description" id={descriptionId}>{mode.description}</p>
                {mode.availability === 'experimental' && <p className="experimental-notice">Thử nghiệm: một số cơ chế chưa hoàn thiện.</p>}
                <button ref={continueButton} type="button" className="primary-cta" disabled={mode.availability === 'planned'} onClick={onContinue} aria-describedby={descriptionId}>
                  <span>{playType === 'bot' ? 'Thiết lập đấu bot' : 'Thiết lập trận'}</span><span aria-hidden="true">›</span>
                </button>
              </div>
            </div>
          </section>
          <section className="mode-picker" aria-label="Danh sách chế độ">
            <div className="picker-heading"><div className="rail-controls"><span>{filtered.findIndex(item => item.id === gameMode) + 1} / {filtered.length}</span>
              <button type="button" className="gms-previous" aria-label="Chế độ trước" onClick={() => moveSelection(-1)}>‹</button>
              <button type="button" className="gms-next" aria-label="Chế độ tiếp theo" onClick={() => moveSelection(1)}>›</button>
            </div></div>
            <p className="sr-only" id={helpId}>Cuộn ngang để khám phá. Dùng phím mũi tên khi chọn thẻ.</p>
            <div className="mode-rail" ref={rail} role="group" aria-label="Chọn gamemode" aria-describedby={helpId} onKeyDown={onRailKey}>
              {filtered.map(item => {
                const itemVisual = getModePresentation(item);
                return <button type="button" key={item.id} data-mode-id={item.id} className="mode-tile"
                  aria-pressed={gameMode === item.id} aria-label={`${item.vietnameseName}${item.availability === 'experimental' ? ' · Thử nghiệm' : ''}`}
                  tabIndex={gameMode === item.id ? 0 : -1} disabled={item.availability === 'planned'} onClick={() => onGameModeChange(item.id)}>
                  <SceneImage src={itemVisual.scene} icon={item.icon} className="tile-image" />
                  {item.availability !== 'stable' && <span className="tile-top"><span className="tile-experimental">{item.availability === 'experimental' ? 'Thử nghiệm' : 'Sắp có'}</span></span>}
                  <span className="tile-copy"><span className="tile-title">{itemVisual.title}</span></span>
                </button>;
              })}
            </div>
          </section>
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{mode.vietnameseName} · {mode.rulesHint}</p>
      </div>
      <div className="gms-configuration" hidden={!configuring}>{children}</div>
    </dialog>, document.body,
  );
}
