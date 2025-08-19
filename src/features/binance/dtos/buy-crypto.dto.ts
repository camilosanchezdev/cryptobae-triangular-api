import { IsNumber, IsString } from 'class-validator';

export class BuyCryptoDto {
  @IsString()
  symbol: string;

  @IsNumber()
  quantity: number;
}
