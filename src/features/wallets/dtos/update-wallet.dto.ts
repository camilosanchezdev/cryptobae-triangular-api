import { IsNumber, IsOptional } from 'class-validator';

export class UpdateWalletDto {
  @IsNumber()
  walletId: number;

  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  initialPrice?: number;

  @IsNumber()
  walletStatusId: number;
}
