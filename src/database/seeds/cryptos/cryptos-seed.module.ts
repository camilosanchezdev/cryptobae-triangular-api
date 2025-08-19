import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoEntity } from 'src/features/cryptos/entities/crypto.entity';
import { TradingPairEntity } from 'src/features/cryptos/entities/trading-pair.entity';
import { CryptosSeedService } from './cryptos-seed.service';
import { TradingPairsSeedService } from './trading-pairs-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoEntity, TradingPairEntity])],
  providers: [CryptosSeedService, TradingPairsSeedService],
  exports: [CryptosSeedService, TradingPairsSeedService],
})
export class CryptosSeedModule {}
