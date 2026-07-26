import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';



class CreateQuoteItemDto {


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



export class CreateQuoteDto {


  @IsNotEmpty()
  @IsString()
  title:string;



  @IsOptional()
  @IsString()
  description?:string;



  @IsNotEmpty()
  @IsString()
  clientId:string;



  @IsArray()
  @ValidateNested({
    each:true,
  })
  @Type(() => CreateQuoteItemDto)
  items:CreateQuoteItemDto[];


}