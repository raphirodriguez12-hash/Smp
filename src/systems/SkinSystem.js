import { SKINS } from '../config/skins.js';
import { storage } from '../utils/Storage.js';
import { economySystem } from './EconomySystem.js';

class SkinSystem {
  getAllSkins() {
    const owned = storage.getOwnedSkins();
    return SKINS.map(s => ({ ...s, owned: owned.includes(s.id) }));
  }

  getEquippedSkin() {
    const id = storage.getEquippedSkin();
    return SKINS.find(s => s.id === id) || SKINS[0];
  }

  buySkin(id) {
    const skin = SKINS.find(s => s.id === id);
    if (!skin) return { success: false, reason: 'Skin introuvable' };
    if (storage.hasSkin(id)) return { success: false, reason: 'Déjà possédé' };
    if (!economySystem.canAfford(skin.cost)) {
      return { success: false, reason: 'Pas assez de pièces' };
    }
    economySystem.spend(skin.cost);
    storage.addOwnedSkin(id);
    return { success: true };
  }

  equipSkin(id) {
    if (!storage.hasSkin(id)) return false;
    storage.equipSkin(id);
    return true;
  }

  hasSkin(id) {
    return storage.hasSkin(id);
  }
}

export const skinSystem = new SkinSystem();
