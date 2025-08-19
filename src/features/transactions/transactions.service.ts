import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { TransactionTypeEntity } from './entities/transaction-type.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionResultType } from './types/transaction-result.type';

const pageSize = 10;

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
    @InjectRepository(TransactionTypeEntity)
    private readonly transactionTypeRepository: Repository<TransactionTypeEntity>,
  ) {}

  async createTransaction(body: CreateTransactionDto) {
    const transaction = this.repository.create(body);
    return await this.repository.save(transaction);
  }
  async getTransactions(
    cryptocurrencyId: number | undefined,
    transactionTypeId: number | undefined,
    result: TransactionResultType | undefined,
    page: number = 1,
  ) {
    const where: FindOptionsWhere<TransactionEntity> = {
      ...(cryptocurrencyId && {
        cryptocurrencyId,
      }),
      ...(transactionTypeId && {
        transactionTypeId,
      }),
      ...(result && {
        result,
      }),
    };
    const skip = (page - 1) * pageSize;
    const data = await this.repository.find({
      skip,
      take: pageSize,
      relations: ['cryptocurrency', 'transactionType'],
      order: { createdAt: 'DESC' },
      where,
    });
    const total = await this.repository.count({ where });

    return {
      page: Number(page),
      pageSize,
      total,
      data,
    };
  }

  async getTransactionTypes() {
    return await this.transactionTypeRepository.find({
      where: { deleted: false },
    });
  }
  async resetTransactions(token: string) {
    const validToken = process.env.CRYPTO_MASTER_TOKEN;
    if (token !== validToken) {
      throw new BadRequestException('Invalid token');
    }
    // Delete all transactions
    return await this.repository.delete({ deleted: false });
  }
  async findAllByDay(page: number) {
    const query = this.repository
      .createQueryBuilder('transaction') // 'transaction' is an alias for your entity
      .select(
        "DATE(transaction.createdAt AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires')",
        'day',
      ) // Extract date part for grouping in Buenos Aires time (GMT-3)
      .addSelect('SUM(transaction.profit)', 'totalProfit') // Sum the profit
      .where('transaction.deleted = :deleted', { deleted: false }) // Your existing condition
      .groupBy('day') // Group by the extracted date
      .orderBy('day', 'DESC'); // Order by day if you want the latest days first

    const skip = (page - 1) * pageSize;

    query.skip(skip);
    query.take(pageSize); // Limit the results to the page size

    const results: { day: string; totalProfit: number }[] =
      await query.getRawMany(); // Use getRawMany() to get raw results (not entity instances)
    const total = results.length; // TODO: calculate with pagination
    const data = results.map((result) => ({
      day: result.day,
      totalProfit: Number(result.totalProfit), // Ensure profit is a number
    }));
    return {
      page: Number(page),
      pageSize,
      total,
      data,
    };
  }
}
