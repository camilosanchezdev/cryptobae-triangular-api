import { IsNumber } from 'class-validator';

export class UpdateMasterVaultDto {
  @IsNumber()
  amount: number;
}
