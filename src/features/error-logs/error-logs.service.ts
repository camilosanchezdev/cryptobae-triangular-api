import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateErrorLogDto } from './dtos/create-error-log.dto';
import { ErrorLogEntity } from './entities/error-log.entity';

@Injectable()
export class ErrorLogsService {
  constructor(
    @InjectRepository(ErrorLogEntity)
    private readonly repository: Repository<ErrorLogEntity>,
  ) {}

  async createErrorLog({
    message,
    details,
    context,
  }: CreateErrorLogDto): Promise<ErrorLogEntity> {
    const errorLog = this.repository.create({
      message,
      details,
      context,
    });
    return this.repository.save(errorLog);
  }
}
