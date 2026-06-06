import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTH } from '../config/constants.js';
import { storage } from '../utils/Storage.js';
import { audioManager } from '../systems/AudioManager.js';
import { vibrationManager } from '../systems/VibrationManager.js';
import { adManager } from '../systems/AdManager.js';
import { skinSystem } from '../systems/SkinSystem.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this._buildBackground();
    this._buildTitle();
    this._buildStats();
    this._buildButtons();
    this._buildSettings();
    this._buildAnimations();

    adManager.showBanner();
  }

  _buildBackground() {
    // Gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.bgGradientTop, COLORS.bgGradientTop, COLORS.bgGradientBot, COLORS.bgGradientBot, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Animated grid lines
    for (let i = 0; i < 8; i++) {
      const line = this.add.rectangle(
        GAME_WIDTH / 2, i * (GAME_HEIGHT / 7),
        GAME_WIDTH, 1, 0x4fffb0, 0.04 + Math.random() * 0.04
      );
    }
    for (let i = 0; i < 6; i++) {
      const line = this.add.rectangle(
        i * (GAME_WIDTH / 5), GAME_HEIGHT / 2,
        1, GAME_HEIGHT, 0x4fffb0, 0.03 + Math.random() * 0.03
      );
    }

    // Floating cubes decoration
    this._decorCubes = [];
    for (let i = 0; i < 6; i++) {
      const size = Phaser.Math.Between(12, 30);
      const cube = this.add.rectangle(
        Phaser.Math.Between(20, GAME_WIDTH - 20),
        Phaser.Math.Between(50, GAME_HEIGHT - 50),
        size, size,
        Phaser.Math.Between(0, 1) ? 0x4fffb0 : 0x70a1ff,
        0.08 + Math.random() * 0.08
      );
      cube.setAngle(Math.random() * 45);
      this._decorCubes.push(cube);

      this.tweens.add({
        targets: cube,
        y: cube.y - Phaser.Math.Between(30, 80),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        delay: Phaser.Math.Between(0, 2000),
        repeat: -1,
        repeatDelay: Phaser.Math.Between(500, 2000),
        onRepeat: () => {
          cube.y = Phaser.Math.Between(GAME_HEIGHT * 0.6, GAME_HEIGHT - 50);
          cube.alpha = 0.08 + Math.random() * 0.08;
        },
      });
    }
  }

  _buildTitle() {
    // Glow behind title
    const titleGlow = this.add.text(GAME_WIDTH / 2, 190, 'STACK\nESCAPE', {
      fontSize: '72px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#4fffb0',
      align: 'center',
      lineSpacing: 0,
    });
    titleGlow.setOrigin(0.5);
    titleGlow.setAlpha(0.08);
    titleGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Main title
    this._titleText = this.add.text(GAME_WIDTH / 2, 190, 'STACK\nESCAPE', {
      fontSize: '68px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 0,
      stroke: '#4fffb0',
      strokeThickness: 2,
    });
    this._titleText.setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 285, 'ENDLESS RUNNER', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#4fffb0',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Preview cube
    const skin = skinSystem.getEquippedSkin();
    this._previewCube = this.add.rectangle(GAME_WIDTH / 2, 345, 36, 36, skin.color);
    this._previewCube.setStrokeStyle(2, skin.glowColor, 0.6);

    this.tweens.add({
      targets: this._previewCube,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear',
    });

    this.tweens.add({
      targets: this._previewCube,
      y: 340,
      yoyo: true,
      duration: 1200,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  _buildStats() {
    const highScore = storage.getHighScore();
    const coins = storage.getCoins();

    // Stats row
    const statsBg = this.add.rectangle(GAME_WIDTH / 2, 405, GAME_WIDTH - 40, 54, 0xffffff, 0.04);
    statsBg.setStrokeStyle(1, 0xffffff, 0.08);

    // Best score
    this.add.text(GAME_WIDTH / 2 - 80, 395, 'MEILLEUR', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#666666', letterSpacing: 1,
    }).setOrigin(0.5, 0);

    this.add.text(GAME_WIDTH / 2 - 80, 410, highScore.toString(), {
      fontSize: '24px', fontFamily: 'Arial Black, sans-serif', color: '#ffffff',
    }).setOrigin(0.5, 0);

    // Divider
    this.add.rectangle(GAME_WIDTH / 2, 405, 1, 30, 0xffffff, 0.15);

    // Coins
    this.add.text(GAME_WIDTH / 2 + 80, 395, 'PIÈCES', {
      fontSize: '10px', fontFamily: 'Arial, sans-serif', color: '#666666', letterSpacing: 1,
    }).setOrigin(0.5, 0);

    this.add.circle(GAME_WIDTH / 2 + 55, 422, 8, COLORS.coin);

    this.add.text(GAME_WIDTH / 2 + 68, 421, coins.toString(), {
      fontSize: '22px', fontFamily: 'Arial Black, sans-serif', color: '#ffd700',
    }).setOrigin(0, 0.5);
  }

  _buildButtons() {
    // PLAY button
    this._playBtn = this._makeButton(
      GAME_WIDTH / 2, 510, 280, 70,
      '▶  JOUER', 0x4fffb0, 0x000000,
      () => {
        audioManager.playButton();
        vibrationManager.button();
        adManager.hideBanner();
        this.scene.start('GameScene');
      }
    );

    // SHOP button
    this._shopBtn = this._makeButton(
      GAME_WIDTH / 2, 598, 200, 52,
      '✦  BOUTIQUE', 0x16213e, 0x4fffb0,
      () => {
        audioManager.playButton();
        vibrationManager.button();
        this.scene.start('ShopScene');
      }
    );
  }

  _makeButton(x, y, w, h, label, bgColor, textColor, callback) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, w, h, bgColor, 1);
    bg.setStrokeStyle(2, Phaser.Display.Color.IntegerToColor(textColor === 0xffffff ? 0x4fffb0 : textColor).color, 0.6);

    const txt = this.add.text(0, 0, label, {
      fontSize: '22px',
      fontFamily: 'Arial Black, sans-serif',
      color: textColor === 0x000000 ? '#000000' : Phaser.Display.Color.IntegerToColor(textColor).rgba,
    });
    txt.setOrigin(0.5);

    container.add([bg, txt]);
    container.setSize(w, h);
    container.setInteractive({ cursor: 'pointer' });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scale: 0.93,
        duration: 80,
        yoyo: true,
        onComplete: callback,
      });
    });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.04, duration: 100 });
    });

    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1.0, duration: 100 });
    });

    return container;
  }

  _buildSettings() {
    const y = GAME_HEIGHT - 50;

    // Sound toggle
    this._soundIcon = this.add.text(GAME_WIDTH / 2 - 40, y, audioManager.isEnabled() ? '🔊' : '🔇', {
      fontSize: '24px',
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    this._soundIcon.on('pointerdown', () => {
      const enabled = !audioManager.isEnabled();
      audioManager.setEnabled(enabled);
      this._soundIcon.setText(enabled ? '🔊' : '🔇');
    });

    // Vibration toggle
    this._vibIcon = this.add.text(GAME_WIDTH / 2 + 40, y, vibrationManager.isEnabled() ? '📳' : '📴', {
      fontSize: '24px',
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    this._vibIcon.on('pointerdown', () => {
      const enabled = !vibrationManager.isEnabled();
      vibrationManager.setEnabled(enabled);
      this._vibIcon.setText(enabled ? '📳' : '📴');
    });

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 18, 'v1.0.0', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: '#333333',
    }).setOrigin(0.5);
  }

  _buildAnimations() {
    // Title breathing effect
    this.tweens.add({
      targets: this._titleText,
      scale: 1.02,
      yoyo: true,
      duration: 2000,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    // Play button pulse
    this.tweens.add({
      targets: this._playBtn,
      scaleX: 1.015,
      scaleY: 1.015,
      yoyo: true,
      duration: 900,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  shutdown() {
    this.tweens.killAll();
  }
}
