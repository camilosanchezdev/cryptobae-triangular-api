import { IsString } from 'class-validator';

export class UpdateConfigurationDto {
  @IsString()
  value: string;
}
