import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletStatusEntity } from 'src/features/wallets/entities/wallet-status.entity';
import { WalletTypeEntity } from 'src/features/wallets/entities/wallet-type.entity';
import { WalletStatusesEnum } from 'src/features/wallets/enums/wallet-statuses.enum';
import { WalletTypesEnum } from 'src/features/wallets/enums/wallet-types.enum';
import { Repository } from 'typeorm';
@Injectable()
export class WalletsSeedService {
  constructor(
    @InjectRepository(WalletTypeEntity)
    private repository: Repository<WalletTypeEntity>,
    @InjectRepository(WalletStatusEntity)
    private walletStatusRepository: Repository<WalletStatusEntity>,
  ) {}
  async run() {
    const walletStatuses = [
      {
        id: WalletStatusesEnum.ACTIVE,
        name: 'ACTIVE',
      },
      {
        id: WalletStatusesEnum.PARTIALLY_SOLD,
        name: 'PARTIALLY_SOLD',
      },
      {
        id: WalletStatusesEnum.INACTIVE,
        name: 'INACTIVE',
      },
    ];
    const items = [
      {
        id: WalletTypesEnum.SHORT_TERM,
        name: 'SHORT_TERM',
      },
      {
        id: WalletTypesEnum.LONG_TERM,
        name: 'LONG_TERM',
      },
    ];
    const count = await this.repository.count();
    if (count === 0) {
      // Insert with specific IDs
      for (const item of items) {
        await this.repository.save(
          this.repository.create({
            ...item,
          }),
        );
      }
    }
    const walletStatusesCount = await this.walletStatusRepository.count();
    if (walletStatusesCount === 0) {
      // Insert with specific IDs
      for (const item of walletStatuses) {
        await this.walletStatusRepository.save(
          this.walletStatusRepository.create({
            ...item,
          }),
        );
      }
    }
  }
}
