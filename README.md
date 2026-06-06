# Stack Escape

Endless vertical runner hyper-casual — évite les obstacles, collecte des pièces, bats ton score.

## Stack technique

- **Phaser 3** — moteur de jeu 2D
- **Vite** — build & dev server
- **Capacitor** — packaging Android/iOS natif

## Démarrage rapide

```bash
npm install
npm run dev        # dev server sur http://localhost:3000
npm run build      # build production dans dist/
npm run preview    # aperçu du build
```

## Build mobile (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm run build
npm run cap:add:android   # ou cap:add:ios
npm run cap:sync
npm run cap:open:android  # ouvre Android Studio
```

## Structure du projet

```
src/
  config/
    constants.js          toutes les constantes de jeu
    skins.js              catalogue des 9 skins
  scenes/
    BootScene.js          chargement initial
    MenuScene.js          menu principal
    GameScene.js          gameplay principal
    GameOverScene.js      écran de fin de partie
    ShopScene.js          boutique de skins
  objects/
    Player.js             joueur avec trail et hitbox
    ObstacleRow.js        rangée d'obstacle avec gap variable
    Coin.js               pièce collectible animée
  systems/
    AdManager.js          publicités (mock → AdMob production)
    AudioManager.js       sons procéduraux WebAudio
    VibrationManager.js   retour haptique
    DifficultySystem.js   courbe de difficulté dynamique
    EconomySystem.js      calcul des pièces gagnées
    SkinSystem.js         achat et équipement des skins
  ui/
    HUD.js                score, pièces, barre de vitesse
  utils/
    Storage.js            persistance localStorage
    ParticleHelper.js     explosions, textes flottants
```

## Intégration AdMob (production)

Remplacer les méthodes mock dans `src/systems/AdManager.js` par les appels Capacitor :

```bash
npm install @capacitor-community/admob
```

Les IDs publicitaires se configurent dans `capacitor.config.json`.

## Skins (9 total)

| Nom | Rareté | Prix |
|-----|--------|------|
| Cube | Commun | Gratuit |
| Flamme | Commun | 50 pièces |
| Glace | Commun | 50 pièces |
| Sphère | Rare | 150 pièces |
| Néon | Rare | 200 pièces |
| Or | Rare | 250 pièces |
| Glitch | Épique | 500 pièces |
| Diamant | Épique | 750 pièces |
| Vide | Épique | 900 pièces |

## Monétisation

- **Interstitiel** — toutes les 3 parties, après la fin d'un run
- **Récompensée x2** — doubler les pièces après chaque partie
- **Récompensée Revive** — revivre une fois par run
- **Bannière** — menu principal uniquement, jamais en jeu
