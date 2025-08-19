import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/cache/redis.module';
import { PricesModule } from '../prices/prices.module';
import { WalletStatusEntity } from './entities/wallet-status.entity';
import { WalletTypeEntity } from './entities/wallet-type.entity';
import { WalletEntity } from './entities/wallet.entity';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity,
      WalletTypeEntity,
      WalletStatusEntity,
    ]),
    PricesModule,
    RedisModule,
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
