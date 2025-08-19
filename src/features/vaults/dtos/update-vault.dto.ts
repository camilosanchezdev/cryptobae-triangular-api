import { IsNumber } from 'class-validator';

export class UpdateVaultDto {
  @IsNumber()
  cryptocurrencyId: number;

  @IsNumber()
  amount: number;
}
