import { Module } from '@nestjs/common';

import { InvoiceItemsController } from './invoice-items.controller';
import { InvoiceItemsService } from './invoice-items.service';

import { PrismaModule } from '../prisma/prisma.module';


@Module({

  imports: [
    PrismaModule,
  ],


  controllers: [
    InvoiceItemsController,
  ],


  providers: [
    InvoiceItemsService,
  ],


  exports: [
    InvoiceItemsService,
  ],

})
export class InvoiceItemsModule {}