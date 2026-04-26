export interface TokenLaunchEvent {
  signature: string;
  mint: string;
  name: string;
  symbol: string;
  creator: string;
  bondingCurve: string;
  initialBuy: number;
  solAmount: number;
  marketCapSol: number;
  timestamp: number;
  uri?: string;
}

export interface SnipeTarget {
  event: TokenLaunchEvent;
  ruggerWallet: string;
  ruggerAlias?: string;
  detectedAt: number;
}

export interface TradeResult {
  success: boolean;
  signature?: string;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount?: number;
  error?: string;
}

export interface Position {
  mint: string;
  symbol: string;
  name: string;
  buySignature: string;
  solSpent: number;
  tokensReceived: number;
  buyPriceSol: number;
  openedAt: number;
  ruggerWallet: string;
}

export interface RuggerEntry {
  wallet: string;
  alias: string;
  rugsCount: number;
  lastRugAt?: string;
  notes?: string;
}

export interface BotConfig {
  rpcEndpoint: string;
  rpcWsEndpoint: string;
  privateKey: string;
  buyAmountSol: number;
  slippageBps: number;
  priorityFeeMicrolamports: number;
  takeProfitPercent: number;
  stopLossPercent: number;
  autoSellDelayMs: number;
  autoSellEnabled: boolean;
  minLiquiditySol: number;
  maxHolders: number;
  checkMintRenounced: boolean;
  ruggerWatchlistFile: string;
  watchlistMode: 'include' | 'exclude';
  axiomApiKey?: string;
  logLevel: string;
  logFile: string;
}
