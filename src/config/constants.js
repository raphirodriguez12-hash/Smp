// Game dimensions (portrait mobile)
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;

// World
export const GAME_BG_COLOR = 0x0a0a0f;
export const WALL_COLOR = 0x1a1a2e;
export const WALL_EDGE_COLOR = 0x16213e;

// Player
export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 28;
export const PLAYER_Y = GAME_HEIGHT * 0.72;
export const PLAYER_SPEED = 340;
export const PLAYER_LERP = 0.18;

// Obstacle rows
export const ROW_HEIGHT = 22;
export const ROW_SPAWN_Y = -60;
export const INITIAL_GAP_WIDTH = 130;
export const MIN_GAP_WIDTH = 62;
export const GAP_WIDTH_DECREASE_RATE = 0.012;

// Initial speeds
export const INITIAL_SCROLL_SPEED = 220;
export const MAX_SCROLL_SPEED = 680;
export const SPEED_INCREASE_RATE = 0.045;

// Obstacle spawn interval (ms)
export const INITIAL_SPAWN_INTERVAL = 1050;
export const MIN_SPAWN_INTERVAL = 380;

// Coins
export const COIN_SIZE = 14;
export const COIN_COLOR = 0xffd700;
export const COIN_BASE_REWARD = 1;
export const COIN_DISTANCE_BONUS = 0.008;
export const COIN_SCORE_BONUS = 0.003;

// Score
export const SCORE_PER_SECOND = 10;
export const SCORE_COIN_BONUS = 5;
export const SCORE_COMBO_MULTIPLIER = 1.5;

// Economy
export const COINS_PER_SECOND = 0.4;
export const COINS_PER_COIN_OBJECT = 3;
export const COINS_ROUND_BONUS_DIVISOR = 120;

// Ads
export const INTERSTITIAL_EVERY_N_GAMES = 3;
export const AD_MOCK_DELAY_MS = 2000;
export const REVIVE_COST_COINS = 0; // free via rewarded ad
export const DOUBLE_COINS_MULTIPLIER = 2;

// Chest system
export const CHEST_SPAWN_CHANCE = 0.12;
export const CHEST_COLOR = 0xffaa00;

// Color palette
export const COLORS = {
  bg: 0x0a0a0f,
  wall: 0x16213e,
  wallEdge: 0x0f3460,
  playerDefault: 0x4fffb0,
  coin: 0xffd700,
  ui: 0xffffff,
  uiDim: 0x888888,
  accent: 0x4fffb0,
  danger: 0xff4757,
  gold: 0xffd700,
  rare: 0x70a1ff,
  epic: 0xeccc68,
  neon: 0x2ed573,
  bgGradientTop: 0x070714,
  bgGradientBot: 0x0a0a1a,
};

// Z-depth layers
export const DEPTH = {
  bg: 0,
  bgDetails: 1,
  obstacles: 10,
  coins: 20,
  player: 30,
  particles: 40,
  hud: 100,
  overlay: 200,
};
