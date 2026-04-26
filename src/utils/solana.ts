import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { log } from './logger';

export function createKeypairFromBase58(privateKey: string): Keypair {
  const secret = bs58.decode(privateKey);
  return Keypair.fromSecretKey(secret);
}

export async function getSolBalance(connection: Connection, pubkey: PublicKey): Promise<number> {
  const lamports = await connection.getBalance(pubkey);
  return lamports / LAMPORTS_PER_SOL;
}

export async function getTokenBalance(
  connection: Connection,
  walletPubkey: PublicKey,
  mintPubkey: PublicKey,
): Promise<number> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
      mint: mintPubkey,
    });
    if (tokenAccounts.value.length === 0) return 0;
    const data = tokenAccounts.value[0]!.account.data as ParsedAccountData;
    return data.parsed.info.tokenAmount.uiAmount as number;
  } catch {
    return 0;
  }
}

export async function getMintInfo(
  connection: Connection,
  mint: string,
): Promise<{ mintAuthority: string | null; freezeAuthority: string | null } | null> {
  try {
    const mintPubkey = new PublicKey(mint);
    const info = await connection.getParsedAccountInfo(mintPubkey);
    if (!info.value) return null;
    const data = info.value.data as ParsedAccountData;
    const parsed = data.parsed?.info;
    return {
      mintAuthority: parsed?.mintAuthority ?? null,
      freezeAuthority: parsed?.freezeAuthority ?? null,
    };
  } catch (err) {
    log.warn('Impossible de lire le mint info', { mint, err: String(err) });
    return null;
  }
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
