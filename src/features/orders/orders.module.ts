import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/cache/redis.module';
import { PricesModule } from '../prices/prices.module';
import { OrderTypeEntity } from './entities/order-type.entity';
import { OrderEntity } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderTypeEntity]),
    PricesModule,
    RedisModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
