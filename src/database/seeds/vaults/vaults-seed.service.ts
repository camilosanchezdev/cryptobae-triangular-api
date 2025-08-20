import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MasterVaultEntity } from 'src/features/vaults/entities/master-vault.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VaultsSeedService {
  constructor(
    @InjectRepository(MasterVaultEntity)
    private masterVaultsRepository: Repository<MasterVaultEntity>,
  ) {}
  async run() {
    const masterItems = [
      {
        name: 'USDT',
        amount: 0,
      },
      {
        name: 'BNB',
        amount: 0,
      },
      {
        name: 'USDC',
        amount: 0,
      },
      {
        name: 'FDUSD',
        amount: 0,
      },
      {
        name: 'DAI',
        amount: 0,
      },
      {
        name: 'TUSD',
        amount: 0,
      },
      {
        name: 'USDP',
        amount: 0,
      },
      {
        name: 'XUSD',
        amount: 0,
      },
    ];

    const masterVaultCount = await this.masterVaultsRepository.count();
    if (masterVaultCount === 0) {
      // Insert with specific IDs
      for (const item of masterItems) {
        await this.masterVaultsRepository.save(
          this.masterVaultsRepository.create({
            ...item,
          }),
        );
      }
    }
  }
}
