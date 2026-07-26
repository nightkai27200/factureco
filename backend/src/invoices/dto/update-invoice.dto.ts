import {
  IsOptional,
  IsNumber,
  IsString,
} from 'class-validator';


export class UpdateInvoiceDto {


  @IsOptional()
  @IsString()
  number?: string;


  @IsOptional()
  @IsString()
  status?: string;


  @IsOptional()
  @IsNumber()
  amount?: number;


}