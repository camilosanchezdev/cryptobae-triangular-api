import { IsNumber } from 'class-validator';

export class CreateEvaluationBuyDto {
  @IsNumber()
  currentPrice: number;

  @IsNumber()
  minPriceYesterday: number;

  @IsNumber()
  lowestPriceFrameSecondary: number;

  @IsNumber()
  currentVolume: number;

  @IsNumber()
  averageVolume: number;

  @IsNumber()
  cryptocurrencyId: number;

  @IsNumber()
  highestPriceFrame: number;

  @IsNumber()
  recommendedActionId: number;

  @IsNumber()
  averagePriceWeek: number;
}
