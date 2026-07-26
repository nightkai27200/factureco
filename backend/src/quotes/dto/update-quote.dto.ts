import {
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';


export class UpdateQuoteDto {


  @IsOptional()
  @IsString()
  number?: string;


  @IsOptional()
  @IsString()
  title?: string;


  @IsOptional()
  @IsString()
  description?: string;


  @IsOptional()
  @IsNumber()
  amount?: number;


}