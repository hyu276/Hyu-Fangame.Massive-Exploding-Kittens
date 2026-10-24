import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './SettingsModal.css';
import { soundService } from '../../services/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const [volume, setVolume] = useState(Math.round(soundService.getVolume() * 100));
  const [hapticEnabled, setHapticEnabled] = useState(soundService.isHapticEnabled());
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== 'undefined' ? !!document.fullscreenElement : false
  );
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSupported, setWakeLockSupported] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ek_theme') || 'red';
    } catch {
      return 'red';
    }
  });

  // Check Wake Lock support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      setWakeLockSupported(true);
    }
  }, []);

  // Update theme on body
  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('ek_theme', newTheme);
      document.body.classList.remove('theme-casino', 'theme-dark', 'theme-cosmic');
      if (newTheme !== 'red') {
        document.body.classList.add(`theme-${newTheme}`);
      }
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  };

  // Sound toggles
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundService.setEnabled(next);
    if (next) soundService.playTurnAlert();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    soundService.setVolume(val / 100);
  };

  const handleTestSound = () => {
    soundService.playCardPlay();
    setTimeout(() => soundService.playTurnAlert(), 150);
  };

  const handleToggleHaptic = () => {
    const next = !hapticEnabled;
    setHapticEnabled(next);
    soundService.setHapticEnabled(next);
    if (next) soundService.vibrate([60, 40, 60]);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // Wake Lock toggle
  const handleToggleWakeLock = async () => {
    if (!wakeLockSupported) return;
    try {
      if (!wakeLockActive) {
        const sentinel = await (navigator as any).wakeLock.request('screen');
        setWakeLockActive(true);
        sentinel.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      } else {
        setWakeLockActive(false);
      }
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
    }
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={e => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>⚙️ Cài Đặt Trò Chơi</h2>
          <button className="settings-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-modal-body">
          {/* 1. Âm thanh */}
          <div className="settings-section">
            <h3 className="section-title">🔊 Âm Thanh & Phản Hồi</h3>
            
            <div className="settings-row">
              <div className="settings-label-group">
                <span className="setting-name">Hiệu ứng âm thanh (SFX)</span>
                <span className="setting-desc">Tiếng rút bài, nổ bom, NOPE, chuông báo</span>
              </div>
              <button
                type="button"
                className={`settings-toggle-btn ${soundEnabled ? 'active' : ''}`}
                onClick={handleToggleSound}
              >
                {soundEnabled ? 'BẬT' : 'TẮT'}
              </button>
            </div>

            {soundEnabled && (
              <div className="settings-row volume-row">
                <div className="settings-label-group">
                  <span className="setting-name">Âm lượng ({volume}%)</span>
                </div>
                <div className="volume-slider-wrap">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                  <button type="button" className="btn-test-sound" onClick={handleTestSound}>
                    Nghe thử
                  </button>
                </div>
              </div>
            )}

            <div className="settings-row">
              <div className="settings-label-group">
                <span className="setting-name">Rung phản hồi (Haptic)</span>
                <span className="setting-desc">Rung điện thoại khi tới lượt hoặc bom nổ</span>
              </div>
              <button
                type="button"
                className={`settings-toggle-btn ${hapticEnabled ? 'active' : ''}`}
                onClick={handleToggleHaptic}
              >
                {hapticEnabled ? 'BẬT' : 'TẮT'}
              </button>
            </div>
          </div>

          {/* 2. Hiển thị & Màn hình */}
          <div className="settings-section">
            <h3 className="section-title">📱 Hiển Thị & Màn Hình</h3>

            <div className="settings-row">
              <div className="settings-label-group">
                <span className="setting-name">Toàn màn hình</span>
                <span className="setting-desc">Ẩn thanh trình duyệt để tập trung chơi</span>
              </div>
              <button
                type="button"
                className={`settings-toggle-btn ${isFullscreen ? 'active' : ''}`}
                onClick={handleToggleFullscreen}
              >
                {isFullscreen ? 'THOÁT' : 'BẬT'}
              </button>
            </div>

            {wakeLockSupported && (
              <div className="settings-row">
                <div className="settings-label-group">
                  <span className="setting-name">Giữ sáng màn hình (Wake Lock)</span>
                  <span className="setting-desc">Ngăn điện thoại tự tắt màn hình khi đang chơi</span>
                </div>
                <button
                  type="button"
                  className={`settings-toggle-btn ${wakeLockActive ? 'active' : ''}`}
                  onClick={handleToggleWakeLock}
                >
                  {wakeLockActive ? 'ĐANG BẬT' : 'TẮT'}
                </button>
              </div>
            )}
          </div>

          {/* 3. Giao diện thảm bàn */}
          <div className="settings-section">
            <h3 className="section-title">🎨 Màu Thảm Bàn Chơi</h3>
            <div className="theme-options">
              <button
                type="button"
                className={`theme-pill ${theme === 'red' ? 'selected' : ''}`}
                style={{ background: '#C41E3A' }}
                onClick={() => changeTheme('red')}
              >
                🔴 Đỏ Nhung
              </button>
              <button
                type="button"
                className={`theme-pill ${theme === 'casino' ? 'selected' : ''}`}
                style={{ background: '#15803d' }}
                onClick={() => changeTheme('casino')}
              >
                🟢 Xanh Casino
              </button>
              <button
                type="button"
                className={`theme-pill ${theme === 'dark' ? 'selected' : ''}`}
                style={{ background: '#1e293b' }}
                onClick={() => changeTheme('dark')}
              >
                ⚫ Tối Giản
              </button>
              <button
                type="button"
                className={`theme-pill ${theme === 'cosmic' ? 'selected' : ''}`}
                style={{ background: '#6b21a8' }}
                onClick={() => changeTheme('cosmic')}
              >
                🟣 Tím Vũ Trụ
              </button>
            </div>
          </div>
        </div>

        <div className="settings-modal-footer">
          <button type="button" className="settings-btn-save" onClick={onClose}>
            Xong & Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        className="open-settings-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Cài đặt"
        title="Cài đặt trò chơi"
      >
        ⚙️
      </button>
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
