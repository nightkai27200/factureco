import {
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';


export class UpdateInvoiceItemDto {


  @IsOptional()
  @IsString()
  description?: string;



  @IsOptional()
  @IsNumber()
  quantity?: number;



  @IsOptional()
  @IsNumber()
  unitPrice?: number;


}