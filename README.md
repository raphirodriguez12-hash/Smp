# Leia — AI Trading Assistant

Analyse tes graphiques de trading avec l'IA. Envoie un screenshot, Leia te donne le signal (LONG/SHORT/WAIT), les niveaux d'entrée, TP1/TP2/TP3, Stop Loss et une analyse complète.

## Stack

- **Next.js 14** (App Router)
- **Claude claude-sonnet-4-6** avec vision (analyse d'images)
- **Tailwind CSS** (thème dark trading)
- **Vercel** (hébergement gratuit)

## Déploiement sur Vercel (gratuit)

### 1. Clone & install

```bash
git clone <ton-repo>
cd leia-trading-ai
npm install
```

### 2. Obtenir une clé API Anthropic

1. Va sur [console.anthropic.com](https://console.anthropic.com)
2. Crée un compte (gratuit pour commencer)
3. Génère une clé API

### 3. Déployer sur Vercel

1. Va sur [vercel.com](https://vercel.com) et connecte ton compte GitHub
2. Clique **New Project** → importe ce repo
3. Dans **Environment Variables**, ajoute :
   - `ANTHROPIC_API_KEY` = `sk-ant-api03-ta-clé-ici`
4. Clique **Deploy** — c'est tout !

### 4. Dev local (optionnel)

```bash
cp .env.example .env.local
# Édite .env.local avec ta vraie clé API
npm run dev
# Ouvre http://localhost:3000
```

## Fonctionnalités

- Upload par drag & drop, clic ou **Ctrl+V** (coller depuis clipboard)
- Détection automatique : asset, timeframe, patterns
- Signal clair : **LONG** / **SHORT** / **ATTENDRE**
- Score de confiance (%)
- Zone d'entrée recommandée
- TP1, TP2, TP3
- Stop Loss avec justification
- Ratio Risk:Reward
- Niveaux clés du graphique
- Analyse narrative de Leia
- Points d'attention / avertissements

## Notes

- Cette app est à but éducatif uniquement
- Tradez toujours avec votre propre gestion du risque
- Les analyses IA ne constituent pas des conseils financiers
