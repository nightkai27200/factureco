import { Module } from '@nestjs/common';

import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';

import { PdfModule } from '../pdf/pdf.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { CommonModule } from '../common/common.module';


@Module({

  imports: [
    PrismaModule,
    PdfModule,
    SubscriptionModule,
    CommonModule,
  ],

  controllers: [
    QuotesController,
  ],

  providers: [
    QuotesService,
  ],

  exports: [
    QuotesService,
  ],

})
export class QuotesModule {}