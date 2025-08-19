import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterVaultEntity } from 'src/features/vaults/entities/master-vault.entity';
import { VaultsSeedService } from './vaults-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterVaultEntity])],
  providers: [VaultsSeedService],
  exports: [VaultsSeedService],
})
export class VaultsSeedModule {}
