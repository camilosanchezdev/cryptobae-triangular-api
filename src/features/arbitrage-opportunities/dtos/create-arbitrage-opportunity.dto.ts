import { IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsString()
  @IsOptional()
  startStable: string;

  @IsString()
  @IsOptional()
  firstOrderSymbol: string;

  @IsString()
  @IsOptional()
  secondOrderSymbol: string;

  @IsString()
  @IsOptional()
  thirdOrderSymbol: string;

  @IsString()
  @IsOptional()
  finalAsset: string;
}
