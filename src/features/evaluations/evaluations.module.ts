import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/cache/redis.module';
import { BinanceModule } from '../binance/binance.module';
import { FeesModule } from '../fees/fees.module';
import { OrdersModule } from '../orders/orders.module';
import { PricesModule } from '../prices/prices.module';
import { TransactionTypeEntity } from '../transactions/entities/transaction-type.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { VaultsModule } from '../vaults/vaults.module';
import { WalletsModule } from '../wallets/wallets.module';
import { EvaluationTypeEntity } from './entities/evaluation-type.entity';
import { EvaluationEntity } from './entities/evaluation.entity';
import { EvaluationBuyEntity } from './entities/evaluations-buy.entity';
import { EvaluationSellEntity } from './entities/evaluations-sell.entity';
import { RecommendedActionEntity } from './entities/recommended-actions.entity';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EvaluationEntity,
      TransactionTypeEntity,
      RecommendedActionEntity,
      EvaluationTypeEntity,
      EvaluationBuyEntity,
      EvaluationSellEntity,
    ]),
    WalletsModule,
    VaultsModule,
    PricesModule,
    TransactionsModule,
    RedisModule,
    OrdersModule,
    FeesModule,
    forwardRef(() => BinanceModule),
  ],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
