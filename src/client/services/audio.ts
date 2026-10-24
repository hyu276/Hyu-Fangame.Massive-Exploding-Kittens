// Web Audio API procedural sound synthesis service
// Zero external file dependencies, 100% offline, instant playback

class SoundService {
  private ctx: AudioContext | null = null;
  private volume: number = 0.7;
  private enabled: boolean = true;
  private hapticEnabled: boolean = true;

  constructor() {
    // Load persisted settings
    try {
      const savedVol = localStorage.getItem('ek_sound_volume');
      if (savedVol !== null && Number.isFinite(Number(savedVol))) this.volume = Math.max(0, Math.min(1, Number(savedVol)));

      const savedEnabled = localStorage.getItem('ek_sound_enabled');
      if (savedEnabled !== null) this.enabled = savedEnabled === 'true';

      const savedHaptic = localStorage.getItem('ek_haptic_enabled');
      if (savedHaptic !== null) this.hapticEnabled = savedHaptic === 'true';
    } catch {
      // Fallback to defaults if localStorage restricted
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number) {
    if (!Number.isFinite(val)) return;
    this.volume = Math.max(0, Math.min(1, val));
    try {
      localStorage.setItem('ek_sound_volume', this.volume.toString());
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('ek_sound_enabled', val ? 'true' : 'false');
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  public isHapticEnabled(): boolean {
    return this.hapticEnabled;
  }

  public setHapticEnabled(val: boolean) {
    this.hapticEnabled = val;
    try {
      localStorage.setItem('ek_haptic_enabled', val ? 'true' : 'false');
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  public vibrate(pattern: number | number[]) {
    if (!this.hapticEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  public triggerScreenShake(durationMs: number = 600) {
    if (typeof document === 'undefined') return;
    const board = document.querySelector('.board-container') || document.body;
    board.classList.add('screen-shake');
    setTimeout(() => {
      board.classList.remove('screen-shake');
    }, durationMs);
  }

  // --- PROCEDURAL SOUND GENERATORS ---

  /** Card Draw: Swift whoosh / paper slide */
  public playCardDraw() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // White noise buffer for whoosh
      const bufferSize = ctx.sampleRate * 0.12;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35 * this.volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.12);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  /** Card Play: Crisp, tactile table snap */
  public playCardPlay() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  /** Nope: Sharp dramatic buzzer / metallic slash */
  public playNope() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Dual discordant saw waves
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(110, now + 0.25);

      osc2.frequency.setValueAtTime(233.08, now); // Minor second discord
      osc2.frequency.exponentialRampToValueAtTime(116.54, now + 0.25);

      gain.gain.setValueAtTime(0.5 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);

      this.vibrate([80, 40, 80]);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  /** Explosion: Low-frequency sub boom + rumble */
  public playExplosion() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.8);

      oscGain.gain.setValueAtTime(0.8 * this.volume, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      // Noise rumble
      const bufferSize = ctx.sampleRate * 0.7;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(450, now);
      noiseFilter.frequency.linearRampToValueAtTime(80, now + 0.7);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
      noise.start(now);
      noise.stop(now + 0.7);

      this.triggerScreenShake(700);
      this.vibrate([150, 60, 250]);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  /** Fuse burning: Gentle crackling tick for countdown */
  public playFuse() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
      this.vibrate(30);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  /** Turn alert: Bright double-chime ding */
  public playTurnAlert() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 880]; // E5, A5
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.35 * this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.35);
      });

      this.vibrate([80, 50, 100]);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  /** Quick Emote: Bouncy bubble pop */
  public playEmote() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.1);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  /** Heartbeat for Danger Meter */
  public playHeartbeat() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);

      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.14);
      this.vibrate(40);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  /** Victory fanfare */
  public playVictory() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        const time = now + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.3 * this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.6);
      });
      this.vibrate([100, 50, 100, 50, 200]);
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }

  /** Defeat chime */
  public playDefeat() {
    if (!this.enabled || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 392, 349.23, 293.66]; // A4, G4, F4, D4
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.2;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.2 * this.volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.4);
      });
    } catch { /* Storage or browser capabilities may be unavailable. */ }
  }
}

export const soundService = new SoundService();
