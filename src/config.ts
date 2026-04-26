import dotenv from 'dotenv';
import path from 'path';
import { BotConfig } from './types';

dotenv.config();

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Variable d'environnement manquante: ${key}`);
  return val;
}

function optionalEnv(key: string, defaultVal: string): string {
  return process.env[key] ?? defaultVal;
}

export function loadConfig(): BotConfig {
  return {
    rpcEndpoint: optionalEnv('RPC_ENDPOINT', 'https://api.mainnet-beta.solana.com'),
    rpcWsEndpoint: optionalEnv('RPC_WS_ENDPOINT', 'wss://api.mainnet-beta.solana.com'),
    privateKey: requireEnv('PRIVATE_KEY'),
    buyAmountSol: parseFloat(optionalEnv('BUY_AMOUNT_SOL', '0.1')),
    slippageBps: parseInt(optionalEnv('SLIPPAGE_BPS', '1500'), 10),
    priorityFeeMicrolamports: parseInt(optionalEnv('PRIORITY_FEE_MICROLAMPORTS', '100000'), 10),
    takeProfitPercent: parseFloat(optionalEnv('TAKE_PROFIT_PERCENT', '100')),
    stopLossPercent: parseFloat(optionalEnv('STOP_LOSS_PERCENT', '30')),
    autoSellDelayMs: parseInt(optionalEnv('AUTO_SELL_DELAY_MS', '60000'), 10),
    autoSellEnabled: optionalEnv('AUTO_SELL_ENABLED', 'true') === 'true',
    minLiquiditySol: parseFloat(optionalEnv('MIN_LIQUIDITY_SOL', '5')),
    maxHolders: parseInt(optionalEnv('MAX_HOLDERS', '0'), 10),
    checkMintRenounced: optionalEnv('CHECK_MINT_RENOUNCED', 'false') === 'true',
    ruggerWatchlistFile: path.resolve(optionalEnv('RUGGER_WATCHLIST_FILE', './config/ruggers.json')),
    watchlistMode: (optionalEnv('WATCHLIST_MODE', 'include') as 'include' | 'exclude'),
    axiomApiKey: process.env['AXIOM_API_KEY'],
    logLevel: optionalEnv('LOG_LEVEL', 'info'),
    logFile: optionalEnv('LOG_FILE', './logs/sniper.log'),
  };
}
