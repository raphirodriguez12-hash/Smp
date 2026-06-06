import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GAME_BG_COLOR } from './config/constants.js';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { ShopScene } from './scenes/ShopScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: GAME_BG_COLOR,
  parent: 'game-container',
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, ShopScene],
  input: {
    activePointers: 3,
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
  },
};

const game = new Phaser.Game(config);

// Prevent context menu on long-press (mobile)
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Handle app visibility change - pause/resume
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.pause();
  } else {
    game.resume();
  }
});

export default game;
