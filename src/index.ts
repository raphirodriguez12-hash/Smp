import { Connection } from '@solana/web3.js';
import { loadConfig } from './config';
import { initLogger, log } from './utils/logger';
import { createKeypairFromBase58, getSolBalance, shortenAddress } from './utils/solana';
import { PumpFunMonitor } from './monitors/pumpfun';
import { RuggerFilter } from './filters/ruggerFilter';
import { TokenFilter } from './filters/tokenFilter';
import { JupiterTrader } from './trading/jupiter';
import { PositionManager } from './trading/positionManager';
import { TokenLaunchEvent } from './types';

async function main(): Promise<void> {
  const config = loadConfig();
  initLogger(config.logLevel, config.logFile);

  log.info('=== RUGGER SNIPER BOT ===');
  log.info('Démarrage...', {
    buyAmount: `${config.buyAmountSol} SOL`,
    takeProfit: `+${config.takeProfitPercent}%`,
    stopLoss: `-${config.stopLossPercent}%`,
    watchlistMode: config.watchlistMode,
    autoSell: config.autoSellEnabled,
  });

  // Connexion Solana
  const connection = new Connection(config.rpcEndpoint, {
    commitment: 'confirmed',
    wsEndpoint: config.rpcWsEndpoint,
  });

  // Wallet
  const wallet = createKeypairFromBase58(config.privateKey);
  const pubkey = wallet.publicKey;
  const balance = await getSolBalance(connection, pubkey);

  log.info('Wallet initialisé', {
    adresse: pubkey.toString(),
    balance: `${balance.toFixed(4)} SOL`,
  });

  if (balance < config.buyAmountSol) {
    log.warn('Balance insuffisante pour sniper', {
      balance,
      required: config.buyAmountSol,
    });
  }

  // Composants
  const ruggerFilter = new RuggerFilter(config);
  const tokenFilter = new TokenFilter(config, connection);
  const trader = new JupiterTrader(connection, wallet, config);
  const positionManager = new PositionManager(trader, connection, config);
  const monitor = new PumpFunMonitor();

  log.info(`${ruggerFilter.size()} rugger(s) dans la watchlist`);

  // Pipeline principal : token détecté → filtres → snipe
  monitor.on('token', async (event: TokenLaunchEvent) => {
    // 1. Filtre rugger
    const target = ruggerFilter.evaluate(event);
    if (!target) return;

    log.info(`RUGGER DETECTE : ${target.ruggerAlias ?? shortenAddress(target.ruggerWallet)} lance ${event.symbol}`, {
      mint: event.mint,
      rugger: target.ruggerWallet,
    });

    // 2. Éviter les doublons
    if (positionManager.hasPosition(event.mint)) {
      log.debug('Position déjà ouverte sur ce mint', { mint: event.mint });
      return;
    }

    // 3. Filtres token
    const ok = await tokenFilter.passes(event);
    if (!ok) {
      log.info('Token rejeté par le filtre', { mint: event.mint, symbol: event.symbol });
      return;
    }

    // 4. Vérifier la balance avant snipe
    const currentBalance = await getSolBalance(connection, pubkey);
    if (currentBalance < config.buyAmountSol) {
      log.error('Balance insuffisante pour sniper ce token', {
        balance: currentBalance,
        required: config.buyAmountSol,
      });
      return;
    }

    // 5. Snipe !
    await positionManager.openPosition(target, pubkey);
  });

  monitor.on('fatal', (err: Error) => {
    log.error('Erreur fatale du moniteur', { err: err.message });
    process.exit(1);
  });

  // Démarrage
  monitor.start();
  log.info('Bot démarré. En attente de nouveaux tokens...');

  // Gestion arrêt propre
  const shutdown = async (signal: string) => {
    log.info(`Signal reçu : ${signal}. Arrêt en cours...`);
    monitor.stop();
    await positionManager.closeAll(pubkey);
    log.info('Bot arrêté proprement.');
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Affichage périodique des positions ouvertes
  setInterval(() => {
    const positions = positionManager.getPositions();
    if (positions.length > 0) {
      log.info(`Positions ouvertes : ${positions.length}`, {
        tokens: positions.map(p => `${p.symbol} (${shortenAddress(p.mint)})`),
      });
    }
  }, 30000);
}

main().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
