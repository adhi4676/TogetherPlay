// Web Audio API Sound Effects Engine (No external audio file dependencies)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('tp_sound_enabled') !== 'false';
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('tp_sound_enabled', this.enabled ? 'true' : 'false');
    return this.enabled;
  }

  isSoundEnabled() {
    return this.enabled;
  }

  playTone(freq, duration = 0.1, type = 'sine', gainVal = 0.15) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio might be blocked before first user interaction
    }
  }

  click() {
    this.playTone(600, 0.05, 'triangle', 0.08);
  }

  move() {
    this.playTone(480, 0.08, 'sine', 0.15);
  }

  drop() {
    // Connect Four chip drop effect
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {
      // ignore
    }
  }

  win() {
    // Victory fanfare
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'triangle', 0.2);
      }, idx * 120);
    });
  }

  chat() {
    this.playTone(850, 0.08, 'sine', 0.1);
    setTimeout(() => {
      this.playTone(1100, 0.08, 'sine', 0.1);
    }, 70);
  }

  join() {
    this.playTone(520, 0.1, 'sine', 0.15);
    setTimeout(() => {
      this.playTone(780, 0.15, 'sine', 0.15);
    }, 100);
  }

  error() {
    this.playTone(220, 0.2, 'sawtooth', 0.12);
  }
}

export const soundFx = new SoundEngine();
