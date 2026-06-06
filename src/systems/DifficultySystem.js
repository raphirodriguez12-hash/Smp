import {
  INITIAL_SCROLL_SPEED, MAX_SCROLL_SPEED, SPEED_INCREASE_RATE,
  INITIAL_SPAWN_INTERVAL, MIN_SPAWN_INTERVAL,
  INITIAL_GAP_WIDTH, MIN_GAP_WIDTH, GAP_WIDTH_DECREASE_RATE,
  GAME_WIDTH,
} from '../config/constants.js';

export class DifficultySystem {
  constructor() {
    this.elapsedSeconds = 0;
    this.level = 0;
    this.lastSpeedUpLevel = -1;
  }

  reset() {
    this.elapsedSeconds = 0;
    this.level = 0;
    this.lastSpeedUpLevel = -1;
  }

  update(deltaMs) {
    this.elapsedSeconds += deltaMs / 1000;
    this.level = Math.floor(this.elapsedSeconds / 8);
  }

  get scrollSpeed() {
    const raw = INITIAL_SCROLL_SPEED + this.elapsedSeconds * SPEED_INCREASE_RATE * 60;
    return Math.min(raw, MAX_SCROLL_SPEED);
  }

  get spawnInterval() {
    const reduction = this.elapsedSeconds * 3.5;
    return Math.max(INITIAL_SPAWN_INTERVAL - reduction, MIN_SPAWN_INTERVAL);
  }

  get gapWidth() {
    const decrease = this.elapsedSeconds * GAP_WIDTH_DECREASE_RATE * 60;
    return Math.max(INITIAL_GAP_WIDTH - decrease, MIN_GAP_WIDTH);
  }

  get hasMovingObstacles() {
    return this.elapsedSeconds > 15;
  }

  get hasDoubleGaps() {
    return this.elapsedSeconds > 35;
  }

  get movingObstacleSpeed() {
    const base = 60;
    const bonus = Math.min((this.elapsedSeconds - 15) * 2, 80);
    return base + bonus;
  }

  get speedMultiplier() {
    return this.scrollSpeed / INITIAL_SCROLL_SPEED;
  }

  didLevelUp() {
    if (this.level > this.lastSpeedUpLevel) {
      this.lastSpeedUpLevel = this.level;
      return true;
    }
    return false;
  }

  getPatternForRow() {
    const t = this.elapsedSeconds;
    const gapW = this.gapWidth;
    const maxGapX = GAME_WIDTH - gapW;

    if (t < 5) {
      return { gapX: GAME_WIDTH / 2 - gapW / 2, gapWidth: gapW, moving: false };
    }

    const patterns = ['left', 'center', 'right', 'random'];
    const pick = patterns[Math.floor(Math.random() * (t < 12 ? 3 : patterns.length))];

    let gapX;
    if (pick === 'left') gapX = Phaser.Math.Between(20, maxGapX * 0.4);
    else if (pick === 'center') gapX = GAME_WIDTH / 2 - gapW / 2 + Phaser.Math.Between(-30, 30);
    else if (pick === 'right') gapX = Phaser.Math.Between(maxGapX * 0.6, maxGapX - 20);
    else gapX = Phaser.Math.Between(20, maxGapX - 20);

    gapX = Phaser.Math.Clamp(gapX, 20, maxGapX - 20);

    const moving = this.hasMovingObstacles && Math.random() < 0.35;

    return { gapX, gapWidth: gapW, moving };
  }

  getDifficultyLabel() {
    if (this.elapsedSeconds < 10) return { text: 'FACILE', color: '#4fffb0' };
    if (this.elapsedSeconds < 25) return { text: 'NORMAL', color: '#ffd700' };
    if (this.elapsedSeconds < 45) return { text: 'DIFFICILE', color: '#ff7675' };
    return { text: 'EXTRÊME', color: '#ff4757' };
  }
}
