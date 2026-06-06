import { GAME_WIDTH, ROW_HEIGHT, DEPTH, COLORS } from '../config/constants.js';

export class ObstacleRow {
  constructor(scene, y, gapX, gapWidth, moving = false, movingSpeed = 60) {
    this.scene = scene;
    this.y = y;
    this.gapX = gapX;
    this.gapWidth = gapWidth;
    this.moving = moving;
    this.movingSpeed = movingSpeed;
    this._moveDir = Math.random() < 0.5 ? 1 : -1;
    this.passed = false;

    this._graphics = scene.add.graphics();
    this._graphics.setDepth(DEPTH.obstacles);
    this._draw();
  }

  _draw() {
    const g = this._graphics;
    g.clear();

    // Main wall (dark background)
    g.fillStyle(COLORS.wall, 1);
    g.fillRect(0, this.y - ROW_HEIGHT / 2, this.gapX, ROW_HEIGHT);
    g.fillRect(this.gapX + this.gapWidth, this.y - ROW_HEIGHT / 2, GAME_WIDTH - this.gapX - this.gapWidth, ROW_HEIGHT);

    // Edge highlight (top of wall)
    g.fillStyle(COLORS.wallEdge, 1);
    g.fillRect(0, this.y - ROW_HEIGHT / 2, this.gapX, 3);
    g.fillRect(this.gapX + this.gapWidth, this.y - ROW_HEIGHT / 2, GAME_WIDTH - this.gapX - this.gapWidth, 3);

    // Gap edges (neon outline)
    const edgeColor = 0x4fffb0;
    const edgeAlpha = 0.4;
    g.fillStyle(edgeColor, edgeAlpha);
    g.fillRect(this.gapX - 2, this.y - ROW_HEIGHT / 2, 2, ROW_HEIGHT);
    g.fillRect(this.gapX + this.gapWidth, this.y - ROW_HEIGHT / 2, 2, ROW_HEIGHT);

    // Warning strip on bottom of wall
    g.fillStyle(0x2d3436, 0.6);
    g.fillRect(0, this.y + ROW_HEIGHT / 2 - 4, this.gapX, 4);
    g.fillRect(this.gapX + this.gapWidth, this.y + ROW_HEIGHT / 2 - 4, GAME_WIDTH - this.gapX - this.gapWidth, 4);
  }

  update(delta, scrollSpeed) {
    const moveAmount = scrollSpeed * (delta / 1000);
    this.y += moveAmount;
    this._graphics.y = 0;

    if (this.moving) {
      const moveDelta = this.movingSpeed * this._moveDir * (delta / 1000);
      this.gapX += moveDelta;

      // Bounce at edges
      if (this.gapX <= 10) { this.gapX = 10; this._moveDir = 1; }
      if (this.gapX + this.gapWidth >= GAME_WIDTH - 10) {
        this.gapX = GAME_WIDTH - this.gapWidth - 10;
        this._moveDir = -1;
      }
    }

    this._draw();
    return this.y > this.scene.scale.height + 80;
  }

  get leftEdgeX() { return this.gapX; }
  get rightEdgeX() { return this.gapX + this.gapWidth; }

  overlapsPlayer(playerHitbox) {
    const rowTop = this.y - ROW_HEIGHT / 2;
    const rowBottom = this.y + ROW_HEIGHT / 2;
    const py = playerHitbox.centerY;
    const px = playerHitbox.centerX;
    const pr = playerHitbox.width / 2;

    if (py + pr < rowTop || py - pr > rowBottom) return false;
    const inGap = px > this.gapX + 3 && px < this.gapX + this.gapWidth - 3;
    return !inGap;
  }

  isPassed(playerY) {
    return !this.passed && this.y > playerY;
  }

  markPassed() {
    this.passed = true;
    // Flash gap edges on pass
    const t = this.scene.time.now;
    this.scene.tweens.add({
      targets: this._graphics,
      alpha: { from: 1.4, to: 1 },
      duration: 150,
    });
  }

  destroy() {
    this._graphics.destroy();
  }
}
