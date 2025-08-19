import { IsNumber, IsOptional } from 'class-validator';

export class CreateEvaluationSellDto {
  @IsNumber()
  currentPrice: number;

  @IsNumber()
  @IsOptional()
  initialPrice: number | null;

  @IsNumber()
  @IsOptional()
  priceDifference: number | null;

  @IsNumber()
  @IsOptional()
  priceDifferencePercentage: number | null;

  @IsNumber()
  highestFramePrice: number;

  @IsNumber()
  cryptocurrencyId: number;

  @IsNumber()
  recommendedActionId: number;

  @IsNumber()
  walletId: number;
}
