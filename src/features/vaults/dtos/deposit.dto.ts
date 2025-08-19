import { IsNumber } from 'class-validator';

export class DepositDto {
  @IsNumber()
  vaultId: number;
  @IsNumber()
  amount: number;
}
