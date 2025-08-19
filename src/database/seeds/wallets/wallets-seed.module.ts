import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletStatusEntity } from 'src/features/wallets/entities/wallet-status.entity';
import { WalletTypeEntity } from 'src/features/wallets/entities/wallet-type.entity';
import { WalletsSeedService } from './wallets-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([WalletTypeEntity, WalletStatusEntity])],
  providers: [WalletsSeedService],
  exports: [WalletsSeedService],
})
export class WalletsSeedModule {}
