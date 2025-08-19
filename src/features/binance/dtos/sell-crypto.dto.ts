import { IsNumber, IsString } from 'class-validator';

export class SellCryptoDto {
  @IsString()
  symbol: string;

  @IsNumber()
  quantity: number;
}
