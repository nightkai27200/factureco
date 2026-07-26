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


import { InvoiceItemsService } from './invoice-items.service';

import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';



@Controller('invoice-items')
@UseGuards(JwtAuthGuard)
export class InvoiceItemsController {


  constructor(
    private readonly invoiceItemsService: InvoiceItemsService,
  ) {}





  // Ajouter une ligne facture
  @Post()
  create(
    @Body() createInvoiceItemDto: CreateInvoiceItemDto,
    @Req() req:any,
  ) {

    return this.invoiceItemsService.create(
      createInvoiceItemDto,
      req.user.id,
    );

  }





  // Récupérer une ligne précise
  @Get('item/:id')
  findOne(
    @Param('id') id:string,
    @Req() req:any,
  ) {

    return this.invoiceItemsService.findOne(
      id,
      req.user.id,
    );

  }





  // Récupérer les lignes d'une facture
  @Get(':invoiceId')
  findAll(
    @Param('invoiceId') invoiceId:string,
    @Req() req:any,
  ) {

    return this.invoiceItemsService.findAll(
      invoiceId,
      req.user.id,
    );

  }





  // Modifier une ligne
  @Patch(':id')
  update(
    @Param('id') id:string,
    @Body() updateInvoiceItemDto:UpdateInvoiceItemDto,
    @Req() req:any,
  ) {

    return this.invoiceItemsService.update(
      id,
      req.user.id,
      updateInvoiceItemDto,
    );

  }





  // Supprimer une ligne
    @Delete(':id')
  remove(
    @Param('id') id:string,
    @Req() req:any,
  ) {

    return this.invoiceItemsService.remove(
      id,
      req.user.id,
    );

  }


}