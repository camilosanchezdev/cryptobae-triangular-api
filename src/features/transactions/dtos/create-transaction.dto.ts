import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  pricePerUnit?: number;

  @IsString()
  status: string; // 'FILLED', 'PARTIALLY_FILLED', 'CANCELED'

  @IsNumber()
  @IsOptional()
  tradingPairId?: number;

  @IsNumber()
  transactionTypeId: number;

  @IsString()
  @IsOptional()
  result?: string;

  @IsNumber()
  @IsOptional()
  profit?: number;
}
