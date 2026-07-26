import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateQuoteItemDto } from './dto/create-quote-item.dto';
import { UpdateQuoteItemDto } from './dto/update-quote-item.dto';


@Injectable()
export class QuoteItemsService {

  constructor(
    private prisma: PrismaService,
  ) {}



  // Créer une ligne de devis
  async create(
    createQuoteItemDto: CreateQuoteItemDto,
    userId: string,
  ) {


    const quote = await this.prisma.quote.findFirst({

      where: {
        id: createQuoteItemDto.quoteId,
        userId,
      },

    });


    if (!quote) {

      throw new NotFoundException(
        'Quote not found',
      );

    }



    const total =
      createQuoteItemDto.quantity *
      createQuoteItemDto.unitPrice;



    const item = await this.prisma.quoteItem.create({

      data: {

        description: createQuoteItemDto.description,

        quantity: createQuoteItemDto.quantity,

        unitPrice: createQuoteItemDto.unitPrice,

        total,

        quoteId: createQuoteItemDto.quoteId,

      },

    });



    await this.updateQuoteAmount(
      createQuoteItemDto.quoteId,
    );


    return item;

  }





  // Récupérer les lignes d'un devis
  async findAll(
    quoteId: string,
    userId: string,
  ) {


    const quote = await this.prisma.quote.findFirst({

      where:{
        id: quoteId,
        userId,
      },

    });



    if(!quote){

      throw new NotFoundException(
        'Quote not found',
      );

    }



    return this.prisma.quoteItem.findMany({

      where:{
        quoteId,
      },

    });

  }





  // Récupérer une ligne
  async findOne(
    id: string,
    userId: string,
  ) {


    const item = await this.prisma.quoteItem.findFirst({

      where:{
        id,

        quote:{
          userId,
        },

      },

    });



    if(!item){

      throw new NotFoundException(
        'Quote item not found',
      );

    }



    return item;

  }





  // Modifier une ligne
  async update(
    id: string,
    updateQuoteItemDto: UpdateQuoteItemDto,
    userId: string,
  ) {


    const item = await this.findOne(
      id,
      userId,
    );



    const quantity =
      updateQuoteItemDto.quantity ??
      item.quantity;



    const unitPrice =
      updateQuoteItemDto.unitPrice ??
      item.unitPrice;



    const updated =
      await this.prisma.quoteItem.update({

        where:{
          id,
        },


        data:{

          ...updateQuoteItemDto,

          total:
            quantity * unitPrice,

        },

      });



    await this.updateQuoteAmount(
      item.quoteId,
    );



    return updated;

  }





  // Supprimer une ligne
  async remove(
    id: string,
    userId: string,
  ) {


    const item = await this.findOne(
      id,
      userId,
    );



    const deleted =
      await this.prisma.quoteItem.delete({

        where:{
          id,
        },

      });



    await this.updateQuoteAmount(
      item.quoteId,
    );



    return deleted;

  }





  // Recalcul du montant du devis
  private async updateQuoteAmount(
    quoteId: string,
  ) {


    const items =
      await this.prisma.quoteItem.findMany({

        where:{
          quoteId,
        },

      });



    const amount =
      items.reduce(

        (total,item)=>
          total + item.total,

        0,

      );



    await this.prisma.quote.update({

      where:{
        id:quoteId,
      },


      data:{
        amount,
      },

    });

  }

}