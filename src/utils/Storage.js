import { SKINS } from '../config/skins.js';

const KEYS = {
  highScore: 'se_highscore',
  coins: 'se_coins',
  ownedSkins: 'se_owned_skins',
  equippedSkin: 'se_equipped_skin',
  gamesPlayed: 'se_games_played',
  totalCoinsEarned: 'se_total_coins',
  vibration: 'se_vibration',
  sound: 'se_sound',
};

class Storage {
  constructor() {
    this._initDefaults();
  }

  _initDefaults() {
    if (!this._has(KEYS.coins)) this._set(KEYS.coins, 0);
    if (!this._has(KEYS.highScore)) this._set(KEYS.highScore, 0);
    if (!this._has(KEYS.ownedSkins)) {
      const defaultOwned = SKINS.filter(s => s.owned).map(s => s.id);
      this._set(KEYS.ownedSkins, JSON.stringify(defaultOwned));
    }
    if (!this._has(KEYS.equippedSkin)) this._set(KEYS.equippedSkin, 'default');
    if (!this._has(KEYS.gamesPlayed)) this._set(KEYS.gamesPlayed, 0);
    if (!this._has(KEYS.totalCoinsEarned)) this._set(KEYS.totalCoinsEarned, 0);
    if (!this._has(KEYS.vibration)) this._set(KEYS.vibration, '1');
    if (!this._has(KEYS.sound)) this._set(KEYS.sound, '1');
  }

  _has(key) {
    return localStorage.getItem(key) !== null;
  }

  _get(key) {
    return localStorage.getItem(key);
  }

  _set(key, value) {
    localStorage.setItem(key, String(value));
  }

  getHighScore() { return parseInt(this._get(KEYS.highScore)) || 0; }
  setHighScore(v) { this._set(KEYS.highScore, v); }

  getCoins() { return parseInt(this._get(KEYS.coins)) || 0; }
  addCoins(n) {
    const cur = this.getCoins();
    const total = parseInt(this._get(KEYS.totalCoinsEarned)) || 0;
    this._set(KEYS.coins, cur + n);
    this._set(KEYS.totalCoinsEarned, total + n);
  }
  spendCoins(n) {
    const cur = this.getCoins();
    if (cur < n) return false;
    this._set(KEYS.coins, cur - n);
    return true;
  }

  getOwnedSkins() {
    try {
      return JSON.parse(this._get(KEYS.ownedSkins)) || ['default'];
    } catch { return ['default']; }
  }
  addOwnedSkin(id) {
    const owned = this.getOwnedSkins();
    if (!owned.includes(id)) {
      owned.push(id);
      this._set(KEYS.ownedSkins, JSON.stringify(owned));
    }
  }
  hasSkin(id) { return this.getOwnedSkins().includes(id); }

  getEquippedSkin() { return this._get(KEYS.equippedSkin) || 'default'; }
  equipSkin(id) { this._set(KEYS.equippedSkin, id); }

  getGamesPlayed() { return parseInt(this._get(KEYS.gamesPlayed)) || 0; }
  incrementGames() { this._set(KEYS.gamesPlayed, this.getGamesPlayed() + 1); }

  getVibration() { return this._get(KEYS.vibration) === '1'; }
  setVibration(v) { this._set(KEYS.vibration, v ? '1' : '0'); }

  getSound() { return this._get(KEYS.sound) === '1'; }
  setSound(v) { this._set(KEYS.sound, v ? '1' : '0'); }
}

export const storage = new Storage();
