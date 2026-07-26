import {
  IsNotEmpty,
  IsNumber,
} from 'class-validator';


export class CreateInvoiceItemDto {


  @IsNotEmpty()
  description:string;


  @IsNumber()
  quantity:number;


  @IsNumber()
  unitPrice:number;


  @IsNotEmpty()
  invoiceId:string;

}