import { DataDto } from './items.dto';
import { ConfigDto } from './config.dto';

import { IsString, IsUrl, ValidateNested, IsDefined } from 'class-validator';

import { Type } from 'class-transformer';

export class GeneratePdfDto {
  @IsDefined()
  @IsString()
  orderId: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => DataDto)
  data: DataDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => ConfigDto)
  config: ConfigDto;

  @IsDefined()
  @IsUrl()
  callbackUrl: string;
}
