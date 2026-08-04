import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';


class CreateQuoteItemDto {

  @IsNotEmpty()
  @IsString()
  description: string;


  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity: number;


  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice: number;
}


export class CreateQuoteDto {

  @IsNotEmpty()
  @IsString()
  title: string;


  @IsOptional()
  @IsString()
  description?: string;


  @IsNotEmpty()
  @IsString()
  clientId: string;


  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items: CreateQuoteItemDto[];


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vatRate?: number;
}