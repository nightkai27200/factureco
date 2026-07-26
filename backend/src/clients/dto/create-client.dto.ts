import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateClientDto {

  @IsNotEmpty()
  name: string;


  @IsEmail()
  email: string;


  @IsOptional()
  phone?: string;


  @IsOptional()
  company?: string;


  @IsOptional()
  address?: string;

}