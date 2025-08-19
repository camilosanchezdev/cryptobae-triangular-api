import { IsString } from 'class-validator';

export class CreateErrorLogDto {
  @IsString()
  message: string;
  @IsString()
  details: string;
  @IsString()
  context: string;
}
