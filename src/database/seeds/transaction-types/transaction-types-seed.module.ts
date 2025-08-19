import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionTypeEntity } from 'src/features/transactions/entities/transaction-type.entity';
import { TransactionTypesSeedService } from './transaction-types-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionTypeEntity])],
  providers: [TransactionTypesSeedService],
  exports: [TransactionTypesSeedService],
})
export class TransactionTypesSeedModule {}
