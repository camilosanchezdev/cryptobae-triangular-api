import { Module } from '@nestjs/common';
import { ErrorLogsModule } from '../error-logs/error-logs.module';
import { BinanceController } from './binance.controller';
import { BinanceService } from './binance.service';

@Module({
  imports: [ErrorLogsModule],
  controllers: [BinanceController],
  providers: [BinanceService],
  exports: [BinanceService],
})
export class BinanceModule {}
