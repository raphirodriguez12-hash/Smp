import { storage } from '../utils/Storage.js';

class AudioManager {
  constructor() {
    this._ctx = null;
    this._enabled = true;
    this._masterGain = null;
  }

  init() {
    this._enabled = storage.getSound();
    try {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._masterGain = this._ctx.createGain();
      this._masterGain.gain.value = this._enabled ? 0.5 : 0;
      this._masterGain.connect(this._ctx.destination);
    } catch (e) {
      console.warn('Web Audio not available');
    }
  }

  _resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }

  _playTone(freq, type, duration, gainVal, fadeOut = true, delay = 0) {
    if (!this._ctx || !this._enabled) return;
    this._resume();

    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();

    osc.connect(gain);
    gain.connect(this._masterGain);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this._ctx.currentTime + delay);

    gain.gain.setValueAtTime(gainVal, this._ctx.currentTime + delay);
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + delay + duration);
    }

    osc.start(this._ctx.currentTime + delay);
    osc.stop(this._ctx.currentTime + delay + duration + 0.05);
  }

  playCoin() {
    this._playTone(880, 'sine', 0.08, 0.4);
    this._playTone(1320, 'sine', 0.1, 0.3, true, 0.06);
  }

  playDeath() {
    this._playTone(220, 'sawtooth', 0.18, 0.5);
    this._playTone(110, 'sawtooth', 0.25, 0.4, true, 0.1);
    this._playTone(55, 'square', 0.3, 0.3, true, 0.2);
  }

  playStart() {
    [0, 0.08, 0.16].forEach((delay, i) => {
      this._playTone(440 + i * 220, 'sine', 0.12, 0.35, true, delay);
    });
  }

  playPerfectPass() {
    this._playTone(660, 'sine', 0.06, 0.3);
    this._playTone(880, 'sine', 0.06, 0.2, true, 0.04);
  }

  playRevive() {
    [0, 0.1, 0.2, 0.3].forEach((delay, i) => {
      this._playTone(440 + i * 110, 'sine', 0.15, 0.35, true, delay);
    });
  }

  playButton() {
    this._playTone(520, 'sine', 0.07, 0.3);
  }

  playChestOpen() {
    [220, 330, 440, 660].forEach((freq, i) => {
      this._playTone(freq, 'sine', 0.12, 0.4, true, i * 0.07);
    });
  }

  playSpeedUp() {
    this._playTone(880, 'sawtooth', 0.08, 0.2);
    this._playTone(1100, 'sawtooth', 0.1, 0.2, true, 0.06);
  }

  setEnabled(v) {
    this._enabled = v;
    if (this._masterGain) {
      this._masterGain.gain.value = v ? 0.5 : 0;
    }
    storage.setSound(v);
  }

  isEnabled() { return this._enabled; }
}

export const audioManager = new AudioManager();
