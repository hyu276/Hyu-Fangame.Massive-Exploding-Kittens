import { useState, useEffect, useRef } from 'react';
import './QuickEmotes.css';
import { useGame } from '../../../context/GameContext';
import { soundService } from '../../../services/audio';

const EMOTES = [
  { emoji: '😱', label: 'Hoảng' },
  { emoji: '💣', label: 'Cầu bom' },
  { emoji: '😎', label: 'Tự tin' },
  { emoji: '🚫', label: 'NOPE' },
  { emoji: '🙏', label: 'Cầu may' },
  { emoji: '🔥', label: 'Cháy' },
  { emoji: '😈', label: 'Gài bẫy' },
  { emoji: '👋', label: 'Chào' },
];

export interface FloatingEmoteItem {
  id: string;
  emoji: string;
  playerId: string;
  createdAt: number;
}

export function QuickEmotes() {
  const game = useGame();
  const [isOpen, setIsOpen] = useState(false);

  const handleSendEmote = (emoji: string) => {
    soundService.playEmote();
    setIsOpen(false);

    // 1. Dispatch locally
    window.dispatchEvent(
      new CustomEvent('ek_floating_emote', {
        detail: { emoji, playerId: game.selfPlayerId },
      })
    );

    // 2. Broadcast via boardgame.io chat message
    if (game.sendChatMessage) {
      game.sendChatMessage(`EMOTE:${emoji}`);
    }
  };

  if (!game.isPlayingPhase() || !game.isSelfAlive) return null;

  return (
    <div className="quick-emotes-container">
      {isOpen && (
        <div className="emotes-palette">
          {EMOTES.map(({ emoji, label }) => (
            <button
              key={emoji}
              type="button"
              className="emote-btn"
              onClick={() => handleSendEmote(emoji)}
              title={label}
            >
              <span className="emote-icon">{emoji}</span>
              <span className="emote-label">{label}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`emotes-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        title="Biểu cảm nhanh"
        aria-label="Gửi biểu cảm"
      >
        😄
      </button>
    </div>
  );
}

export function FloatingEmoteOverlay() {
  const game = useGame();
  const [emotes, setEmotes] = useState<FloatingEmoteItem[]>([]);
  const lastMsgCount = useRef(game.chatMessages?.length || 0);

  // Listen to remote chat messages for EMOTE:<emoji>
  useEffect(() => {
    const msgs = game.chatMessages || [];
    if (msgs.length > lastMsgCount.current) {
      const newMsgs = msgs.slice(lastMsgCount.current);
      newMsgs.forEach(m => {
        if (m.payload && typeof m.payload === 'string' && m.payload.startsWith('EMOTE:')) {
          const emoji = m.payload.replace('EMOTE:', '');
          soundService.playEmote();
          setEmotes(prev => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              emoji,
              playerId: String(m.sender),
              createdAt: Date.now(),
            },
          ]);
        }
      });
    }
    lastMsgCount.current = msgs.length;
  }, [game.chatMessages]);

  // Listen to local event
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.emoji) {
        setEmotes(prev => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            emoji: detail.emoji,
            playerId: String(detail.playerId),
            createdAt: Date.now(),
          },
        ]);
      }
    };
    window.addEventListener('ek_floating_emote', handler);
    return () => window.removeEventListener('ek_floating_emote', handler);
  }, []);

  // Clean up expired floating emotes after 2.5s
  useEffect(() => {
    if (emotes.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setEmotes(prev => prev.filter(e => now - e.createdAt < 2500));
    }, 500);
    return () => clearInterval(timer);
  }, [emotes.length]);

  return (
    <div className="floating-emotes-overlay">
      {emotes.map(item => {
        const isSelf = String(game.selfPlayerId) === item.playerId;
        return (
          <div
            key={item.id}
            className={`floating-emote-bubble ${isSelf ? 'self-emote' : 'opponent-emote'}`}
          >
            <span className="floating-emoji">{item.emoji}</span>
          </div>
        );
      })}
    </div>
  );
}
