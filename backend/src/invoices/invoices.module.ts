import { Module } from '@nestjs/common';

import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

import { InvoiceComplianceModule } from './compliance/invoice-compliance.module';

import { ElectronicInvoiceModule } from './electronic/electronic-invoice.module';

import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    InvoiceComplianceModule,
    ElectronicInvoiceModule,
    PdfModule,
  ],

  controllers: [
    InvoicesController,
  ],

  providers: [
    InvoicesService,
  ],

  exports: [
    InvoicesService,
  ],
})
export class InvoicesModule {}