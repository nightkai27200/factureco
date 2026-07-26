import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateInvoiceItemDto } from './dto/create-invoice-item.dto';
import { UpdateInvoiceItemDto } from './dto/update-invoice-item.dto';



@Injectable()
export class InvoiceItemsService {


  constructor(
    private prisma: PrismaService,
  ) {}



  async create(
    createInvoiceItemDto: CreateInvoiceItemDto,
    userId:string,
  ) {

    const invoice =
      await this.prisma.invoice.findFirst({

        where:{
          id:createInvoiceItemDto.invoiceId,
          userId,
        },

      });


    if(!invoice){

      throw new NotFoundException(
        'Invoice not found',
      );

    }


    const total =
      createInvoiceItemDto.quantity *
      createInvoiceItemDto.unitPrice;



    const item =
      await this.prisma.invoiceItem.create({

        data:{

          description:createInvoiceItemDto.description,

          quantity:createInvoiceItemDto.quantity,

          unitPrice:createInvoiceItemDto.unitPrice,

          total,

          invoiceId:createInvoiceItemDto.invoiceId,

        },

      });



    await this.updateInvoiceAmount(
      createInvoiceItemDto.invoiceId,
    );


    return item;

  }



  async findAll(
    invoiceId:string,
    userId:string,
  ) {


    return this.prisma.invoiceItem.findMany({

      where:{
        invoiceId,

        invoice:{
          userId,
        },

      },

    });

  }




  async findOne(
    id:string,
    userId:string,
  ) {


    const item =
      await this.prisma.invoiceItem.findFirst({

        where:{
          id,

          invoice:{
            userId,
          },

        },

      });



    if(!item){

      throw new NotFoundException(
        'Invoice item not found',
      );

    }


    return item;

  }




  async update(
    id:string,
    userId:string,
    updateInvoiceItemDto:UpdateInvoiceItemDto,
  ) {


    const item =
      await this.findOne(
        id,
        userId,
      );


    const quantity =
      updateInvoiceItemDto.quantity ??
      item.quantity;


    const unitPrice =
      updateInvoiceItemDto.unitPrice ??
      item.unitPrice;



    const updated =
      await this.prisma.invoiceItem.update({

        where:{
          id,
        },


        data:{

          ...updateInvoiceItemDto,

          total:
            quantity * unitPrice,

        },

      });



    await this.updateInvoiceAmount(
      item.invoiceId,
    );


    return updated;

  }





  async remove(
    id:string,
    userId:string,
  ) {


    const item =
      await this.findOne(
        id,
        userId,
      );


    const deleted =
      await this.prisma.invoiceItem.delete({

        where:{
          id,
        },

      });



    await this.updateInvoiceAmount(
      item.invoiceId,
    );


    return deleted;

  }





  private async updateInvoiceAmount(
    invoiceId:string,
  ) {


    const items =
      await this.prisma.invoiceItem.findMany({

        where:{
          invoiceId,
        },

      });



    const amount =
      items.reduce(
        (sum,item)=>sum + item.total,
        0,
      );



    await this.prisma.invoice.update({

      where:{
        id:invoiceId,
      },

      data:{
        amount,
      },

    });

  }


}