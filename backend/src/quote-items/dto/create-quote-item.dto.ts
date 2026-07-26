import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateQuoteItemDto {

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNotEmpty()
  quoteId: string;

}
