import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTH } from '../config/constants.js';
import { storage } from '../utils/Storage.js';
import { audioManager } from '../systems/AudioManager.js';
import { vibrationManager } from '../systems/VibrationManager.js';
import { adManager } from '../systems/AdManager.js';
import { economySystem } from '../systems/EconomySystem.js';
import { createExplosion } from '../utils/ParticleHelper.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this._score = data.score || 0;
    this._coinsEarned = data.coinsEarned || 0;
    this._newBest = data.newBest || false;
    this._elapsedSeconds = data.elapsedSeconds || 0;
    this._coinsCollected = data.coinsCollected || 0;
    this._isRevived = data.isRevived || false;
    this._onRevive = data.onRevive || null;
    this._doubleApplied = false;
    this._reviveUsed = this._isRevived;
  }

  create() {
    this._buildOverlay();
    this._buildCard();
    this._buildScoreDisplay();
    this._buildButtons();
    this._animateIn();

    // Award base coins immediately (before optional double)
    economySystem.awardRoundCoins(this._coinsEarned);
  }

  _buildOverlay() {
    // Dark overlay behind the panel
    const overlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65);
    overlay.setDepth(DEPTH.overlay);
  }

  _buildCard() {
    const cardY = GAME_HEIGHT / 2 - 20;
    const cardH = 520;

    this._card = this.add.container(GAME_WIDTH / 2, cardY);
    this._card.setDepth(DEPTH.overlay + 1);

    const bg = this.add.rectangle(0, 0, 330, cardH, 0x0f1923, 1);
    bg.setStrokeStyle(2, 0x4fffb0, 0.4);

    // Accent bar at top
    const accentBar = this.add.rectangle(0, -cardH / 2 + 3, 330, 5, COLORS.accent, 1);

    this._card.add([bg, accentBar]);
  }

  _buildScoreDisplay() {
    const card = this._card;

    // Game Over title
    const gameOverTxt = this.add.text(0, -230, this._newBest ? '✦ NOUVEAU RECORD ✦' : 'PARTIE TERMINÉE', {
      fontSize: this._newBest ? '18px' : '14px',
      fontFamily: 'Arial Black, sans-serif',
      color: this._newBest ? '#ffd700' : '#888888',
      letterSpacing: this._newBest ? 1 : 2,
    });
    gameOverTxt.setOrigin(0.5);

    // Score
    const scoreLabel = this.add.text(0, -195, 'SCORE', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#555555', letterSpacing: 2,
    });
    scoreLabel.setOrigin(0.5);

    this._scoreTxt = this.add.text(0, -160, '0', {
      fontSize: '76px', fontFamily: 'Arial Black, sans-serif', color: '#ffffff',
    });
    this._scoreTxt.setOrigin(0.5);

    // Best score
    const best = storage.getHighScore();
    const bestTxt = this.add.text(0, -100, `MEILLEUR : ${best}`, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#444444',
    });
    bestTxt.setOrigin(0.5);

    // Divider
    const divider = this.add.rectangle(0, -72, 240, 1, 0xffffff, 0.08);

    // Coins earned row
    const coinLabel = this.add.text(-80, -50, 'PIÈCES GAGNÉES', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#555555', letterSpacing: 1,
    });
    coinLabel.setOrigin(0, 0.5);

    const coinIcon = this.add.circle(55, -50, 8, COLORS.coin);

    this._coinEarnedTxt = this.add.text(67, -50, `+${this._coinsEarned}`, {
      fontSize: '20px', fontFamily: 'Arial Black, sans-serif', color: '#ffd700',
    });
    this._coinEarnedTxt.setOrigin(0, 0.5);

    // Time survived
    const timeLabel = this.add.text(-80, -18, 'TEMPS SURVÉCU', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#555555', letterSpacing: 1,
    });
    timeLabel.setOrigin(0, 0.5);

    const seconds = Math.floor(this._elapsedSeconds);
    const timeTxt = this.add.text(80, -18, `${seconds}s`, {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa',
    });
    timeTxt.setOrigin(1, 0.5);

    card.add([gameOverTxt, scoreLabel, this._scoreTxt, bestTxt, divider, coinLabel, coinIcon, this._coinEarnedTxt, timeLabel, timeTxt]);

    // Animate score counting up
    const duration = Math.min(this._score * 8, 1200);
    this.tweens.addCounter({
      from: 0,
      to: this._score,
      duration,
      ease: 'Power2',
      onUpdate: (tween) => {
        this._scoreTxt.setText(Math.floor(tween.getValue()));
      },
    });

    // New best effect
    if (this._newBest) {
      createExplosion(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 160, 0xffd700, 20);
      this.cameras.main.shake(300, 0.006);
    }
  }

  _buildButtons() {
    const card = this._card;
    const baseY = 70;

    // REJOUER button (primary)
    const replayBtn = this._makeCardButton(0, baseY, 280, 60, '▶  REJOUER', 0x4fffb0, 0x000000, () => {
      audioManager.playButton();
      vibrationManager.button();
      this._goToGame();
    });

    // DOUBLER les pièces (rewarded ad)
    if (!this._doubleApplied) {
      const doubleBtn = this._makeCardButton(0, baseY + 78, 280, 50,
        '×2  DOUBLER LES PIÈCES  📺', 0x1a1a2e, 0xffd700, () => {
          if (this._doubleApplied) return;
          audioManager.playButton();
          adManager.showRewarded(
            () => {
              this._doubleApplied = true;
              economySystem.awardRoundCoins(this._coinsEarned);
              this._coinEarnedTxt.setText(`+${this._coinsEarned * 2}`);
              doubleBtn.setAlpha(0.35);
              doubleBtn.disableInteractive();
              audioManager.playChestOpen();
              vibrationManager.medium();
            },
            () => { /* skipped */ }
          );
        });
      card.add(doubleBtn);
    }

    // REVIVRE (rewarded ad) - only if not already revived
    if (!this._reviveUsed) {
      const reviveBtn = this._makeCardButton(0, baseY + 145, 280, 50,
        '💚  REVIVRE  📺', 0x1a1a2e, 0x2ed573, () => {
          if (this._reviveUsed) return;
          audioManager.playButton();
          adManager.showRewarded(
            () => {
              this._reviveUsed = true;
              if (this._onRevive) this._onRevive();
            },
            () => { /* skipped */ }
          );
        });
      card.add(reviveBtn);
    }

    // MENU button
    const menuBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 55, 'MENU PRINCIPAL', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#444444',
    });
    menuBtn.setOrigin(0.5);
    menuBtn.setDepth(DEPTH.overlay + 2);
    menuBtn.setInteractive({ cursor: 'pointer' });
    menuBtn.on('pointerdown', () => {
      audioManager.playButton();
      this._goToMenu();
    });

    card.add(replayBtn);
  }

  _makeCardButton(x, y, w, h, label, bgColor, textColor, callback) {
    const container = this.add.container(x, y);

    const hexTextColor = typeof textColor === 'number'
      ? `#${textColor.toString(16).padStart(6, '0')}`
      : textColor;

    const bg = this.add.rectangle(0, 0, w, h, bgColor, 1);
    bg.setStrokeStyle(1, typeof textColor === 'number' ? textColor : 0x4fffb0, 0.4);

    const txt = this.add.text(0, 0, label, {
      fontSize: '16px',
      fontFamily: 'Arial Black, sans-serif',
      color: hexTextColor,
    });
    txt.setOrigin(0.5);

    container.add([bg, txt]);
    container.setSize(w, h);
    container.setInteractive({ cursor: 'pointer' });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scale: 0.94,
        duration: 80,
        yoyo: true,
        onComplete: callback,
      });
    });

    return container;
  }

  _animateIn() {
    this._card.setY(GAME_HEIGHT + 300);
    this.tweens.add({
      targets: this._card,
      y: GAME_HEIGHT / 2 - 20,
      duration: 500,
      ease: 'Back.easeOut',
    });
  }

  _goToGame() {
    this._maybeShowInterstitial(() => {
      this.scene.stop('GameOverScene');
      this.scene.stop('GameScene');
      this.scene.start('GameScene');
    });
  }

  _goToMenu() {
    this._maybeShowInterstitial(() => {
      this.scene.stop('GameOverScene');
      this.scene.stop('GameScene');
      adManager.showBanner();
      this.scene.start('MenuScene');
    });
  }

  _maybeShowInterstitial(cb) {
    if (adManager.isInterstitialDue()) {
      adManager.showInterstitial(() => cb());
    } else {
      cb();
    }
  }

  shutdown() {
    this.tweens.killAll();
  }
}
