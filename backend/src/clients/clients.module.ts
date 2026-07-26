import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubscriptionModule } from '../subscription/subscription.module';


@Module({

  imports: [
    PrismaModule,
    SubscriptionModule,
  ],

  controllers: [
    ClientsController,
  ],

  providers: [
    ClientsService,
  ],

  exports: [
    ClientsService,
  ],

})
export class ClientsModule {}