import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ArbitrageOpportunitiesService } from '../arbitrage-opportunities/arbitrage-opportunities.service';
import { CryptosService } from './cryptos.service';
import { SharedMarketDataService } from './shared-market-data.service';

@Injectable()
export class MarketDataWebsocketService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(MarketDataWebsocketService.name);
  private marketDataSaveInterval: NodeJS.Timeout | null = null;
  private readonly marketDataSaveIntervalMs = 1 * 60 * 1000; // 5 minutes for arbitrage market data

  constructor(
    private readonly sharedMarketDataService: SharedMarketDataService,
    private readonly cryptosService: CryptosService,
    private readonly arbitrageOpportunitiesService: ArbitrageOpportunitiesService,
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

      try {
        await this.cryptosService.createManyMarketData(prices);
        this.logger.log(
          `Successfully saved ${prices.length} cryptocurrency prices`,
        );
      } catch (error) {
        this.logger.error('Failed to save prices:', error);
      }
      this.logger.log('Checking for arbitrage opportunities...');
      // Check opportunities
      await this.arbitrageOpportunitiesService.checkCuadrangularOpportunities(
        prices,
      );
      this.logger.log('Finished checking for arbitrage opportunities');
    } catch (error) {
      this.logger.error('Error during periodic price save:', error);
    }
  }
}
