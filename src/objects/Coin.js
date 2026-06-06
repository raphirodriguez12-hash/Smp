import { COIN_SIZE, COIN_COLOR, DEPTH } from '../config/constants.js';
import { audioManager } from '../systems/AudioManager.js';
import { vibrationManager } from '../systems/VibrationManager.js';
import { createCoinBurst, spawnFloatingText } from '../utils/ParticleHelper.js';

export class Coin {
  constructor(scene, x, y) {
    this.scene = scene;
    this._x = x;
    this._y = y;
    this._collected = false;
    this._baseY = y;

    this._circle = scene.add.circle(x, y, COIN_SIZE / 2, COIN_COLOR);
    this._circle.setDepth(DEPTH.coins);

    // Shine
    this._shine = scene.add.circle(x - 2, y - 2, COIN_SIZE / 4, 0xfff176, 0.7);
    this._shine.setDepth(DEPTH.coins + 1);

    // Glow halo
    this._glow = scene.add.circle(x, y, COIN_SIZE / 2 + 5, COIN_COLOR, 0.2);
    this._glow.setDepth(DEPTH.coins - 1);
  }

  update(delta, scrollSpeed) {
    const moveAmount = scrollSpeed * (delta / 1000);
    this._y += moveAmount;

    // Float animation
    const floatOffset = Math.sin(this.scene.time.now * 0.004 + this._x) * 4;

    this._circle.setPosition(this._x, this._y + floatOffset);
    this._shine.setPosition(this._x - 2, this._y + floatOffset - 2);
    this._glow.setPosition(this._x, this._y + floatOffset);

    // Pulse glow
    const pulse = 0.15 + Math.sin(this.scene.time.now * 0.006) * 0.08;
    this._glow.setAlpha(pulse);

    return this._y > this.scene.scale.height + 60;
  }

  collect() {
    if (this._collected) return;
    this._collected = true;

    audioManager.playCoin();
    vibrationManager.coin();
    createCoinBurst(this.scene, this._circle.x, this._circle.y);

    this.scene.tweens.add({
      targets: [this._circle, this._shine, this._glow],
      scale: 1.8,
      alpha: 0,
      duration: 220,
      ease: 'Power2',
      onComplete: () => this.destroy(),
    });
  }

  get collected() { return this._collected; }
  get x() { return this._x; }
  get y() { return this._y; }

  getBounds() {
    return new Phaser.Geom.Circle(this._circle.x, this._circle.y, COIN_SIZE / 2 + 6);
  }

  destroy() {
    this._circle.destroy();
    this._shine.destroy();
    this._glow.destroy();
  }
}
