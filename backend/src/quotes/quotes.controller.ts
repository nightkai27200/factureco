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


import { Response } from 'express';


import { QuotesService } from './quotes.service';

import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto';


import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { PdfService } from '../pdf/pdf.service';



@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {


  constructor(
    private quotesService: QuotesService,
    private pdfService: PdfService,
  ) {}





  // Créer un devis
  @Post()
  create(
    @Body() createQuoteDto: CreateQuoteDto,
    @Req() req:any,
  ){

    return this.quotesService.create({

      ...createQuoteDto,

      number:
        `DEV-${Date.now()}`,

      userId:
        req.user.id,

    });

  }







  // Tous les devis
  @Get()
  findAll(
    @Req() req:any,
  ){

    return this.quotesService.findAllByUser(
      req.user.id,
    );

  }







  // Un devis
  @Get(':id')
  findOne(
    @Param('id') id:string,
    @Req() req:any,
  ){

    return this.quotesService.findOne(
      id,
      req.user.id,
    );

  }







  // Générer PDF devis
  @Get(':id/pdf')
async pdf(
  @Param('id') id:string,
  @Req() req:any,
  @Res() res:any,
){

  const quote =
    await this.quotesService.findOneForPdf(
      id,
      req.user.id,
    );

    console.log(
  "DEVIS PDF =>",
  quote.number
);


console.log(
  "COMPANY =>",
  quote.user?.company
);


const pdf = await this.pdfService.generateQuotePdf(quote);


  res.setHeader(
    'Content-Type',
    'application/pdf',
  );


  res.setHeader(
    'Content-Disposition',
    `inline; filename=devis-${quote.number}.pdf`,
  );


  pdf.pipe(res);

}






  // Modifier un devis
  @Patch(':id')
  update(
    @Param('id') id:string,
    @Body() updateQuoteDto:UpdateQuoteDto,
    @Req() req:any,
  ){

    return this.quotesService.update(
      id,
      req.user.id,
      updateQuoteDto,
    );

  }








  // Modifier uniquement le statut
  @Patch(':id/status')
  updateStatus(
    @Param('id') id:string,
    @Body() dto:UpdateQuoteStatusDto,
    @Req() req:any,
  ){

    return this.quotesService.updateStatus(
      id,
      req.user.id,
      dto.status,
    );

  }








  // Supprimer un devis
  @Delete(':id')
  remove(
    @Param('id') id:string,
    @Req() req:any,
  ){

    return this.quotesService.remove(
      id,
      req.user.id,
    );

  }








  // Transformer devis en facture
  @Post(':id/convert')
  convertToInvoice(
    @Param('id') id:string,
    @Req() req:any,
  ){

    return this.quotesService.convertToInvoice(
      id,
      req.user.id,
    );

  }



}