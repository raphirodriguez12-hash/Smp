import { GAME_WIDTH, GAME_HEIGHT, COLORS, DEPTH } from '../config/constants.js';
import { SKINS, RARITY_COLORS, RARITY_LABELS } from '../config/skins.js';
import { skinSystem } from '../systems/SkinSystem.js';
import { economySystem } from '../systems/EconomySystem.js';
import { storage } from '../utils/Storage.js';
import { audioManager } from '../systems/AudioManager.js';
import { vibrationManager } from '../systems/VibrationManager.js';
import { createExplosion } from '../utils/ParticleHelper.js';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    this._selectedSkin = skinSystem.getEquippedSkin();
    this._notification = null;

    this._buildBackground();
    this._buildHeader();
    this._buildPreview();
    this._buildGrid();
    this._buildActionArea();
    this._buildBackButton();
  }

  _buildBackground() {
    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.bgGradientTop, COLORS.bgGradientTop, 0x0d1520, 0x0d1520, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  _buildHeader() {
    this.add.text(GAME_WIDTH / 2, 42, 'BOUTIQUE', {
      fontSize: '28px', fontFamily: 'Arial Black, sans-serif', color: '#ffffff', letterSpacing: 3,
    }).setOrigin(0.5);

    // Coin balance
    this.add.circle(GAME_WIDTH - 52, 42, 10, COLORS.coin);
    this._balanceTxt = this.add.text(GAME_WIDTH - 38, 42, storage.getCoins().toString(), {
      fontSize: '20px', fontFamily: 'Arial Black, sans-serif', color: '#ffd700',
    });
    this._balanceTxt.setOrigin(0, 0.5);

    // Divider
    this.add.rectangle(GAME_WIDTH / 2, 68, GAME_WIDTH - 40, 1, 0xffffff, 0.08);
  }

  _buildPreview() {
    const previewY = 142;

    // Preview circle background
    this.add.circle(GAME_WIDTH / 2, previewY, 44, 0xffffff, 0.04).setStrokeStyle(1, 0x4fffb0, 0.2);

    // Preview skin object
    const skin = this._selectedSkin;
    if (skin.shape === 'circle') {
      this._previewObj = this.add.circle(GAME_WIDTH / 2, previewY, 24, skin.color);
    } else if (skin.shape === 'diamond') {
      this._previewObj = this.add.polygon(GAME_WIDTH / 2, previewY, [
        [0, -26], [22, 0], [0, 26], [-22, 0],
      ], skin.color);
    } else {
      this._previewObj = this.add.rectangle(GAME_WIDTH / 2, previewY, 44, 44, skin.color);
      this._previewObj.setStrokeStyle(2, skin.glowColor, 0.6);
    }

    this.tweens.add({
      targets: this._previewObj,
      angle: 360,
      duration: 3500,
      repeat: -1,
      ease: 'Linear',
    });

    // Skin name + rarity
    this._previewName = this.add.text(GAME_WIDTH / 2, previewY + 54, skin.name.toUpperCase(), {
      fontSize: '20px', fontFamily: 'Arial Black, sans-serif', color: '#ffffff',
    }).setOrigin(0.5);

    const rColor = '#' + RARITY_COLORS[skin.rarity].toString(16).padStart(6, '0');
    this._previewRarity = this.add.text(GAME_WIDTH / 2, previewY + 76, RARITY_LABELS[skin.rarity], {
      fontSize: '11px', fontFamily: 'Arial, sans-serif', color: rColor, letterSpacing: 2,
    }).setOrigin(0.5);
  }

  _buildGrid() {
    const COLS = 3;
    const CELL_W = 100;
    const CELL_H = 110;
    const GRID_START_X = (GAME_WIDTH - COLS * CELL_W) / 2 + CELL_W / 2;
    const GRID_START_Y = 260;
    const PAD = 12;

    const allSkins = skinSystem.getAllSkins();

    this._skinCards = [];

    allSkins.forEach((skin, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      const x = GRID_START_X + col * (CELL_W + PAD);
      const y = GRID_START_Y + row * (CELL_H + PAD);

      const card = this._buildSkinCard(x, y, skin, CELL_W, CELL_H);
      this._skinCards.push({ card, skin });
    });
  }

  _buildSkinCard(x, y, skin, w, h) {
    const container = this.add.container(x, y);
    const equipped = skinSystem.getEquippedSkin().id === skin.id;
    const owned = skin.owned;

    const rarityColor = RARITY_COLORS[skin.rarity];
    const borderAlpha = equipped ? 0.9 : owned ? 0.35 : 0.15;
    const bgAlpha = equipped ? 0.18 : 0.06;

    const bg = this.add.rectangle(0, 0, w, h, rarityColor, bgAlpha);
    bg.setStrokeStyle(2, equipped ? COLORS.accent : rarityColor, borderAlpha);

    // Skin mini-preview
    let preview;
    if (skin.shape === 'circle') {
      preview = this.add.circle(0, -10, 16, skin.color);
    } else if (skin.shape === 'diamond') {
      preview = this.add.polygon(0, -10, [[0, -16], [14, 0], [0, 16], [-14, 0]], skin.color);
    } else {
      preview = this.add.rectangle(0, -10, 30, 30, skin.color);
    }
    preview.setAlpha(owned ? 1 : 0.3);

    // Lock icon for unowned
    let lockTxt = null;
    if (!owned) {
      lockTxt = this.add.text(0, -10, '🔒', { fontSize: '16px' }).setOrigin(0.5);
    }

    // Name
    const nameTxt = this.add.text(0, 16, skin.name.toUpperCase(), {
      fontSize: '9px', fontFamily: 'Arial Black, sans-serif',
      color: owned ? '#ffffff' : '#666666',
    }).setOrigin(0.5);

    // Price or ÉQUIPÉ
    let priceTxt;
    if (equipped) {
      priceTxt = this.add.text(0, 30, 'ÉQUIPÉ ✓', {
        fontSize: '9px', fontFamily: 'Arial Black, sans-serif', color: '#4fffb0',
      }).setOrigin(0.5);
    } else if (owned) {
      priceTxt = this.add.text(0, 30, 'POSSÉDE', {
        fontSize: '9px', fontFamily: 'Arial, sans-serif', color: '#888888',
      }).setOrigin(0.5);
    } else {
      const coinDot = this.add.circle(-14, 30, 5, COLORS.coin);
      priceTxt = this.add.text(-6, 30, skin.cost.toString(), {
        fontSize: '11px', fontFamily: 'Arial Black, sans-serif', color: '#ffd700',
      }).setOrigin(0, 0.5);
      container.add(coinDot);
    }

    const parts = [bg, preview, nameTxt, priceTxt];
    if (lockTxt) parts.push(lockTxt);
    container.add(parts);

    container.setSize(w, h);
    container.setInteractive({ cursor: 'pointer' });
    container.on('pointerdown', () => this._selectSkin(skin));

    return container;
  }

  _selectSkin(skin) {
    audioManager.playButton();
    vibrationManager.button();

    this._selectedSkin = skin;
    this._updatePreview(skin);
    this._updateActionArea(skin);

    // Highlight selected card
    this._skinCards.forEach(({ card, skin: s }) => {
      card.setScale(s.id === skin.id ? 1.06 : 1.0);
    });
  }

  _updatePreview(skin) {
    if (this._previewObj) this._previewObj.destroy();

    const previewY = 142;
    if (skin.shape === 'circle') {
      this._previewObj = this.add.circle(GAME_WIDTH / 2, previewY, 24, skin.color);
    } else if (skin.shape === 'diamond') {
      this._previewObj = this.add.polygon(GAME_WIDTH / 2, previewY, [
        [0, -26], [22, 0], [0, 26], [-22, 0],
      ], skin.color);
    } else {
      this._previewObj = this.add.rectangle(GAME_WIDTH / 2, previewY, 44, 44, skin.color);
      this._previewObj.setStrokeStyle(2, skin.glowColor, 0.6);
    }

    this.tweens.add({
      targets: this._previewObj,
      angle: 360,
      duration: 3500,
      repeat: -1,
      ease: 'Linear',
    });

    this._previewName.setText(skin.name.toUpperCase());
    const rColor = '#' + RARITY_COLORS[skin.rarity].toString(16).padStart(6, '0');
    this._previewRarity.setText(RARITY_LABELS[skin.rarity]).setColor(rColor);
  }

  _buildActionArea() {
    this._actionContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 68);

    const skin = this._selectedSkin;
    this._actionBtn = this._makeActionButton(skin);
    this._actionContainer.add(this._actionBtn);
  }

  _updateActionArea(skin) {
    this._actionContainer.removeAll(true);
    this._actionBtn = this._makeActionButton(skin);
    this._actionContainer.add(this._actionBtn);
  }

  _makeActionButton(skin) {
    const owned = skinSystem.hasSkin(skin.id);
    const equipped = skinSystem.getEquippedSkin().id === skin.id;

    const container = this.add.container(0, 0);

    let label, bgColor, textColor;
    if (equipped) {
      label = '✓ ÉQUIPÉ';
      bgColor = 0x1a2e1a;
      textColor = '#4fffb0';
    } else if (owned) {
      label = '▶  ÉQUIPER';
      bgColor = 0x4fffb0;
      textColor = '#000000';
    } else {
      const canAfford = economySystem.canAfford(skin.cost);
      label = canAfford ? `ACHETER  •  ${skin.cost} 🪙` : `${skin.cost} 🪙  (manque ${skin.cost - storage.getCoins()})`;
      bgColor = canAfford ? 0xffd700 : 0x2d3436;
      textColor = canAfford ? '#000000' : '#666666';
    }

    const bg = this.add.rectangle(0, 0, 270, 58, bgColor, 1);
    bg.setStrokeStyle(1, 0x4fffb0, 0.2);

    const txt = this.add.text(0, 0, label, {
      fontSize: '17px', fontFamily: 'Arial Black, sans-serif', color: textColor,
    }).setOrigin(0.5);

    container.add([bg, txt]);
    container.setSize(270, 58);
    container.setInteractive({ cursor: 'pointer' });

    container.on('pointerdown', () => {
      if (equipped) return;

      if (owned) {
        skinSystem.equipSkin(skin.id);
        audioManager.playButton();
        vibrationManager.medium();
        this._refreshGrid();
        this._updateActionArea(skin);
        this._showNotification('Skin équipé !', '#4fffb0');
      } else {
        const result = skinSystem.buySkin(skin.id);
        if (result.success) {
          audioManager.playChestOpen();
          vibrationManager.heavy();
          createExplosion(this, GAME_WIDTH / 2, GAME_HEIGHT - 68, skin.color, 16);
          this._balanceTxt.setText(storage.getCoins().toString());
          this._refreshGrid();
          this._updateActionArea(skin);
          this._showNotification(`${skin.name} débloqué !`, '#ffd700');
        } else {
          audioManager.playDeath();
          vibrationManager.light();
          this._showNotification(result.reason, '#ff4757');
          this.tweens.add({ targets: container, x: { from: -8, to: 8 }, yoyo: true, repeat: 3, duration: 50 });
        }
      }
    });

    return container;
  }

  _refreshGrid() {
    this._skinCards.forEach(({ card }) => card.destroy());
    this._skinCards = [];
    const allSkins = skinSystem.getAllSkins();
    const COLS = 3;
    const CELL_W = 100;
    const CELL_H = 110;
    const GRID_START_X = (GAME_WIDTH - COLS * CELL_W) / 2 + CELL_W / 2;
    const GRID_START_Y = 260;
    const PAD = 12;

    allSkins.forEach((skin, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      const x = GRID_START_X + col * (CELL_W + PAD);
      const y = GRID_START_Y + row * (CELL_H + PAD);
      const card = this._buildSkinCard(x, y, skin, CELL_W, CELL_H);
      this._skinCards.push({ card, skin });
    });
  }

  _showNotification(msg, color) {
    if (this._notification) this._notification.destroy();

    this._notification = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 130, msg, {
      fontSize: '15px', fontFamily: 'Arial Black, sans-serif', color,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(DEPTH.overlay);

    this.tweens.add({
      targets: this._notification,
      y: GAME_HEIGHT - 155,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => { if (this._notification) { this._notification.destroy(); this._notification = null; } },
    });
  }

  _buildBackButton() {
    const btn = this.add.text(28, 42, '←', {
      fontSize: '26px', fontFamily: 'Arial, sans-serif', color: '#888888',
    }).setOrigin(0, 0.5).setInteractive({ cursor: 'pointer' });

    btn.on('pointerdown', () => {
      audioManager.playButton();
      vibrationManager.button();
      this.scene.start('MenuScene');
    });

    btn.on('pointerover', () => btn.setColor('#ffffff'));
    btn.on('pointerout', () => btn.setColor('#888888'));
  }

  shutdown() {
    this.tweens.killAll();
  }
}
