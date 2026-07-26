import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { QuoteItemsService } from './quote-items.service';

import { CreateQuoteItemDto } from './dto/create-quote-item.dto';
import { UpdateQuoteItemDto } from './dto/update-quote-item.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('quote-items')
@UseGuards(JwtAuthGuard)
export class QuoteItemsController {


  constructor(
    private readonly quoteItemsService: QuoteItemsService,
  ) {}



  @Post()
  create(
    @Body() createQuoteItemDto: CreateQuoteItemDto,
    @Req() req: any,
  ) {

    return this.quoteItemsService.create(
      createQuoteItemDto,
      req.user.id,
    );

  }



  @Get(':quoteId')
  findAll(
    @Param('quoteId') quoteId: string,
    @Req() req: any,
  ) {

    return this.quoteItemsService.findAll(
      quoteId,
      req.user.id,
    );

  }



  @Get('item/:id')
  findOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    return this.quoteItemsService.findOne(
      id,
      req.user.id,
    );

  }



  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuoteItemDto: UpdateQuoteItemDto,
    @Req() req: any,
  ) {

    return this.quoteItemsService.update(
      id,
      updateQuoteItemDto,
      req.user.id,
    );

  }



  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Req() req: any,
  ) {

    return this.quoteItemsService.remove(
      id,
      req.user.id,
    );

  }

}