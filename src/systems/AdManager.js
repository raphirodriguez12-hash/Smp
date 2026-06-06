import { AD_MOCK_DELAY_MS, INTERSTITIAL_EVERY_N_GAMES } from '../config/constants.js';
import { storage } from '../utils/Storage.js';

/**
 * AdManager: mock implementation ready to be swapped for Capacitor AdMob.
 * In production, replace _showMockAd* methods with real Capacitor plugin calls.
 *
 * Real integration example (Capacitor AdMob):
 *   import { AdMob } from '@capacitor-community/admob';
 *   await AdMob.prepareRewardVideoAd({ adId: '...' });
 *   const result = await AdMob.showRewardVideoAd();
 */
class AdManager {
  constructor() {
    this._initialized = false;
    this._rewardedReady = false;
    this._interstitialReady = false;
    this._adsEnabled = true;
    this._bannerVisible = false;
  }

  async initialize() {
    console.log('[AdManager] Initialized (mock mode)');
    this._initialized = true;
    await this._loadRewarded();
    await this._loadInterstitial();
  }

  async _loadRewarded() {
    // In production: await AdMob.prepareRewardVideoAd({ adId: REWARDED_ID });
    this._rewardedReady = true;
  }

  async _loadInterstitial() {
    // In production: await AdMob.prepareInterstitial({ adId: INTERSTITIAL_ID });
    this._interstitialReady = true;
  }

  isInterstitialDue() {
    const games = storage.getGamesPlayed();
    return games > 0 && games % INTERSTITIAL_EVERY_N_GAMES === 0;
  }

  showBanner() {
    if (this._bannerVisible) return;
    const el = document.getElementById('banner-ad');
    if (el) {
      el.classList.add('visible');
      this._bannerVisible = true;
    }
  }

  hideBanner() {
    if (!this._bannerVisible) return;
    const el = document.getElementById('banner-ad');
    if (el) {
      el.classList.remove('visible');
      this._bannerVisible = false;
    }
  }

  async showInterstitial(onComplete) {
    if (!this._interstitialReady) {
      onComplete && onComplete(false);
      return;
    }
    await this._showMockInterstitial(onComplete);
    await this._loadInterstitial();
  }

  async showRewarded(onRewarded, onSkipped) {
    if (!this._rewardedReady) {
      onSkipped && onSkipped();
      return;
    }
    await this._showMockRewarded(onRewarded, onSkipped);
    await this._loadRewarded();
  }

  // Mock implementations — replace with real SDK calls in production
  _showMockInterstitial(onComplete) {
    return new Promise((resolve) => {
      const overlay = this._createAdOverlay('PUBLICITÉ INTERSTITIELLE', false);
      let elapsed = 0;
      const SKIP_AFTER = 5;
      const countdown = document.createElement('div');
      countdown.style.cssText = 'position:absolute;top:20px;right:20px;color:white;font-size:18px;font-family:Arial;';
      countdown.textContent = SKIP_AFTER;
      overlay.appendChild(countdown);

      const timer = setInterval(() => {
        elapsed++;
        countdown.textContent = Math.max(0, SKIP_AFTER - elapsed);
        if (elapsed >= SKIP_AFTER) {
          clearInterval(timer);
          document.body.removeChild(overlay);
          onComplete && onComplete(true);
          resolve();
        }
      }, 1000);
    });
  }

  _showMockRewarded(onRewarded, onSkipped) {
    return new Promise((resolve) => {
      const overlay = this._createAdOverlay('PUBLICITÉ RÉCOMPENSÉE', true);

      const btn = overlay.querySelector('#mock-ad-close');
      let elapsed = 0;
      const REWARD_AFTER = 5;
      let rewarded = false;

      const countdownEl = document.createElement('div');
      countdownEl.style.cssText = 'margin-top:20px;font-size:24px;color:#ffd700;font-family:Arial Black;';
      countdownEl.textContent = `Regardez ${REWARD_AFTER}s pour la récompense`;
      overlay.insertBefore(countdownEl, btn);

      btn.disabled = true;
      btn.textContent = `Fermer (${REWARD_AFTER}s)`;
      btn.style.opacity = '0.4';

      const timer = setInterval(() => {
        elapsed++;
        const remaining = REWARD_AFTER - elapsed;
        if (remaining <= 0) {
          clearInterval(timer);
          rewarded = true;
          btn.disabled = false;
          btn.textContent = 'Récupérer la récompense !';
          btn.style.opacity = '1';
          btn.style.background = '#ffd700';
          btn.style.color = '#000';
          countdownEl.textContent = '🎉 Récompense prête !';
        } else {
          btn.textContent = `Fermer (${remaining}s)`;
          countdownEl.textContent = `Regardez encore ${remaining}s...`;
        }
      }, 1000);

      btn.addEventListener('click', () => {
        clearInterval(timer);
        document.body.removeChild(overlay);
        if (rewarded) {
          onRewarded && onRewarded();
        } else {
          onSkipped && onSkipped();
        }
        resolve();
      });
    });
  }

  _createAdOverlay(title, hasCloseBtn) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.92);
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;z-index:9999;
      font-family:Arial,sans-serif;color:white;text-align:center;padding:20px;
    `;

    const label = document.createElement('div');
    label.style.cssText = 'font-size:13px;color:#888;margin-bottom:16px;text-transform:uppercase;letter-spacing:2px;';
    label.textContent = title;

    const adBox = document.createElement('div');
    adBox.style.cssText = `
      width:320px;height:250px;background:#1a1a2e;border:2px solid #333;
      border-radius:8px;display:flex;align-items:center;justify-content:center;
      color:#555;font-size:14px;margin:20px 0;
    `;
    adBox.textContent = '[ Espace Publicitaire ]';

    overlay.appendChild(label);
    overlay.appendChild(adBox);

    if (hasCloseBtn) {
      const btn = document.createElement('button');
      btn.id = 'mock-ad-close';
      btn.style.cssText = `
        padding:14px 36px;background:#333;color:white;border:none;
        border-radius:8px;font-size:16px;cursor:pointer;margin-top:10px;
      `;
      btn.textContent = 'Fermer';
      overlay.appendChild(btn);
    }

    document.body.appendChild(overlay);
    return overlay;
  }
}

export const adManager = new AdManager();
