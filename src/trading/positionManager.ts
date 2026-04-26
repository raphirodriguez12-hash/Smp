import { Connection, PublicKey } from '@solana/web3.js';
import { Position, BotConfig, SnipeTarget, TradeResult } from '../types';
import { JupiterTrader } from './jupiter';
import { getTokenBalance, shortenAddress } from '../utils/solana';
import { log } from '../utils/logger';

export class PositionManager {
  private positions: Map<string, Position> = new Map();
  private readonly trader: JupiterTrader;
  private readonly connection: Connection;
  private readonly config: BotConfig;
  private monitorIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(trader: JupiterTrader, connection: Connection, config: BotConfig) {
    this.trader = trader;
    this.connection = connection;
    this.config = config;
  }

  async openPosition(target: SnipeTarget, walletPublicKey: PublicKey): Promise<TradeResult> {
    const { event } = target;

    log.info(`SNIPE : ${event.symbol} (${shortenAddress(event.mint)}) par ${target.ruggerAlias ?? shortenAddress(target.ruggerWallet)}`, {
      mint: event.mint,
      creator: target.ruggerWallet,
    });

    const result = await this.trader.buy(event.mint, this.config.buyAmountSol);

    if (!result.success || !result.signature) {
      log.error('Échec du snipe', { mint: event.mint, error: result.error });
      return result;
    }

    const tokenBalance = await getTokenBalance(
      this.connection,
      walletPublicKey,
      new PublicKey(event.mint),
    );

    const position: Position = {
      mint: event.mint,
      symbol: event.symbol,
      name: event.name,
      buySignature: result.signature,
      solSpent: this.config.buyAmountSol,
      tokensReceived: tokenBalance,
      buyPriceSol: this.config.buyAmountSol / (tokenBalance || 1),
      openedAt: Date.now(),
      ruggerWallet: target.ruggerWallet,
    };

    this.positions.set(event.mint, position);

    log.info('Position ouverte', {
      symbol: event.symbol,
      mint: event.mint,
      solSpent: position.solSpent,
      tokens: tokenBalance,
    });

    if (this.config.autoSellEnabled) {
      this.startMonitoring(position, walletPublicKey);
    }

    return result;
  }

  private startMonitoring(position: Position, walletPublicKey: PublicKey): void {
    const CHECK_INTERVAL_MS = 5000;
    const mint = position.mint;

    // Auto-sell après délai maximum
    const autoSellTimeout = setTimeout(async () => {
      if (this.positions.has(mint)) {
        log.warn(`Délai max atteint, vente forcée : ${position.symbol}`, { mint });
        await this.closePosition(mint, walletPublicKey, 'timeout');
      }
    }, this.config.autoSellDelayMs);

    // Monitoring du prix pour TP/SL
    const interval = setInterval(async () => {
      const pos = this.positions.get(mint);
      if (!pos) {
        clearInterval(interval);
        clearTimeout(autoSellTimeout);
        return;
      }

      try {
        const currentValueSol = await this.trader.getTokenPriceInSol(mint, pos.tokensReceived);
        if (currentValueSol === null) return;

        const pnlPercent = ((currentValueSol - pos.solSpent) / pos.solSpent) * 100;

        log.debug(`[${pos.symbol}] PnL: ${pnlPercent.toFixed(2)}%`, {
          invested: pos.solSpent,
          currentValue: currentValueSol,
        });

        if (pnlPercent >= this.config.takeProfitPercent) {
          log.info(`TAKE PROFIT atteint : ${pos.symbol} (+${pnlPercent.toFixed(2)}%)`);
          clearInterval(interval);
          clearTimeout(autoSellTimeout);
          await this.closePosition(mint, walletPublicKey, 'take-profit');
        } else if (pnlPercent <= -this.config.stopLossPercent) {
          log.warn(`STOP LOSS atteint : ${pos.symbol} (${pnlPercent.toFixed(2)}%)`);
          clearInterval(interval);
          clearTimeout(autoSellTimeout);
          await this.closePosition(mint, walletPublicKey, 'stop-loss');
        }
      } catch (err) {
        log.debug('Erreur monitoring position', { mint, err: String(err) });
      }
    }, CHECK_INTERVAL_MS);

    this.monitorIntervals.set(mint, interval);
  }

  async closePosition(
    mint: string,
    walletPublicKey: PublicKey,
    reason: 'take-profit' | 'stop-loss' | 'timeout' | 'manual',
  ): Promise<TradeResult | null> {
    const position = this.positions.get(mint);
    if (!position) return null;

    const tokenBalance = await getTokenBalance(this.connection, walletPublicKey, new PublicKey(mint));
    if (tokenBalance === 0) {
      log.warn('Aucun token à vendre', { mint });
      this.positions.delete(mint);
      return null;
    }

    log.info(`Fermeture position [${reason}] : ${position.symbol}`, { mint, tokens: tokenBalance });

    const result = await this.trader.sell(mint, tokenBalance);

    if (result.success) {
      const pnlSol = (result.outputAmount ?? 0) - position.solSpent;
      const pnlPercent = (pnlSol / position.solSpent) * 100;
      log.info(`Position fermée : ${position.symbol} | PnL: ${pnlSol >= 0 ? '+' : ''}${pnlSol.toFixed(4)} SOL (${pnlPercent.toFixed(2)}%)`, {
        reason,
        signature: result.signature,
      });
    } else {
      log.error(`Échec de la vente : ${position.symbol}`, { error: result.error });
    }

    this.positions.delete(mint);
    const interval = this.monitorIntervals.get(mint);
    if (interval) {
      clearInterval(interval);
      this.monitorIntervals.delete(mint);
    }

    return result;
  }

  hasPosition(mint: string): boolean {
    return this.positions.has(mint);
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  async closeAll(walletPublicKey: PublicKey): Promise<void> {
    const mints = Array.from(this.positions.keys());
    log.info(`Fermeture de ${mints.length} position(s) ouvertes...`);
    for (const mint of mints) {
      await this.closePosition(mint, walletPublicKey, 'manual');
    }
  }
}
