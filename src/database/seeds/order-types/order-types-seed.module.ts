import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderTypeEntity } from 'src/features/orders/entities/order-type.entity';
import { OrderTypesSeedService } from './order-types-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderTypeEntity])],
  providers: [OrderTypesSeedService],
  exports: [OrderTypesSeedService],
})
export class OrderTypesSeedModule {}
