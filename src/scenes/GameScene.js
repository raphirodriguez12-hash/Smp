import {
  GAME_WIDTH, GAME_HEIGHT, DEPTH, COLORS,
  PLAYER_Y, SCORE_PER_SECOND,
} from '../config/constants.js';
import { Player } from '../objects/Player.js';
import { ObstacleRow } from '../objects/ObstacleRow.js';
import { Coin } from '../objects/Coin.js';
import { HUD } from '../ui/HUD.js';
import { DifficultySystem } from '../systems/DifficultySystem.js';
import { economySystem } from '../systems/EconomySystem.js';
import { audioManager } from '../systems/AudioManager.js';
import { vibrationManager } from '../systems/VibrationManager.js';
import { spawnFloatingText } from '../utils/ParticleHelper.js';
import { storage } from '../utils/Storage.js';

const STATE = { PLAYING: 'playing', DEAD: 'dead', COUNTDOWN: 'countdown' };

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this._state = STATE.COUNTDOWN;
    this._score = 0;
    this._coinsCollected = 0;
    this._obstacles = [];
    this._coins = [];
    this._lastSpawnTime = 0;
    this._elapsedGameTime = 0;
    this._isRevived = false;
    this._comboCount = 0;

    this._difficulty = new DifficultySystem();

    this._buildBackground();
    this._buildPlayer();
    this._buildHUD();
    this._buildInputs();
    this._buildCountdown();

    audioManager.playStart();
  }

  _buildBackground() {
    // BG gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.bgGradientTop, COLORS.bgGradientTop, COLORS.bgGradientBot, COLORS.bgGradientBot, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(DEPTH.bg);
    bg.setScrollFactor(0);

    // Vertical guide lines (subtle)
    const linesGfx = this.add.graphics();
    linesGfx.setDepth(DEPTH.bgDetails);
    linesGfx.setScrollFactor(0);
    linesGfx.lineStyle(1, 0x4fffb0, 0.04);
    for (let x = 0; x <= GAME_WIDTH; x += 48) {
      linesGfx.lineBetween(x, 0, x, GAME_HEIGHT);
    }
  }

  _buildPlayer() {
    this._player = new Player(this, GAME_WIDTH / 2, PLAYER_Y);
  }

  _buildHUD() {
    this._hud = new HUD(this);
  }

  _buildInputs() {
    // Touch input
    this.input.on('pointerdown', (pointer) => {
      if (this._state !== STATE.PLAYING) return;
      if (pointer.x < GAME_WIDTH / 2) {
        this._movingLeft = true;
      } else {
        this._movingRight = true;
      }
    });

    this.input.on('pointerup', () => {
      this._movingLeft = false;
      this._movingRight = false;
    });

    this.input.on('pointermove', (pointer) => {
      if (this._state !== STATE.PLAYING || !pointer.isDown) return;
      this._player.setTargetX(pointer.x);
    });

    // Keyboard
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  _buildCountdown() {
    const nums = ['3', '2', '1', 'GO!'];
    const colors = ['#ffffff', '#ffffff', '#ffffff', '#4fffb0'];

    let i = 0;
    const show = () => {
      if (i >= nums.length) {
        this._state = STATE.PLAYING;
        return;
      }

      const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, nums[i], {
        fontSize: nums[i] === 'GO!' ? '72px' : '88px',
        fontFamily: 'Arial Black, sans-serif',
        color: colors[i],
        stroke: '#000000',
        strokeThickness: 6,
      });
      txt.setOrigin(0.5);
      txt.setDepth(DEPTH.overlay);
      txt.setScrollFactor(0);

      this.tweens.add({
        targets: txt,
        scale: { from: 1.4, to: 0.6 },
        alpha: { from: 1, to: 0 },
        duration: 550,
        ease: 'Power2',
        onComplete: () => { txt.destroy(); i++; show(); },
      });
    };

    show();
  }

  update(time, delta) {
    if (this._state === STATE.COUNTDOWN) return;
    if (this._state === STATE.DEAD) return;

    this._elapsedGameTime += delta;
    this._difficulty.update(delta);

    this._handleInput(delta);
    this._player.update(delta);
    this._updateObstacles(delta, time);
    this._updateCoins(delta);
    this._updateScore(delta);
    this._checkCollisions();
    this._spawnObstacles(time);
    this._cleanupOffscreen();
    this._updateHUD();
    this._checkDifficultyLevelUp();
  }

  _handleInput(delta) {
    const speed = 5.5;

    if ((this._cursors.left.isDown || this._wasd.left.isDown) || this._movingLeft) {
      this._player.moveLeft();
    }
    if ((this._cursors.right.isDown || this._wasd.right.isDown) || this._movingRight) {
      this._player.moveRight();
    }
  }

  _spawnObstacles(time) {
    const interval = this._difficulty.spawnInterval;
    if (time - this._lastSpawnTime < interval) return;
    this._lastSpawnTime = time;

    const pattern = this._difficulty.getPatternForRow();
    const row = new ObstacleRow(
      this,
      -40,
      pattern.gapX,
      pattern.gapWidth,
      pattern.moving,
      this._difficulty.movingObstacleSpeed
    );
    this._obstacles.push(row);

    // Maybe spawn a coin in the gap
    if (Math.random() < 0.55) {
      const coinX = pattern.gapX + pattern.gapWidth / 2 + Phaser.Math.Between(-20, 20);
      const coinY = -40;
      const coin = new Coin(this, coinX, coinY);
      this._coins.push(coin);
    }
  }

  _updateObstacles(delta, time) {
    const speed = this._difficulty.scrollSpeed;
    for (const row of this._obstacles) {
      const offscreen = row.update(delta, speed);
    }
  }

  _updateCoins(delta) {
    const speed = this._difficulty.scrollSpeed;
    for (const coin of this._coins) {
      coin.update(delta, speed);
    }
  }

  _updateScore(delta) {
    const points = SCORE_PER_SECOND * (delta / 1000) * this._difficulty.speedMultiplier;
    this._score += points;
  }

  _checkCollisions() {
    if (!this._player.alive) return;

    const playerBox = this._player.getHitBox();

    // Obstacle collisions
    for (const row of this._obstacles) {
      if (row.overlapsPlayer(playerBox)) {
        this._killPlayer();
        return;
      }

      // Check if player passed through gap
      if (row.isPassed(this._player.y)) {
        row.markPassed();
        this._comboCount++;
        if (this._comboCount >= 5) {
          audioManager.playPerfectPass();
          spawnFloatingText(this, this._player.x, this._player.y - 30, `×${this._comboCount}`, '#ffd700');
        }
      }
    }

    // Coin collisions
    for (const coin of this._coins) {
      if (coin.collected) continue;
      const bounds = coin.getBounds();
      if (Phaser.Geom.Circle.Contains(bounds, playerBox.centerX, playerBox.centerY)) {
        coin.collect();
        this._coinsCollected++;
        this._score += 5;
        spawnFloatingText(this, coin.x, coin.y - 10, '+3', '#ffd700', 16);
      }
    }
  }

  _killPlayer() {
    if (!this._player.die()) return;
    this._state = STATE.DEAD;

    this.time.delayedCall(600, () => {
      this._showDeathScreen();
    });
  }

  _showDeathScreen() {
    // Calculate final coins for this run
    const coinsEarned = economySystem.calculateRoundCoins(
      this._elapsedGameTime / 1000,
      this._coinsCollected,
      Math.floor(this._score)
    );

    const finalScore = Math.floor(this._score);
    const newBest = finalScore > storage.getHighScore();

    if (newBest) {
      storage.setHighScore(finalScore);
    }

    storage.incrementGames();

    this.scene.launch('GameOverScene', {
      score: finalScore,
      coinsEarned,
      newBest,
      elapsedSeconds: this._elapsedGameTime / 1000,
      coinsCollected: this._coinsCollected,
      isRevived: this._isRevived,
      onRevive: () => this._revivePlayer(),
    });
  }

  _revivePlayer() {
    if (this._isRevived) return; // Only one revive per run
    this._isRevived = true;
    this._state = STATE.PLAYING;

    // Clear nearby obstacles
    this._obstacles.forEach(o => {
      if (o.y < PLAYER_Y + 120 && o.y > PLAYER_Y - 120) {
        o.destroy();
      }
    });
    this._obstacles = this._obstacles.filter(o => {
      const alive = !(o.y < PLAYER_Y + 120 && o.y > PLAYER_Y - 120);
      return alive;
    });

    this._player.revive(GAME_WIDTH / 2, PLAYER_Y);
    this.scene.stop('GameOverScene');
  }

  _cleanupOffscreen() {
    this._obstacles = this._obstacles.filter(row => {
      if (row.y > GAME_HEIGHT + 80) { row.destroy(); return false; }
      return true;
    });

    this._coins = this._coins.filter(coin => {
      if (coin.collected) return false;
      if (coin.y > GAME_HEIGHT + 60) { coin.destroy(); return false; }
      return true;
    });
  }

  _updateHUD() {
    this._hud.updateScore(this._score);
    this._hud.updateCoins(storage.getCoins());

    const speedFraction = (this._difficulty.scrollSpeed - 220) / (680 - 220);
    this._hud.updateSpeedBar(Phaser.Math.Clamp(speedFraction, 0, 1));
  }

  _checkDifficultyLevelUp() {
    if (this._difficulty.didLevelUp()) {
      const label = this._difficulty.getDifficultyLabel();
      this._hud.showLevelUp(`⚡ ${label.text}`, label.color);
      audioManager.playSpeedUp();
    }
  }

  shutdown() {
    this._hud.destroy();
    this._obstacles.forEach(o => o.destroy());
    this._coins.forEach(c => c.destroy());
    this._player.destroy();
    this.tweens.killAll();
  }
}
