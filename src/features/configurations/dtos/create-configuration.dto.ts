import { IsString } from 'class-validator';

export class CreateConfigurationDto {
  @IsString()
  key: string;
  @IsString()
  value: string;
  @IsString()
  regex: string;
}
