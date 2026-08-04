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

import type { Response } from 'express';

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
    private readonly quotesService: QuotesService,
    private readonly pdfService: PdfService,
  ) {}


  // =========================================================
  // CREER UN DEVIS
  // POST /quotes
  // =========================================================

  @Post()
  async create(
    @Body() createQuoteDto: CreateQuoteDto,
    @Req() req: any,
  ) {

    return this.quotesService.create({

      ...createQuoteDto,

      userId: req.user.id,

    });
  }


  // =========================================================
  // TOUS LES DEVIS
  // GET /quotes
  // =========================================================

  @Get()
  async findAll(
    @Req() req: any,
  ) {

    return this.quotesService.findAllByUser(
      req.user.id,
    );
  }


  // =========================================================
  // UN DEVIS
  // GET /quotes/:id
  // =========================================================

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    return this.quotesService.findOne(
      id,
      req.user.id,
    );
  }


  // =========================================================
  // PDF
  // GET /quotes/:id/pdf
  // =========================================================

  @Get(':id/pdf')
  async pdf(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {

    const quote =
      await this.quotesService.findOneForPdf(
        id,
        req.user.id,
      );


    const pdf =
      await this.pdfService.generateQuotePdf(
        quote,
      );


    res.setHeader(
      'Content-Type',
      'application/pdf',
    );


    res.setHeader(
      'Content-Disposition',
      `inline; filename="devis-${quote.number}.pdf"`,
    );


    pdf.pipe(res);
  }


  // =========================================================
  // MODIFIER UN DEVIS
  // PATCH /quotes/:id
  // =========================================================

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
    @Req() req: any,
  ) {

    return this.quotesService.update(
      id,
      req.user.id,
      updateQuoteDto,
    );
  }


  // =========================================================
  // MODIFIER LE STATUT
  // PATCH /quotes/:id/status
  // =========================================================

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateQuoteStatusDto,
    @Req() req: any,
  ) {

    return this.quotesService.updateStatus(
      id,
      req.user.id,
      dto.status,
    );
  }


  // =========================================================
  // SUPPRIMER UN DEVIS
  // DELETE /quotes/:id
  // =========================================================

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    return this.quotesService.remove(
      id,
      req.user.id,
    );
  }


  // =========================================================
  // CONVERTIR EN FACTURE
  // POST /quotes/:id/convert
  // =========================================================

  @Post(':id/convert')
  async convertToInvoice(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    return this.quotesService.convertToInvoice(
      id,
      req.user.id,
    );
  }
}