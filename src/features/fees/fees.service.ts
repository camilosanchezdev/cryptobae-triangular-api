import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateFeeDto } from './dtos/create-fee.dto';
import { FeeEntity } from './entities/fee.entity';

@Injectable()
export class FeesService {
  constructor(
    @InjectRepository(FeeEntity)
    private readonly repository: Repository<FeeEntity>,
  ) {}
  async getFees(page: number = 1) {
    const pageSize = 10;
    const currentPage: number = Number(page);
    const where: FindOptionsWhere<FeeEntity> = {};
    const skip = (currentPage - 1) * pageSize;
    const data = await this.repository.find({
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
      where,
    });
    const total = await this.repository.count({ where });

    return {
      page: currentPage,
      pageSize,
      total,
      data,
    };
  }

  async createFee(createFeeDto: CreateFeeDto) {
    const fee = this.repository.create(createFeeDto);
    return this.repository.save(fee);
  }
}
