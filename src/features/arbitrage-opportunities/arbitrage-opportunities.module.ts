import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptosModule } from '../cryptos/cryptos.module';
import { CryptoEntity } from '../cryptos/entities/crypto.entity';
import { MarketDataEntity } from '../cryptos/entities/market-data.entity';
import { TradingPairEntity } from '../cryptos/entities/trading-pair.entity';
import { ArbitrageOpportunitiesController } from './arbitrage-opportunities.controller';
import { ArbitrageOpportunitiesService } from './arbitrage-opportunities.service';
import { ArbitrageOpportunityEntity } from './entities/arbitrage-opportunity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ArbitrageOpportunityEntity,
      CryptoEntity,
      TradingPairEntity,
      MarketDataEntity,
    ]),
    CryptosModule,
  ],
  controllers: [ArbitrageOpportunitiesController],
  providers: [ArbitrageOpportunitiesService],
  exports: [ArbitrageOpportunitiesService],
})
export class ArbitrageOpportunitiesModule {}
