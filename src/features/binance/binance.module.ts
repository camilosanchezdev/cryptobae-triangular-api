import { Module } from '@nestjs/common';
import { ErrorLogsModule } from '../error-logs/error-logs.module';
import { EvaluationsModule } from '../evaluations/evaluations.module';
import { PricesModule } from '../prices/prices.module';
import { BinanceWebSocketService } from './binance-websocket.service';
import { BinanceController } from './binance.controller';
import { BinanceService } from './binance.service';

@Module({
  imports: [PricesModule, EvaluationsModule, ErrorLogsModule],
  controllers: [BinanceController],
  providers: [BinanceService, BinanceWebSocketService],
  exports: [BinanceService],
})
export class BinanceModule {}
