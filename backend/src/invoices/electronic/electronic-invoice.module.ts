import { Module } from '@nestjs/common';

import { ElectronicInvoiceService } from './electronic-invoice.service';

import { InvoiceComplianceModule } from '../compliance/invoice-compliance.module';

@Module({
  imports: [
    InvoiceComplianceModule,
  ],

  providers: [
    ElectronicInvoiceService,
  ],

  exports: [
    ElectronicInvoiceService,
  ],
})
export class ElectronicInvoiceModule {}