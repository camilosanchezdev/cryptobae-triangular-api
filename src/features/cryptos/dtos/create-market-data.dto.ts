import { IsNumber } from 'class-validator';

export class CreateMarketDataDto {
  @IsNumber()
  bidPrice: number;

  @IsNumber()
  askPrice: number;

  @IsNumber()
  volume: number;

  @IsNumber()
  tradingPairId: number;
}
