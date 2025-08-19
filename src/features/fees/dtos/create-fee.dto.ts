import { IsNumber, IsString } from 'class-validator';

export class CreateFeeDto {
  @IsString()
  amount: string;

  @IsNumber()
  orderId: number;
}
