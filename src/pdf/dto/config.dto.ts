import { IsString, IsBoolean } from 'class-validator';

export class ConfigDto {
  @IsString()
  title: string;

  @IsBoolean()
  includeTimestamp: boolean;
}
