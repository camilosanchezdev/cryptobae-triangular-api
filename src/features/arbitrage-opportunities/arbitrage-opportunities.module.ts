import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinanceModule } from '../binance/binance.module';
import { CryptosModule } from '../cryptos/cryptos.module';
import { CryptoEntity } from '../cryptos/entities/crypto.entity';
import { MarketDataEntity } from '../cryptos/entities/market-data.entity';
import { TradingPairEntity } from '../cryptos/entities/trading-pair.entity';
import { VaultsModule } from '../vaults/vaults.module';
import { ArbitrageOpportunitiesController } from './arbitrage-opportunities.controller';
import { ArbitrageOpportunitiesService } from './arbitrage-opportunities.service';
import { ArbitrageService } from './arbitrage.service';
import { ArbitrageOpportunityEntity } from './entities/arbitrage-opportunity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArbitrageOpportunityEntity,
      CryptoEntity,
      TradingPairEntity,
      MarketDataEntity,
    ]),
    forwardRef(() => CryptosModule),
    BinanceModule,
    VaultsModule,
  ],
  controllers: [ArbitrageOpportunitiesController],
  providers: [ArbitrageOpportunitiesService, ArbitrageService],
  exports: [ArbitrageOpportunitiesService, ArbitrageService],
})
export class ArbitrageOpportunitiesModule {}
