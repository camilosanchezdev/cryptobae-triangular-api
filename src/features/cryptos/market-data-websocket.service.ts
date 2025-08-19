import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CryptosService } from './cryptos.service';
import { SharedMarketDataService } from './shared-market-data.service';

@Injectable()
export class MarketDataWebsocketService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MarketDataWebsocketService.name);
  private marketDataSaveInterval: NodeJS.Timeout | null = null;
  private readonly marketDataSaveIntervalMs = 5 * 60 * 1000; // 5 minutes for arbitrage market data

  constructor(
    private readonly sharedMarketDataService: SharedMarketDataService,
    private readonly cryptosService: CryptosService,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Market Data WebSocket Service');
    const enableWebSocket = process.env.CRYPTO_SAVE_PRICES_ENABLED === 'true';
    if (!enableWebSocket) {
      this.logger.warn(
        'Market Data WebSocket is disabled. Set CRYPTO_SAVE_PRICES_ENABLED to true to enable it.',
      );
      return;
    }
    this.startPeriodicSave();
  }

  onModuleDestroy() {
    this.stopPeriodicSave();
  }
  private stopPeriodicSave(): void {
    if (this.marketDataSaveInterval) {
      clearInterval(this.marketDataSaveInterval);
      this.marketDataSaveInterval = null;
      this.logger.log('Stopped periodic price saving');
    }
  }

  private startPeriodicSave(): void {
    this.marketDataSaveInterval = setInterval(() => {
      void this.saveAllCurrentPrices();
    }, this.marketDataSaveIntervalMs);
    this.logger.log('Started periodic price saving every 5 minutes');
  }
  private async saveAllCurrentPrices(): Promise<void> {
    console.log('Saving all current prices to database...');
    console.log(
      'currentPrices:',
      this.sharedMarketDataService.getCurrentPrices(),
    );
    try {
      const prices = Array.from(
        this.sharedMarketDataService.getCurrentPrices().values(),
      );
      if (prices.length === 0) {
        this.logger.warn('No current prices to save');
        return;
      }

      this.logger.log(
        `Saving ${prices.length} cryptocurrency prices to database`,
      );

      const savePromises = prices.map(async (priceData) => {
        try {
          return await this.cryptosService.createMarketData(priceData);
        } catch (error) {
          this.logger.error(
            `Failed to save price for trading pair with ID ${priceData.tradingPairId}:`,
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
}
