import { Module } from '@nestjs/common';

import { InvoiceComplianceValidator } from './invoice-compliance.validator';

@Module({
  providers: [InvoiceComplianceValidator],
  exports: [InvoiceComplianceValidator],
})
export class InvoiceComplianceModule {}