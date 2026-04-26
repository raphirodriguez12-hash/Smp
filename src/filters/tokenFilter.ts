import { Connection, PublicKey } from '@solana/web3.js';
import { TokenLaunchEvent, BotConfig } from '../types';
import { getMintInfo } from '../utils/solana';
import { log } from '../utils/logger';

export class TokenFilter {
  private readonly config: BotConfig;
  private readonly connection: Connection;

  constructor(config: BotConfig, connection: Connection) {
    this.config = config;
    this.connection = connection;
  }

  async passes(event: TokenLaunchEvent): Promise<boolean> {
    // Filtre liquidité minimale
    if (event.solAmount < this.config.minLiquiditySol) {
      log.debug('Token rejeté : liquidité insuffisante', {
        mint: event.mint,
        liquidity: event.solAmount,
        min: this.config.minLiquiditySol,
      });
      return false;
    }

    // Vérification mint authority renoncée
    if (this.config.checkMintRenounced) {
      const mintInfo = await getMintInfo(this.connection, event.mint);
      if (mintInfo && mintInfo.mintAuthority !== null) {
        log.debug('Token rejeté : mint authority non renoncée', { mint: event.mint });
        return false;
      }
    }

    return true;
  }
}
