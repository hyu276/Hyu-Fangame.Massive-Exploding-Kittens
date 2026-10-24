import { createContext, useContext, useMemo, useState } from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { BoardRaceState, BoardAction } from '../../../common/board-game/board-race';
import { ACTION_LABELS, NOW_ACTIONS, type ActionKind } from '../../../common/board-game/manifest';
import { BOARD_TRACK } from '../../../common/board-game/track';
import './BoardGame.css';

const catKinds = new Set<ActionKind>(['cat_taco', 'cat_beard', 'cat_rainbow']);
const COLORS = ['#e2a23c', '#a46bcb', '#50a987', '#dc7060', '#55a5c1', '#d98cab'];
export const BoardExitContext = createContext<() => void>(() => {});

export default function BoardGameBoard({ G, ctx, moves, playerID, matchData }: BoardProps<BoardRaceState>) {
  const [targetId, setTargetId] = useState('');
  const [magnetIndex, setMagnetIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [discardIds, setDiscardIds] = useState<string[]>([]);
  const [alterOrder, setAlterOrder] = useState<string[]>([]);
  const onLeave = useContext(BoardExitContext);
  const state = G;
  const me = state?.players.find(p => p.id === playerID);
  const current = ctx?.currentPlayer;
  const myTurn = playerID === current && !ctx?.gameover;
  const playerName = (id: string) => id === playerID ? 'Bạn' :
    matchData?.find(p => String(p.id) === id)?.name || `Người chơi ${id}`;
  const opponents = useMemo(() => state?.players.filter(p => p.id !== playerID && (p.handCount ?? p.hand.length) > 0) ?? [], [state, playerID]);
  if (!state || !ctx) return <div className="board-loading">Đang đồng bộ bàn chơi…</div>;

  const isPair = (card: BoardAction) => catKinds.has(card.kind) || card.kind === 'feral_cat';
  const partner = (card: BoardAction) => me?.hand.find(c => c.id !== card.id &&
    (c.kind === card.kind && catKinds.has(card.kind) || card.kind === 'feral_cat' && catKinds.has(c.kind) ||
      c.kind === 'feral_cat' && catKinds.has(card.kind)));
  const play = (card: BoardAction) => {
    const second = isPair(card) ? partner(card) : undefined;
    const target = isPair(card) ? (targetId || opponents[0]?.id) : undefined;
    moves.playAction(card.id, second?.id, target, card.kind === 'add_magnet_now' ? magnetIndex : undefined);
  };
  const canPlay = (card: BoardAction) => state.phase === 'actions' && !state.pendingAction &&
    card.kind !== 'defuse' && card.kind !== 'nope_now' && (myTurn || NOW_ACTIONS.has(card.kind)) &&
    (!isPair(card) || !!partner(card) && !!(targetId || opponents[0]?.id)) &&
    (card.kind !== 'ditto' || state.moveDiscardPile.length > 0) &&
    (card.kind !== 'add_magnet_now' || state.availableDangerMagnets.length > 0);
  const hand = me?.hand ?? [];
  const pending = state.pendingAction;
  const reveal = state.privateReveal;
  const shownOrder = alterOrder.length ? alterOrder : reveal?.discIds ?? [];

  return <main className={`board-game board-game--${state.boardSide}`}>
    <header className="board-header"><div><button onClick={() => {
      if (playerID && !ctx.gameover && !window.confirm('Rời bàn sẽ tính là bỏ trận. Tiếp tục?')) return;
      if (playerID && !ctx.gameover) moves.forfeit();
      onLeave();
    }}>← Rời bàn</button><p className="board-kicker">{state.edition === 'super_fan' ? 'Super Fan' : 'Classic'} · Digital playtest</p>
      <h1>The Board Game</h1><p role="status" aria-live="polite">Lượt {playerName(current)} · {state.boardSide === 'calm' ? 'Calm' : 'Chaos'} · {state.phase}</p></div>
      <div className="board-decks"><span>Action Draw <b>{state.actionDrawPile.length}</b></span><span>Move Draw <b>{state.moveDrawPile.length}</b></span>
        <span>Move Discard <b>{state.moveDiscardPile.length}</b></span><span>Magnet reserve <b>{state.availableDangerMagnets.length}</b></span></div>
    </header>
    <div className="board-layout"><section className="board-table-wrap" aria-label="Đường đua">
      <div className="board-table-controls"><button onClick={() => setZoom(z => Math.min(1.6, z + .2))} aria-label="Phóng to">＋</button>
        <button onClick={() => setZoom(z => Math.max(.7, z - .2))} aria-label="Thu nhỏ">－</button>
        <button onClick={() => setZoom(1)}>Đặt lại</button><span>{state.boardSide.toUpperCase()}</span></div>
      <div className="board-table-scroll"><div className="board-track" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        {BOARD_TRACK.map(node => {
          const kind = node.kindBySide[state.boardSide];
          const occupants = state.players.filter(p => p.position === node.ordinal && !p.forfeited);
          return <div key={node.id} className={`board-node board-node--${kind}`} tabIndex={0} role="group"
            title={`${node.id}: ${kind}${kind === 'number' ? ` ${node.actionDrawCountBySide[state.boardSide]}` : ''}`}
            aria-label={`Ô ${node.ordinal}, ${kind === 'number' ? `rút ${node.actionDrawCountBySide[state.boardSide]} Action Cards` : kind}, ${occupants.length} người chơi`}>
            <span className="board-node-num">{node.ordinal}</span><span className="board-node-symbol">{kind === 'litter_box' ? '⌂' : kind === 'ribbon' ? '⚑' : kind === 'exploding_kitten' ? '✷' : `+${node.actionDrawCountBySide[state.boardSide]}`}</span>
            <span className="board-tokens">{occupants.map(p => <span key={p.id} className="board-token" style={{ background: COLORS[Number(p.id) % COLORS.length] }} title={`Người chơi ${p.id}`}>{Number(p.id) + 1}</span>)}</span>
          </div>;
        })}
      </div></div><p className="board-legend">⌂ Litter Box · +N rút N Action Cards · ✷ Exploding Kitten · ⚑ Ribbon · quá Ribbon quay về ô 1</p>
    </section>
    <aside className="board-sidebar"><h2>Người chơi</h2>{state.players.map(p => <div key={p.id} className={`board-player ${p.id === current ? 'board-player--current' : ''}`}>
      <span className="board-token" style={{ background: COLORS[Number(p.id) % COLORS.length] }}>{Number(p.id) + 1}</span>
      <span>{playerName(p.id)} {p.forfeited ? '(rời trận)' : ''}<small>Ô {p.position} · {p.handCount ?? p.hand.length} Action Cards</small></span>
    </div>)}
    <h2>Cách chơi</h2><ol><li>Chơi Action Cards tùy ý.</li><li>Người khác có thể chơi NOW trước khi rút Move Disc.</li>
      <li>Rút Move Disc rồi đi theo hiệu ứng.</li><li>Flip đổi mặt bàn, không tự kích hoạt ô.</li><li>Đáp đúng Ribbon để thắng.</li></ol>
    <p className="board-disclaimer">Sơ đồ ô và tần suất subtype hiện là fixture thử nghiệm, chưa xác minh từ bản in.</p></aside></div>

    <section className="board-controls"><h2>Hành động</h2>
      {state.winnerId !== undefined && <p className="board-win" role="status">Người chơi {state.winnerId} đã về Ribbon và thắng!</p>}
      {state.terminalDiagnostic && <p className="board-error" role="alert">{state.terminalDiagnostic}</p>}
      {pending && <div className="board-pending"><strong>{ACTION_LABELS[pending.kind]}</strong> · {pending.canceled ? 'đang bị Nope' : 'đang có hiệu lực'} · {pending.nopeCount} Nope
        {myTurn && <button onClick={() => moves.resolveAction()}>Chốt phản ứng và giải quyết</button>}
        {hand.filter(c => c.kind === 'nope_now').map(c => <button key={c.id} onClick={() => moves.nope(c.id)}>Nope NOW</button>)}
      </div>}
      {state.phase === 'actions' && !pending && myTurn && <button className="board-primary" onClick={() => moves.drawMove()}>Rút Move Disc</button>}
      {state.phase === 'move_choice' && myTurn && <div className="board-pending"><p>{state.pendingDisc?.kind}: chọn đúng một nhánh</p>
        <button onClick={() => moves.chooseMoveOption(true)}>Di chuyển</button><button onClick={() => moves.chooseMoveOption(false)}>Chỉ lật bàn</button></div>}
      {state.phase === 'ek_choice' && myTurn && <div className="board-pending"><p>Đáp Exploding Kitten Space. Dùng Defuse để ở lại, hoặc chịu nổ.</p>
        {hand.some(c => c.kind === 'defuse') && <button onClick={() => moves.chooseExplosion(true)}>Dùng Defuse</button>}
        <button onClick={() => moves.chooseExplosion(false)}>Chịu nổ</button></div>}
      {state.phase === 'swap_choice' && myTurn && <div className="board-pending"><p>Chọn người đồng cuối để đổi chỗ</p>
        {state.swapTargets?.map(id => <button key={id} onClick={() => moves.chooseSwap(id)}>Người chơi {id}</button>)}</div>}
      {state.phase === 'discard_choice' && myTurn && <div className="board-pending"><p>Chọn đúng {hand.length - 3} lá để bỏ (còn 3).</p>
        <button disabled={discardIds.length !== hand.length - 3} onClick={() => { moves.discardToThree(discardIds); setDiscardIds([]); }}>Bỏ các lá đã chọn</button></div>}
      {state.phase === 'alter_choice' && reveal?.owner === playerID && <div className="board-pending"><p>Alter the Future: chỉ bạn thấy 2 Move Discs đầu.</p>
        {shownOrder.map((id, i) => <button key={id} onClick={() => setAlterOrder([...shownOrder].reverse())}>{i + 1}. {reveal.discs.find(d => d.id === id)?.kind}</button>)}
        <button onClick={() => { moves.reorderFuture(shownOrder); setAlterOrder([]); }}>Xác nhận thứ tự</button></div>}
      {state.phase === 'actions' && !pending && opponents.length > 0 && <label>Mục tiêu Cat Pair <select value={targetId} onChange={e => setTargetId(e.target.value)}>
        <option value="">Tự chọn người đầu tiên</option>{opponents.map(p => <option key={p.id} value={p.id}>Người chơi {p.id} ({p.handCount} lá)</option>)}</select></label>}
      {state.phase === 'actions' && !pending && hand.some(c => c.kind === 'add_magnet_now') && <label>Chèn Magnet tại vị trí bí mật {magnetIndex}
        <input type="range" min="0" max={state.moveDrawPile.length} value={Math.min(magnetIndex, state.moveDrawPile.length)} onChange={e => setMagnetIndex(Number(e.target.value))} /></label>}
    </section>
    <section className="board-hand"><h2>Action Cards của bạn ({hand.length})</h2><div className="board-hand-list">{hand.map(card => <button key={card.id}
      className={discardIds.includes(card.id) ? 'board-card board-card--selected' : 'board-card'}
      disabled={state.phase === 'discard_choice' ? false : pending ? card.kind !== 'nope_now' : !canPlay(card)}
      onClick={() => state.phase === 'discard_choice' ? setDiscardIds(ids => ids.includes(card.id) ? ids.filter(id => id !== card.id) : [...ids, card.id]) :
        pending && card.kind === 'nope_now' ? moves.nope(card.id) : play(card)}>{ACTION_LABELS[card.kind]}<small>{NOW_ACTIONS.has(card.kind) ? 'NOW' : isPair(card) ? 'Cặp Cat' : card.kind === 'defuse' ? 'Chỉ dùng khi nổ' : 'Action'}</small></button>)}</div></section>
    <section className="board-events"><h2>Diễn biến</h2><ol aria-live="polite">{state.events.slice(0, 8).map((event, i) => <li key={`${i}-${event}`}>{event}</li>)}</ol></section>
  </main>;
}
