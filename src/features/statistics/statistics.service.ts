import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly walletsService: WalletsService,
  ) {}

  async getResults(page: number = 1) {
    return await this.transactionsService.findAllByDay(page);
  }

  async getWalletsStats() {
    return await this.walletsService.getWalletsStats();
  }
}
