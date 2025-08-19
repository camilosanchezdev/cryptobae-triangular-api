import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/cache/redis.module';
import { PricesModule } from '../prices/prices.module';
import { ErrorLogEntity } from './entities/error-log.entity';
import { ErrorLogsController } from './error-logs.controller';
import { ErrorLogsService } from './error-logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ErrorLogEntity]),
    PricesModule,
    RedisModule,
  ],
  controllers: [ErrorLogsController],
  providers: [ErrorLogsService],
  exports: [ErrorLogsService],
})
export class ErrorLogsModule {}
