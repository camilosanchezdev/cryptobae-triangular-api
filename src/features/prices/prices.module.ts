import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/cache/redis.module';
import { CryptocurrencyEntity } from './entities/cryptocurrency.entity';
import { PriceEntity } from './entities/price.entity';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriceEntity, CryptocurrencyEntity]),
    HttpModule,
    RedisModule,
  ],
  controllers: [PricesController],
  providers: [PricesService],
  exports: [PricesService],
})
export class PricesModule {}
