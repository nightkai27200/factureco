import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';

import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { QuotesModule } from './quotes/quotes.module';
import { InvoicesModule } from './invoices/invoices.module';

import { AuthModule } from './auth/auth.module';

import { QuoteItemsModule } from './quote-items/quote-items.module';
import { InvoiceItemsModule } from './invoice-items/invoice-items.module';

import { PdfModule } from './pdf/pdf.module';

import { CompanyModule } from './company/company.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { NumberGeneratorService } from './common/number-generator.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { StripeModule } from './stripe/stripe.module';


@Module({

  imports: [

    ConfigModule.forRoot({
      isGlobal:true,
    }),


    ServeStaticModule.forRoot({

      rootPath:
        join(
          process.cwd(),
          'uploads'
        ),

      serveRoot:'/uploads',

    }),


    PrismaModule,

    StripeModule,

    AuthModule,

    UsersModule,

    ClientsModule,

    QuotesModule,

    InvoicesModule,

    QuoteItemsModule,

    InvoiceItemsModule,

    PdfModule,

    CompanyModule,

     DashboardModule,

  ],



  controllers: [

    AppController,

  ],



  providers: [

    AppService,

    NumberGeneratorService,

  ],


})

export class AppModule {}