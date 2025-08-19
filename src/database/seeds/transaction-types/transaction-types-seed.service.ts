import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionTypeEntity } from 'src/features/transactions/entities/transaction-type.entity';
import { Repository } from 'typeorm';
import { TransactionTypeEnum } from '../../../features/transactions/enums/transaction-type.enum';

@Injectable()
export class TransactionTypesSeedService {
  constructor(
    @InjectRepository(TransactionTypeEntity)
    private repository: Repository<TransactionTypeEntity>,
  ) {}

  async run() {
    const elements = [
      {
        id: TransactionTypeEnum.BUY,
        name: 'BUY',
      },
      {
        id: TransactionTypeEnum.SELL,
        name: 'SELL',
      },
      {
        id: TransactionTypeEnum.DEPOSIT,
        name: 'DEPOSIT',
      },
      {
        id: TransactionTypeEnum.WITHDRAWAL,
        name: 'WITHDRAWAL',
      },
    ];
    const count = await this.repository.count();
    if (count > 0) {
      return;
    }
    // Insert with specific IDs
    for (const element of elements) {
      await this.repository.save(
        this.repository.create({
          id: element.id,
          name: element.name,
        }),
      );
    }
  }
}
