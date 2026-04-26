import fs from 'fs';
import { TokenLaunchEvent, RuggerEntry, SnipeTarget, BotConfig } from '../types';
import { log } from '../utils/logger';

export class RuggerFilter {
  private watchlist: Map<string, RuggerEntry> = new Map();
  private readonly mode: 'include' | 'exclude';
  private readonly watchlistFile: string;

  constructor(config: BotConfig) {
    this.mode = config.watchlistMode;
    this.watchlistFile = config.ruggerWatchlistFile;
    this.loadWatchlist();
  }

  private loadWatchlist(): void {
    try {
      if (!fs.existsSync(this.watchlistFile)) {
        log.warn('Fichier watchlist introuvable', { path: this.watchlistFile });
        return;
      }
      const raw = fs.readFileSync(this.watchlistFile, 'utf-8');
      const entries: RuggerEntry[] = JSON.parse(raw);
      this.watchlist.clear();
      for (const entry of entries) {
        this.watchlist.set(entry.wallet.toLowerCase(), entry);
      }
      log.info(`Watchlist chargée : ${this.watchlist.size} ruggers (mode: ${this.mode})`);
    } catch (err) {
      log.error('Erreur lors du chargement de la watchlist', { err: String(err) });
    }
  }

  reloadWatchlist(): void {
    this.loadWatchlist();
  }

  addRugger(entry: RuggerEntry): void {
    this.watchlist.set(entry.wallet.toLowerCase(), entry);
    this.saveWatchlist();
    log.info(`Rugger ajouté : ${entry.alias} (${entry.wallet})`);
  }

  removeRugger(wallet: string): boolean {
    const removed = this.watchlist.delete(wallet.toLowerCase());
    if (removed) this.saveWatchlist();
    return removed;
  }

  private saveWatchlist(): void {
    const entries = Array.from(this.watchlist.values());
    fs.writeFileSync(this.watchlistFile, JSON.stringify(entries, null, 2), 'utf-8');
  }

  evaluate(event: TokenLaunchEvent): SnipeTarget | null {
    const creatorLower = event.creator.toLowerCase();
    const inWatchlist = this.watchlist.has(creatorLower);

    if (this.mode === 'include' && !inWatchlist) {
      log.debug('Créateur non dans la watchlist, ignoré', { creator: event.creator });
      return null;
    }

    if (this.mode === 'exclude' && inWatchlist) {
      const entry = this.watchlist.get(creatorLower)!;
      log.warn('Créateur blacklisté, ignoré', { creator: event.creator, alias: entry.alias });
      return null;
    }

    const entry = this.watchlist.get(creatorLower);
    return {
      event,
      ruggerWallet: event.creator,
      ruggerAlias: entry?.alias,
      detectedAt: Date.now(),
    };
  }

  getWatchlist(): RuggerEntry[] {
    return Array.from(this.watchlist.values());
  }

  size(): number {
    return this.watchlist.size;
  }
}
