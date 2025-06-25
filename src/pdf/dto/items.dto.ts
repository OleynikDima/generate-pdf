import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemsDto {
  @IsString()
  name: string;

  @IsNumber()
  price: number;
}

export class DataDto {
  @IsString()
  customer: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemsDto)
  items: ItemsDto[];
}
