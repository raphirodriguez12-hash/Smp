import { storage } from '../utils/Storage.js';

class VibrationManager {
  constructor() {
    this._enabled = true;
    this._supported = 'vibrate' in navigator;
  }

  init() {
    this._enabled = storage.getVibration();
  }

  vibrate(pattern) {
    if (!this._enabled || !this._supported) return;
    navigator.vibrate(pattern);
  }

  light() { this.vibrate(20); }
  medium() { this.vibrate(45); }
  heavy() { this.vibrate([30, 20, 60]); }
  death() { this.vibrate([60, 30, 40, 30, 80]); }
  coin() { this.vibrate(15); }
  button() { this.vibrate(10); }

  setEnabled(v) {
    this._enabled = v;
    storage.setVibration(v);
  }

  isEnabled() { return this._enabled; }
}

export const vibrationManager = new VibrationManager();
