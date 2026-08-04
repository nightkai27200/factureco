import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { QuotesModule } from './quotes/quotes.module';
import { InvoicesModule } from './invoices/invoices.module';
import { QuoteItemsModule } from './quote-items/quote-items.module';
import { InvoiceItemsModule } from './invoice-items/invoice-items.module';
import { PdfModule } from './pdf/pdf.module';
import { CompanyModule } from './company/company.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { StripeModule } from './stripe/stripe.module';

import { NumberGeneratorService } from './common/number-generator.service';

@Module({
  imports: [

    // =========================
    // CONFIGURATION
    // =========================

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // =========================
    // FICHIERS STATIQUES
    // =========================

    ServeStaticModule.forRoot({
      rootPath: join(
        process.cwd(),
        'uploads',
      ),

      serveRoot: '/uploads',
    }),

    // =========================
    // DATABASE
    // =========================

    PrismaModule,

    // =========================
    // AUTH
    // =========================

    AuthModule,

    // =========================
    // USERS
    // =========================

    UsersModule,

    // =========================
    // CLIENTS
    // =========================

    ClientsModule,

    // =========================
    // DEVIS
    // =========================

    QuotesModule,

    QuoteItemsModule,

    // =========================
    // FACTURES
    // =========================

    InvoicesModule,

    InvoiceItemsModule,

    // =========================
    // PDF
    // =========================

    PdfModule,

    // =========================
    // ENTREPRISE
    // =========================

    CompanyModule,

    // =========================
    // DASHBOARD
    // =========================

    DashboardModule,

    // =========================
    // STRIPE
    // =========================

    StripeModule,
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