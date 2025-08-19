import { IsNumber } from 'class-validator';

export class WithdrawalDto {
  @IsNumber()
  vaultId: number;
  @IsNumber()
  amount: number;
}
