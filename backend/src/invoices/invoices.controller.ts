import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  
} from '@nestjs/common';


import { InvoicesService } from './invoices.service';

import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PdfService } from '../pdf/pdf.service';



@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {


  constructor(
    private invoicesService: InvoicesService,
    private pdfService: PdfService,
  ) {}



  // TEST TEMPORAIRE
  @Get('test')
  test(){

    return {
      ok:true,
      message:'Invoices controller OK',
    };

  }





  // Liste des factures
  @Get()
  findAll(
    @Req() req:any,
  ){

    return this.invoicesService.findAll(
      req.user.id,
    );

  }





  // Une facture par ID
  @Get(':id')
  findOne(
    @Param('id') id:string,
    @Req() req:any,
  ){

    return this.invoicesService.findOne(
      id,
      req.user.id,
    );

  }





  // PDF facture
@Get(':id/pdf')
async pdf(
  @Param('id') id:string,
  @Req() req:any,
  @Res() res:any,
){


  const invoice =
    await this.invoicesService.findOneForPdf(
      id,
      req.user.id,
    );


  console.log(
    'FACTURE PDF:',
    invoice.number,
  );


  console.log(
    'COMPANY:',
    invoice.user.company,
  );



  const pdf = await this.pdfService.generateInvoicePdf(invoice);



  res.setHeader(
    'Content-Type',
    'application/pdf',
  );


  res.setHeader(
    'Content-Disposition',
    `inline; filename=facture-${invoice.number}.pdf`,
  );


  pdf.pipe(res);


}





  // Création facture
  @Post()
  create(
    @Body() dto:CreateInvoiceDto,
    @Req() req:any,
  ){


    return this.invoicesService.create({

      ...dto,

      userId:req.user.id,

    });


  }





  // Changement statut
  @Patch(':id/status')
updateStatus(
  @Param('id') id:string,
  @Body() body:any,
  @Req() req:any,
){

  return this.invoicesService.updateStatus(
    id,
    req.user.id,
    body.status,
  );

}




  // Suppression
  @Delete(':id')
  remove(
    @Param('id') id:string,
    @Req() req:any,
  ){


    return this.invoicesService.remove(
      id,
      req.user.id,
    );


  }


}