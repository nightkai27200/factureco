import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';


export class CreateQuoteItemDto {

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


  @IsNotEmpty()
  @IsString()
  quoteId: string;
}