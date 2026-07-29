import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PrismaService } from '../prisma/prisma.service';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [
    StripeModule,
  ],

  controllers: [
    SubscriptionController,
  ],

  providers: [
    SubscriptionService,
    PrismaService,
  ],

  exports: [
    SubscriptionService,
  ],
})
export class SubscriptionModule {}