import {
  IsOptional,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';


export class UpdateQuoteItemDto {

  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity?: number;


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice?: number;
}