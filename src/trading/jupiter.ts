import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import axios from 'axios';
import { TradeResult, BotConfig } from '../types';
import { log } from '../utils/logger';

const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote';
const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  routePlan: unknown[];
}

export class JupiterTrader {
  private readonly connection: Connection;
  private readonly wallet: Keypair;
  private readonly config: BotConfig;

  constructor(connection: Connection, wallet: Keypair, config: BotConfig) {
    this.connection = connection;
    this.wallet = wallet;
    this.config = config;
  }

  async buy(mintAddress: string, solAmount: number): Promise<TradeResult> {
    const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

    try {
      log.info('Récupération du quote Jupiter (BUY)', { mint: mintAddress, solAmount });

      const quote = await this.getQuote(SOL_MINT, mintAddress, lamports);
      if (!quote) {
        return { success: false, inputMint: SOL_MINT, outputMint: mintAddress, inputAmount: solAmount, error: 'Quote non disponible' };
      }

      log.info('Quote reçu', {
        inAmount: `${lamports / LAMPORTS_PER_SOL} SOL`,
        outAmount: quote.outAmount,
      });

      const signature = await this.executeSwap(quote);
      if (!signature) {
        return { success: false, inputMint: SOL_MINT, outputMint: mintAddress, inputAmount: solAmount, error: 'Swap échoué' };
      }

      const outputAmount = parseInt(quote.outAmount, 10);
      log.info('ACHAT réussi', { signature, mint: mintAddress, tokensReçus: outputAmount });

      return {
        success: true,
        signature,
        inputMint: SOL_MINT,
        outputMint: mintAddress,
        inputAmount: solAmount,
        outputAmount,
      };
    } catch (err) {
      log.error('Erreur lors de l\'achat', { mint: mintAddress, err: String(err) });
      return { success: false, inputMint: SOL_MINT, outputMint: mintAddress, inputAmount: solAmount, error: String(err) };
    }
  }

  async sell(mintAddress: string, tokenAmount: number): Promise<TradeResult> {
    try {
      log.info('Récupération du quote Jupiter (SELL)', { mint: mintAddress, tokenAmount });

      const quote = await this.getQuote(mintAddress, SOL_MINT, tokenAmount);
      if (!quote) {
        return { success: false, inputMint: mintAddress, outputMint: SOL_MINT, inputAmount: tokenAmount, error: 'Quote non disponible' };
      }

      const estimatedSol = parseInt(quote.outAmount, 10) / LAMPORTS_PER_SOL;
      log.info('Quote vente reçu', { estimatedSol: `${estimatedSol.toFixed(4)} SOL` });

      const signature = await this.executeSwap(quote);
      if (!signature) {
        return { success: false, inputMint: mintAddress, outputMint: SOL_MINT, inputAmount: tokenAmount, error: 'Swap échoué' };
      }

      const outputAmount = parseInt(quote.outAmount, 10) / LAMPORTS_PER_SOL;
      log.info('VENTE réussie', { signature, mint: mintAddress, solReçus: outputAmount });

      return {
        success: true,
        signature,
        inputMint: mintAddress,
        outputMint: SOL_MINT,
        inputAmount: tokenAmount,
        outputAmount,
      };
    } catch (err) {
      log.error('Erreur lors de la vente', { mint: mintAddress, err: String(err) });
      return { success: false, inputMint: mintAddress, outputMint: SOL_MINT, inputAmount: tokenAmount, error: String(err) };
    }
  }

  private async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
  ): Promise<JupiterQuote | null> {
    try {
      const response = await axios.get<JupiterQuote>(JUPITER_QUOTE_API, {
        params: {
          inputMint,
          outputMint,
          amount,
          slippageBps: this.config.slippageBps,
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
        },
        timeout: 10000,
      });
      return response.data;
    } catch (err) {
      log.error('Erreur quote Jupiter', { err: String(err) });
      return null;
    }
  }

  private async executeSwap(quote: JupiterQuote): Promise<string | null> {
    try {
      const swapResponse = await axios.post<{ swapTransaction: string }>(
        JUPITER_SWAP_API,
        {
          quoteResponse: quote,
          userPublicKey: this.wallet.publicKey.toString(),
          wrapAndUnwrapSol: true,
          prioritizationFeeLamports: this.config.priorityFeeMicrolamports,
          dynamicComputeUnitLimit: true,
        },
        { timeout: 15000 },
      );

      const { swapTransaction } = swapResponse.data;
      const txBuffer = Buffer.from(swapTransaction, 'base64');
      const tx = VersionedTransaction.deserialize(txBuffer);

      tx.sign([this.wallet]);

      const signature = await this.connection.sendRawTransaction(tx.serialize(), {
        skipPreflight: true,
        maxRetries: 3,
      });

      await this.connection.confirmTransaction(signature, 'confirmed');
      return signature;
    } catch (err) {
      log.error('Erreur exécution swap', { err: String(err) });
      return null;
    }
  }

  async getTokenPriceInSol(mintAddress: string, tokenAmount: number): Promise<number | null> {
    try {
      const quote = await this.getQuote(mintAddress, SOL_MINT, tokenAmount);
      if (!quote) return null;
      return parseInt(quote.outAmount, 10) / LAMPORTS_PER_SOL;
    } catch {
      return null;
    }
  }
}
