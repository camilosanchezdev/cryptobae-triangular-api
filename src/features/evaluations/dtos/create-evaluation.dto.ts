import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
export class CreateEvaluationDto {
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
  cryptocurrencyId: number;
  @IsBoolean()
  hasCrypto: boolean;
  @IsNumber()
  minPriceOfDay: number;
  @IsNumber()
  evaluationTypeId: number;
  @IsNumber()
  recommendedActionId: number;
  @IsNumber()
  @IsOptional()
  highestFramePrice: number | null;
}
