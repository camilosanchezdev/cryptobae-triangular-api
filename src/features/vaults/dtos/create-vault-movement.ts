import { IsNumber } from 'class-validator';

export class CreateVaultMovementDto {
  @IsNumber()
  masterVaultId: number;
  @IsNumber()
  amount: number;
  @IsNumber()
  transactionId: number;
  @IsNumber()
  oldAmount: number;
  @IsNumber()
  difference: number;
}
