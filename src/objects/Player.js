import { PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, PLAYER_LERP, GAME_WIDTH, DEPTH } from '../config/constants.js';
import { skinSystem } from '../systems/SkinSystem.js';
import { audioManager } from '../systems/AudioManager.js';
import { vibrationManager } from '../systems/VibrationManager.js';
import { createExplosion, flashScreen } from '../utils/ParticleHelper.js';

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    scene.add.existing(this);

    this._skin = skinSystem.getEquippedSkin();
    this._targetX = x;
    this._alive = true;
    this._trailPoints = [];
    this._invincible = false;
    this._invincibleTimer = 0;

    this._buildBody();
    this._buildGlow();
    this._setupTrail();
    this.setDepth(DEPTH.player);
  }

  _buildBody() {
    const skin = this._skin;

    if (skin.shape === 'circle') {
      this._body = this.scene.add.circle(0, 0, PLAYER_WIDTH / 2, skin.color);
    } else if (skin.shape === 'diamond') {
      this._body = this.scene.add.polygon(0, 0, [
        [0, -PLAYER_HEIGHT / 2],
        [PLAYER_WIDTH / 2, 0],
        [0, PLAYER_HEIGHT / 2],
        [-PLAYER_WIDTH / 2, 0],
      ], skin.color);
    } else {
      this._body = this.scene.add.rectangle(0, 0, PLAYER_WIDTH, PLAYER_HEIGHT, skin.color);
    }

    this._body.setDepth(DEPTH.player);
    this.add(this._body);
  }

  _buildGlow() {
    const skin = this._skin;
    if (skin.shape === 'circle') {
      this._glow = this.scene.add.circle(0, 0, PLAYER_WIDTH / 2 + 6, skin.glowColor, 0.18);
    } else {
      this._glow = this.scene.add.rectangle(0, 0, PLAYER_WIDTH + 12, PLAYER_HEIGHT + 12, skin.glowColor, 0.18);
    }
    this._glow.setDepth(DEPTH.player - 1);
    this.add(this._glow);
  }

  _setupTrail() {
    this._trailGraphics = this.scene.add.graphics();
    this._trailGraphics.setDepth(DEPTH.player - 2);
  }

  get alive() { return this._alive; }
  get targetX() { return this._targetX; }

  moveLeft() {
    if (!this._alive) return;
    this._targetX = Math.max(PLAYER_WIDTH / 2 + 10, this._targetX - PLAYER_SPEED * 0.085);
  }

  moveRight() {
    if (!this._alive) return;
    this._targetX = Math.min(GAME_WIDTH - PLAYER_WIDTH / 2 - 10, this._targetX + PLAYER_SPEED * 0.085);
  }

  setTargetX(worldX) {
    if (!this._alive) return;
    this._targetX = Phaser.Math.Clamp(worldX, PLAYER_WIDTH / 2 + 10, GAME_WIDTH - PLAYER_WIDTH / 2 - 10);
  }

  makeInvincible(duration = 2000) {
    this._invincible = true;
    this._invincibleTimer = duration;
    this.scene.tweens.add({
      targets: [this._body, this._glow],
      alpha: { from: 1, to: 0.3 },
      yoyo: true,
      repeat: 5,
      duration: 150,
      onComplete: () => {
        if (this._body) this._body.setAlpha(1);
        if (this._glow) this._glow.setAlpha(0.18);
      },
    });
  }

  die() {
    if (!this._alive || this._invincible) return false;
    this._alive = false;

    audioManager.playDeath();
    vibrationManager.death();

    createExplosion(this.scene, this.x, this.y, this._skin.color, 24);
    flashScreen(this.scene, 0xff4757, 0.4, 250);
    this.scene.cameras.main.shake(300, 0.012);

    this.scene.tweens.add({
      targets: this,
      scale: 0,
      alpha: 0,
      angle: 180,
      duration: 350,
      ease: 'Back.easeIn',
    });

    return true;
  }

  revive(x, y) {
    this._alive = true;
    this.x = x;
    this.y = y;
    this._targetX = x;
    this.scale = 1;
    this.alpha = 1;
    this.angle = 0;
    this.makeInvincible(2000);
    audioManager.playRevive();
  }

  update(delta) {
    if (!this._alive) return;

    if (this._invincible) {
      this._invincibleTimer -= delta;
      if (this._invincibleTimer <= 0) {
        this._invincible = false;
      }
    }

    // Smooth horizontal movement
    const lerp = Math.min(PLAYER_LERP * (delta / 16.67), 0.25);
    this.x = Phaser.Math.Linear(this.x, this._targetX, lerp);

    // Pulse glow
    const t = this.scene.time.now * 0.003;
    this._glow.setAlpha(0.12 + Math.sin(t) * 0.06);

    // Update trail
    this._updateTrail();
  }

  _updateTrail() {
    const maxPoints = 12;
    this._trailPoints.unshift({ x: this.x, y: this.y });
    if (this._trailPoints.length > maxPoints) {
      this._trailPoints.pop();
    }

    this._trailGraphics.clear();
    if (this._trailPoints.length < 2) return;

    const color = this._skin.trailColor;
    for (let i = 0; i < this._trailPoints.length - 1; i++) {
      const alpha = (1 - i / this._trailPoints.length) * 0.5;
      const size = (1 - i / this._trailPoints.length) * (PLAYER_WIDTH * 0.45);
      this._trailGraphics.fillStyle(color, alpha);
      this._trailGraphics.fillRect(
        this._trailPoints[i].x - size / 2,
        this._trailPoints[i].y - size / 2,
        size, size
      );
    }
  }

  getHitBox() {
    return new Phaser.Geom.Rectangle(
      this.x - PLAYER_WIDTH / 2 + 4,
      this.y - PLAYER_HEIGHT / 2 + 4,
      PLAYER_WIDTH - 8,
      PLAYER_HEIGHT - 8
    );
  }

  destroy(fromScene) {
    this._trailGraphics.destroy();
    super.destroy(fromScene);
  }
}
