import { Module } from '@nestjs/common';
import { QuoteItemsService } from './quote-items.service';
import { QuoteItemsController } from './quote-items.controller';

@Module({
  controllers: [QuoteItemsController],
  providers: [QuoteItemsService],
})
export class QuoteItemsModule {}
