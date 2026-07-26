import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';



class CreateInvoiceItemDto {


  @IsNotEmpty()
  @IsString()
  description:string;



  @Type(() => Number)
  @IsNumber()
  quantity:number;



  @Type(() => Number)
  @IsNumber()
  unitPrice:number;


}




export class CreateInvoiceDto {


  @IsNotEmpty()
  @IsString()
  clientId:string;



  @IsArray()
  @ValidateNested({
    each:true,
  })
  @Type(() => CreateInvoiceItemDto)
  items:CreateInvoiceItemDto[];


}