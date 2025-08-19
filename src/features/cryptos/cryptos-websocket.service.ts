import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as WebSocket from 'ws';
import { CryptosService } from './cryptos.service';
import { CreateMarketDataDto } from './dtos/create-market-data.dto';
import { TradingPairEntity } from './entities/trading-pair.entity';
import { MarketDataBinanceTickerData } from './interfaces/crypto-market.interface';
import { SharedMarketDataService } from './shared-market-data.service';

@Injectable()
export class CryptosWebSocketService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CryptosWebSocketService.name);
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private tradingPairs: TradingPairEntity[] = [];

  constructor(
    private readonly cryptosService: CryptosService,
    private readonly sharedMarketDataService: SharedMarketDataService,
  ) {}
  onModuleInit() {
    this.logger.log('Initializing Crypto WebSocket Service');
    const enableWebSocket = process.env.CRYPTO_WEBSOCKET_ENABLED === 'true';
    if (!enableWebSocket) {
      this.logger.warn(
        'Crypto WebSocket is disabled. Set CRYPTO_WEBSOCKET_ENABLED to true to enable it.',
      );
      return;
    }
    this.connectToBinanceWebSocket();
  }

  onModuleDestroy() {
    this.disconnectWebSocket();
  }
  private handlePriceUpdate(tickerData: MarketDataBinanceTickerData) {
    const tradingPairId = this.tradingPairs.find(
      (pair) => pair.pairSymbol === tickerData.s,
    )?.id;
    if (!tradingPairId) {
      throw new Error(`Trading pair not found for symbol: ${tickerData.s}`);
    }
    const priceUpdate: CreateMarketDataDto = {
      bidPrice: parseFloat(tickerData.c),
      askPrice: parseFloat(tickerData.a),
      volume: parseFloat(tickerData.v),
      tradingPairId: tradingPairId,
    };
    this.sharedMarketDataService.updatePrice(tickerData.s, priceUpdate);
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

  private async connectToBinanceWebSocket() {
    try {
      const cryptoPairs = await this.cryptosService.getAllTradingPairs();
      this.tradingPairs = cryptoPairs;
      const cryptoKeys = cryptoPairs.map((pair) =>
        pair.pairSymbol.toLowerCase(),
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
          const tickerData: MarketDataBinanceTickerData = JSON.parse(
            message,
          ) as MarketDataBinanceTickerData;
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
}
