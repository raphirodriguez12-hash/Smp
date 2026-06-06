import { COINS_PER_SECOND, COINS_ROUND_BONUS_DIVISOR, COINS_PER_COIN_OBJECT } from '../config/constants.js';
import { storage } from '../utils/Storage.js';

export class EconomySystem {
  calculateRoundCoins(elapsedSeconds, coinsCollected, score) {
    const timePart = Math.floor(elapsedSeconds * COINS_PER_SECOND);
    const coinPart = coinsCollected * COINS_PER_COIN_OBJECT;
    const scorePart = Math.floor(score / COINS_ROUND_BONUS_DIVISOR);
    return Math.max(1, timePart + coinPart + scorePart);
  }

  awardRoundCoins(amount) {
    storage.addCoins(amount);
    return amount;
  }

  getBalance() {
    return storage.getCoins();
  }

  canAfford(cost) {
    return storage.getCoins() >= cost;
  }

  spend(amount) {
    return storage.spendCoins(amount);
  }
}

export const economySystem = new EconomySystem();
