import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from '../transactions/transactions.module';
import { MasterVaultEntity } from './entities/master-vault.entity';
import { VaultMovementEntity } from './entities/vault-movement.entity';
import { VaultsController } from './vaults.controller';
import { VaultsService } from './vaults.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MasterVaultEntity, VaultMovementEntity]),
    TransactionsModule,
  ],
  controllers: [VaultsController],
  providers: [VaultsService],
  exports: [VaultsService],
})
export class VaultsModule {}
