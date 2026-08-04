import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';


// =========================================================
// ITEM
// =========================================================

export class UpdateQuoteItemDto {

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


// =========================================================
// UPDATE DEVIs
// =========================================================

export class UpdateQuoteDto {

  @IsOptional()
  @IsString()
  title?: string;


  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @IsString()
  clientId?: string;


  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuoteItemDto)
  items?: UpdateQuoteItemDto[];


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vatRate?: number;
}