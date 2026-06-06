import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants.js';
import { audioManager } from '../systems/AudioManager.js';
import { vibrationManager } from '../systems/VibrationManager.js';
import { adManager } from '../systems/AdManager.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Draw loading screen
    const bg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bg);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, 'STACK\nESCAPE', {
      fontSize: '56px',
      fontFamily: 'Arial Black, sans-serif',
      color: '#4fffb0',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4,
      lineSpacing: 4,
    });
    title.setOrigin(0.5);

    const loadingBar = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, GAME_WIDTH * 0.7, 6, 0x333333);
    const progressBar = this.add.rectangle(GAME_WIDTH / 2 - GAME_WIDTH * 0.35, GAME_HEIGHT / 2 + 60, 0, 6, COLORS.accent);
    progressBar.setOrigin(0, 0.5);

    const loadingTxt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 85, 'Chargement...', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#666666',
    });
    loadingTxt.setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.width = GAME_WIDTH * 0.7 * value;
    });

    // Generate game textures programmatically
    this._generateTextures();
  }

  _generateTextures() {
    // Particle pixel
    const pixelGfx = this.make.graphics({ x: 0, y: 0, add: false });
    pixelGfx.fillStyle(0xffffff, 1);
    pixelGfx.fillRect(0, 0, 4, 4);
    pixelGfx.generateTexture('pixel', 4, 4);
    pixelGfx.destroy();

    // Star particle
    const starGfx = this.make.graphics({ x: 0, y: 0, add: false });
    starGfx.fillStyle(0xffd700, 1);
    starGfx.fillCircle(3, 3, 3);
    starGfx.generateTexture('star', 6, 6);
    starGfx.destroy();
  }

  create() {
    audioManager.init();
    vibrationManager.init();
    adManager.initialize();

    // Short entrance animation then go to menu
    this.time.delayedCall(800, () => {
      this.scene.start('MenuScene');
    });
  }
}
