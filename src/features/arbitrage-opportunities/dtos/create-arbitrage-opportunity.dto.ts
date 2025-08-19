import { IsNumber } from 'class-validator';

export class CreateArbitrageOpportunityDto {
  @IsNumber()
  profitPercentage: number;

  @IsNumber()
  askPrice1: number;

  @IsNumber()
  askPrice2: number;

  @IsNumber()
  bidPrice: number;

  @IsNumber()
  minProfitPercent: number;

  @IsNumber()
  firstTradingPairId: number;

  @IsNumber()
  secondTradingPairId: number;

  @IsNumber()
  thirdTradingPairId: number;
}
