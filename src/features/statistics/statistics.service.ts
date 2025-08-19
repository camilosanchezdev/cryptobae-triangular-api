import { Injectable } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly transactionsService: TransactionsService) {}

  async getResults(page: number = 1) {
    return await this.transactionsService.findAllByDay(page);
  }
}
