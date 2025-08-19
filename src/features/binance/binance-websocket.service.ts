import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as WebSocket from 'ws';
import { EvaluationsService } from '../evaluations/evaluations.service';
import { Cryptocurrencies } from '../prices/enums/cryptocurrencies.enum';
import {
  BinanceTickerData,
  CryptoPriceUpdate,
} from '../prices/interfaces/binance-websocket.interface';
import { PricesService } from '../prices/prices.service';

@Injectable()
export class BinanceWebSocketService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BinanceWebSocketService.name);
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private saveInterval: NodeJS.Timeout | null = null;
  private evaluationInterval: NodeJS.Timeout | null = null;
  private readonly saveIntervalMs = 5 * 60 * 1000; // 5 minutes - aligned with evaluation frequency
  private readonly evaluationIntervalMs = 5 * 60 * 1000; // 5 minutes
  // Store current prices in memory
  private currentPrices: Map<string, CryptoPriceUpdate> = new Map();

  constructor(
    private readonly pricesService: PricesService,
    private readonly evaluationsService: EvaluationsService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Binance WebSocket Service');
    const enableWebSocket = process.env.ENABLE_BINANCE_WEBSOCKET === 'true';
    if (!enableWebSocket) {
      this.logger.warn(
        'Binance WebSocket is disabled. Set ENABLE_BINANCE_WEBSOCKET to true to enable it.',
      );
      return;
    }
    this.connectToBinanceWebSocket();
    this.startPeriodicSave();
    this.startPeriodicEvaluation();
  }

  onModuleDestroy() {
    this.disconnectWebSocket();
    this.stopPeriodicSave();
    this.stopPeriodicEvaluation();
  }
  private handlePriceUpdate(tickerData: BinanceTickerData) {
    const priceUpdate: CryptoPriceUpdate = {
      symbol: tickerData.s,
      name: tickerData.s,
      price: parseFloat(tickerData.c),
      priceChange24h: parseFloat(tickerData.P || '0'),
      volume24h: parseFloat(tickerData.v),
      lastUpdated: new Date(tickerData.E),
    };

    this.currentPrices.set(tickerData.s, priceUpdate);
  }
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.logger.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );

      setTimeout(() => {
        this.connectToBinanceWebSocket();
      }, this.reconnectInterval);
    } else {
      this.logger.error(
        'Max reconnection attempts reached. WebSocket connection failed.',
      );
    }
  }

  private disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.logger.log('WebSocket connection closed');
    }
  }

  private startPeriodicSave(): void {
    this.saveInterval = setInterval(() => {
      void this.saveAllCurrentPrices();
    }, this.saveIntervalMs);
    this.logger.log('Started periodic price saving every 5 minutes');
  }

  private startPeriodicEvaluation(): void {
    this.evaluationInterval = setInterval(() => {
      void this.evaluateAllCurrentPrices();
    }, this.evaluationIntervalMs);
    this.logger.log(
      'Started periodic cryptocurrency evaluation every 5 minutes',
    );
  }
  private connectToBinanceWebSocket(): void {
    try {
      const cryptoKeys: string[] = Object.keys(Cryptocurrencies).filter((key) =>
        isNaN(Number(key)),
      );

      const streamNames = cryptoKeys
        .map((symbol) => `${symbol.toLowerCase()}@ticker`)
        .join('/');
      const wsUrl = `wss://stream.binance.com:9443/ws/${streamNames}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        this.logger.log('Connected to Binance WebSocket');
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          let message: string;
          if (typeof data === 'string') {
            message = data;
          } else if (Buffer.isBuffer(data)) {
            message = data.toString();
          } else {
            // Handle ArrayBuffer and other types
            message = Buffer.from(data as ArrayBuffer).toString();
          }
          const tickerData: BinanceTickerData = JSON.parse(
            message,
          ) as BinanceTickerData;
          this.handlePriceUpdate(tickerData);
        } catch (error) {
          this.logger.error('Error parsing WebSocket message:', error);
        }
      });

      this.ws.on('close', (code: number, reason: string) => {
        this.logger.warn(
          `WebSocket connection closed. Code: ${code}, Reason: ${reason}`,
        );
        this.handleReconnection();
      });

      this.ws.on('error', (error: Error) => {
        this.logger.error('WebSocket error:', error);
        this.handleReconnection();
      });
    } catch (error) {
      this.logger.error('Failed to connect to Binance WebSocket:', error);
      this.handleReconnection();
    }
  }
  private stopPeriodicSave(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
      this.logger.log('Stopped periodic price saving');
    }
  }

  private stopPeriodicEvaluation(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
      this.logger.log('Stopped periodic cryptocurrency evaluation');
    }
  }

  private async saveAllCurrentPrices(): Promise<void> {
    console.log('Saving all current prices to database...');
    console.log('currentPrices:', this.currentPrices);
    try {
      const prices = Array.from(this.currentPrices.values());
      if (prices.length === 0) {
        this.logger.warn('No current prices to save');
        return;
      }

      this.logger.log(
        `Saving ${prices.length} cryptocurrency prices to database`,
      );

      const savePromises = prices.map(async (priceData) => {
        try {
          return await this.pricesService.savePriceData(priceData);
        } catch (error) {
          this.logger.error(
            `Failed to save price for ${priceData.symbol}:`,
            error,
          );
          return null;
        }
      });

      const results = await Promise.allSettled(savePromises);
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value !== null,
      ).length;

      this.logger.log(
        `Successfully saved ${successful}/${prices.length} cryptocurrency prices`,
      );
    } catch (error) {
      this.logger.error('Error during periodic price save:', error);
    }
  }

  private async evaluateAllCurrentPrices(): Promise<void> {
    console.log('Evaluating all current cryptocurrency prices...');
    try {
      const prices = Array.from(this.currentPrices.values());
      if (prices.length === 0) {
        this.logger.warn('No current prices to evaluate');
        return;
      }

      this.logger.log(`Evaluating ${prices.length} cryptocurrency prices`);

      const evaluationPromises = prices.map(async (priceData) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const cryptocurrencyId: number =
            Cryptocurrencies[priceData.symbol.toUpperCase()];
          const symbol = priceData.symbol.toUpperCase();
          const price = priceData.price;
          // TODO: disable
          if (cryptocurrencyId > 15) {
            return true;
          }
          await this.evaluationsService.evaluateCryptocurrency(
            cryptocurrencyId,
            price,
            symbol,
          );
          return true;
        } catch (error) {
          this.logger.error(
            `Failed to evaluate price for ${priceData.symbol}:`,
            error,
          );
          return false;
        }
      });

      const results = await Promise.allSettled(evaluationPromises);
      const successful = results.filter(
        (result) => result.status === 'fulfilled' && result.value === true,
      ).length;

      this.logger.log(
        `Successfully evaluated ${successful}/${prices.length} cryptocurrency prices`,
      );
    } catch (error) {
      this.logger.error(
        'Error during periodic cryptocurrency evaluation:',
        error,
      );
    }
  }
}
