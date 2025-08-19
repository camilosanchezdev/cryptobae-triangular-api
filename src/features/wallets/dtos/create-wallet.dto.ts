import { IsNumber } from 'class-validator';

export class CreateWalletDto {
  @IsNumber()
  cryptocurrencyId: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  initialPrice: number;
}
