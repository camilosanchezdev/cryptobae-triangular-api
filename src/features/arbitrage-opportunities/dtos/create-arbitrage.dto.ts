import { IsNumber, IsString } from 'class-validator';

export class CreateArbitrageDto {
  @IsString()
  startStable: string;
  @IsString()
  firstOrderSymbol: string;
  @IsNumber()
  firstOrderPrice: number;
  @IsString()
  secondOrderSymbol: string;
  @IsNumber()
  secondOrderPrice: number;
  @IsString()
  thirdOrderSymbol: string;
  @IsNumber()
  thirdOrderPrice: number;
}
