import { Module } from '@nestjs/common';

import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';

import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../pdf/pdf.module';


@Module({

  imports: [
    PrismaModule,
    PdfModule,
  ],


  controllers: [
    InvoicesController,
  ],


  providers: [
    InvoicesService,
  ],

})
export class InvoicesModule {}