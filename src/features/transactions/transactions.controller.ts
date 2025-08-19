import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { ApiKeyGuard } from '../../auth/auth.guard';
import { TransactionResultType } from './types/transaction-result.type';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(ApiKeyGuard)
  @Get()
  async getTransactions(
    @Query('page') page: number,
    @Query('cryptocurrencyId') cryptocurrencyId: number,
    @Query('transactionTypeId') transactionTypeId: number,
    @Query('result') result: TransactionResultType,
  ) {
    return this.transactionsService.getTransactions(
      cryptocurrencyId,
      transactionTypeId,
      result,
      page,
    );
  }

  @UseGuards(ApiKeyGuard)
  @Get('transaction-types')
  async getTransactionTypes() {
    return this.transactionsService.getTransactionTypes();
  }

  @UseGuards(ApiKeyGuard)
  @Post('reset')
  async resetTransactions(@Body('token') token: string) {
    return this.transactionsService.resetTransactions(token);
  }
}
