import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { TokenLaunchEvent } from '../types';
import { log } from '../utils/logger';

const PUMPPORTAL_WS = 'wss://pumpportal.fun/api/data';
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 20;

export class PumpFunMonitor extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private running = false;

  start(): void {
    this.running = true;
    this.connect();
  }

  stop(): void {
    this.running = false;
    this.ws?.close();
    this.ws = null;
    log.info('Moniteur pump.fun arrêté');
  }

  private connect(): void {
    log.info('Connexion au WebSocket pump.fun...', { url: PUMPPORTAL_WS });

    this.ws = new WebSocket(PUMPPORTAL_WS);

    this.ws.on('open', () => {
      log.info('WebSocket pump.fun connecté');
      this.reconnectAttempts = 0;
      this.subscribe();
    });

    this.ws.on('message', (data: WebSocket.RawData) => {
      this.handleMessage(data.toString());
    });

    this.ws.on('error', (err: Error) => {
      log.error('Erreur WebSocket pump.fun', { error: err.message });
    });

    this.ws.on('close', (code: number) => {
      log.warn('WebSocket pump.fun déconnecté', { code });
      if (this.running) this.scheduleReconnect();
    });
  }

  private subscribe(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    // S'abonner aux nouveaux tokens créés
    this.ws.send(JSON.stringify({ method: 'subscribeNewToken' }));
    log.info('Abonnement aux nouveaux tokens pump.fun actif');
  }

  private handleMessage(raw: string): void {
    try {
      const data = JSON.parse(raw);

      // Ignorer les pings / confirmations d'abonnement
      if (!data.mint || !data.traderPublicKey) return;

      const event: TokenLaunchEvent = {
        signature: data.signature ?? '',
        mint: data.mint,
        name: data.name ?? 'Unknown',
        symbol: data.symbol ?? '???',
        creator: data.traderPublicKey,
        bondingCurve: data.bondingCurveKey ?? '',
        initialBuy: data.initialBuy ?? 0,
        solAmount: data.solAmount ?? 0,
        marketCapSol: data.marketCapSol ?? 0,
        timestamp: data.timestamp ?? Date.now(),
        uri: data.uri,
      };

      log.debug('Nouveau token détecté', {
        mint: event.mint,
        symbol: event.symbol,
        creator: event.creator,
      });

      this.emit('token', event);
    } catch (err) {
      log.debug('Message non parsable', { raw: raw.slice(0, 100) });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      log.error('Nombre max de reconnexions atteint. Arrêt du moniteur.');
      this.emit('fatal', new Error('Max reconnect attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = RECONNECT_DELAY_MS * Math.min(this.reconnectAttempts, 5);
    log.info(`Reconnexion dans ${delay}ms (tentative ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
    setTimeout(() => this.connect(), delay);
  }
}
