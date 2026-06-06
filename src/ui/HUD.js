import { GAME_WIDTH, DEPTH, COLORS } from '../config/constants.js';
import { storage } from '../utils/Storage.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this._score = 0;
    this._coins = 0;
    this._bestScore = storage.getHighScore();

    this._build();
  }

  _build() {
    const s = this.scene;
    const cam = s.cameras.main;

    // Background header bar
    this._headerBg = s.add.rectangle(GAME_WIDTH / 2, 30, GAME_WIDTH, 56, 0x000000, 0.4);
    this._headerBg.setDepth(DEPTH.hud);
    this._headerBg.setScrollFactor(0);

    // Score (center-top)
    this._scoreTxt = s.add.text(GAME_WIDTH / 2, 18, '0', {
      fontSize: '34px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this._scoreTxt.setOrigin(0.5, 0);
    this._scoreTxt.setDepth(DEPTH.hud + 1);
    this._scoreTxt.setScrollFactor(0);

    // "SCORE" label
    this._scoreLabel = s.add.text(GAME_WIDTH / 2, 13, 'SCORE', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      color: '#888888',
      letterSpacing: 2,
    });
    this._scoreLabel.setOrigin(0.5, 0);
    this._scoreLabel.setDepth(DEPTH.hud + 1);
    this._scoreLabel.setScrollFactor(0);

    // Coin counter (top right)
    this._coinIcon = s.add.circle(GAME_WIDTH - 44, 30, 9, COLORS.coin);
    this._coinIcon.setDepth(DEPTH.hud + 1);
    this._coinIcon.setScrollFactor(0);

    this._coinTxt = s.add.text(GAME_WIDTH - 32, 30, '0', {
      fontSize: '18px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this._coinTxt.setOrigin(0, 0.5);
    this._coinTxt.setDepth(DEPTH.hud + 1);
    this._coinTxt.setScrollFactor(0);

    // Best score (top left)
    this._bestTxt = s.add.text(14, 20, `BEST: ${this._bestScore}`, {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#666666',
    });
    this._bestTxt.setOrigin(0, 0.5);
    this._bestTxt.setDepth(DEPTH.hud + 1);
    this._bestTxt.setScrollFactor(0);

    // Speed indicator (bottom left) - visual feedback
    this._speedBar = s.add.rectangle(0, s.scale.height - 6, 0, 5, COLORS.accent, 0.7);
    this._speedBar.setOrigin(0, 0.5);
    this._speedBar.setDepth(DEPTH.hud + 1);
    this._speedBar.setScrollFactor(0);
  }

  updateScore(score) {
    if (score === this._score) return;
    this._score = score;
    this._scoreTxt.setText(Math.floor(score));

    // Pop animation on score increase
    this.scene.tweens.add({
      targets: this._scoreTxt,
      scale: { from: 1.15, to: 1 },
      duration: 100,
      ease: 'Power2',
    });
  }

  updateCoins(coins) {
    if (coins === this._coins) return;
    this._coins = coins;
    this._coinTxt.setText(coins);
  }

  updateSpeedBar(fraction) {
    const maxW = GAME_WIDTH * 0.5;
    this._speedBar.width = fraction * maxW;
  }

  showLevelUp(label, color) {
    const txt = this.scene.add.text(GAME_WIDTH / 2, 90, label, {
      fontSize: '20px',
      fontFamily: 'Arial Black, sans-serif',
      color,
      stroke: '#000000',
      strokeThickness: 3,
    });
    txt.setOrigin(0.5);
    txt.setDepth(DEPTH.hud + 2);
    txt.setScrollFactor(0);

    this.scene.tweens.add({
      targets: txt,
      y: 70,
      alpha: 0,
      duration: 1400,
      ease: 'Power2',
      onComplete: () => txt.destroy(),
    });
  }

  destroy() {
    [
      this._headerBg, this._scoreTxt, this._scoreLabel,
      this._coinIcon, this._coinTxt, this._bestTxt, this._speedBar,
    ].forEach(o => o && o.destroy());
  }
}
