import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBuyOrderDto {
  @IsString()
  @IsOptional()
  symbol?: string;

  @IsNumber()
  @IsOptional()
  externalOrderId?: number;

  @IsNumber()
  @IsOptional()
  orderListId?: number;

  @IsString()
  @IsOptional()
  clientOrderId?: string;

  @IsNumber()
  @IsOptional()
  transactTime?: number;

  @IsString()
  @IsOptional()
  price?: string;

  @IsString()
  @IsOptional()
  origQty?: string;

  @IsString()
  @IsOptional()
  executedQty?: string;

  @IsString()
  @IsOptional()
  origQuoteOrderQty?: string;

  @IsString()
  @IsOptional()
  cummulativeQuoteQty?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  timeInForce?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  side?: string;

  @IsNumber()
  @IsOptional()
  workingTime?: number;

  @IsString()
  @IsOptional()
  fillsPrice?: string;

  @IsString()
  @IsOptional()
  fillsQty?: string;

  @IsString()
  @IsOptional()
  fillsCommission?: string;

  @IsString()
  @IsOptional()
  fillsCommissionAsset?: string;

  @IsNumber()
  @IsOptional()
  fillsTradeId?: number;

  @IsString()
  @IsOptional()
  selfTradePreventionMode?: string;

  @IsNumber()
  @IsOptional()
  transactionId?: number;
}
