import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/cache/redis.module';
import { CryptosWebSocketService } from './cryptos-websocket.service';
import { CryptosController } from './cryptos.controller';
import { CryptosService } from './cryptos.service';
import { CryptoEntity } from './entities/crypto.entity';
import { MarketDataEntity } from './entities/market-data.entity';
import { TradingPairEntity } from './entities/trading-pair.entity';
import { MarketDataWebsocketService } from './market-data-websocket.service';
import { SharedMarketDataService } from './shared-market-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CryptoEntity,
      TradingPairEntity,
      MarketDataEntity,
    ]),
    RedisModule,
  ],
  controllers: [CryptosController],
  providers: [
    CryptosService,
    CryptosWebSocketService,
    MarketDataWebsocketService,
    SharedMarketDataService,
  ],
  exports: [CryptosService],
})
export class CryptosModule {}
