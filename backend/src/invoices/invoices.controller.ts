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

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { PdfService } from '../pdf/pdf.service';

import { ElectronicInvoiceService } from './electronic/electronic-invoice.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly pdfService: PdfService,
    private readonly electronicInvoiceService: ElectronicInvoiceService,
  ) {}

  // ============================================================
  // TEST
  // ============================================================

  @Get('test')
  test() {
    return {
      ok: true,
      message: 'Invoices controller OK',
    };
  }

  // ============================================================
  // VALIDATION FACTURE ÉLECTRONIQUE
  // ============================================================

  @Get(':id/electronic-compliance')
  async validateElectronicCompliance(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.invoicesService.validateForElectronicInvoicing(
      id,
      req.user.id,
    );
  }

  // ============================================================
  // GÉNÉRATION FACTURE ÉLECTRONIQUE
  // ============================================================

  @Get(':id/electronic')
  async generateElectronicInvoice(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.electronicInvoiceService.generate(
      id,
      req.user.id,
    );
  }

  // ============================================================
  // LISTE DES FACTURES
  // ============================================================

  @Get()
  findAll(@Req() req: any) {
    return this.invoicesService.findAll(
      req.user.id,
    );
  }

  // ============================================================
  // UNE FACTURE
  // ============================================================

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.invoicesService.findOne(
      id,
      req.user.id,
    );
  }

  // ============================================================
  // PDF FACTURE
  // ============================================================

  @Get(':id/pdf')
  async pdf(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: any,
  ) {
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

    const pdf =
      await this.pdfService.generateInvoicePdf(
        invoice,
      );

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

  // ============================================================
  // CRÉATION FACTURE
  // ============================================================

  @Post()
  create(
    @Body() dto: CreateInvoiceDto,
    @Req() req: any,
  ) {
    return this.invoicesService.create({
      ...dto,

      userId: req.user.id,
    });
  }

  // ============================================================
  // CHANGEMENT DE STATUT
  // ============================================================

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.invoicesService.updateStatus(
      id,
      req.user.id,
      body.status,
    );
  }

  // ============================================================
  // SUPPRESSION
  // ============================================================

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.invoicesService.remove(
      id,
      req.user.id,
    );
  }
}