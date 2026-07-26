import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import {
  QuoteStatus,
  InvoiceStatus,
} from '@prisma/client';

import { SubscriptionService } from '../subscription/subscription.service';
import { NumberGeneratorService } from '../common/number-generator.service';

@Injectable()
export class QuotesService {

  constructor(
  private prisma: PrismaService,
  private subscriptionService: SubscriptionService,
  private numberGenerator: NumberGeneratorService,
) {}



  async create(data: any) {


  // Vérification limite devis abonnement
  await this.subscriptionService.checkQuoteLimit(
    data.userId,
  );



  const subtotal =
data.items.reduce(
(sum,item)=>
sum + item.quantity * item.unitPrice,
0,
);


const vatRate =
  data.vatRate ?? 20;


const allowedVatRates = [
  0,
  5.5,
  10,
  20,
];


if(
  !allowedVatRates.includes(vatRate)
){

  throw new BadRequestException(
    "Taux de TVA invalide. Valeurs autorisées : 0, 5.5, 10, 20"
  );

}


const vatAmount =
subtotal * vatRate / 100;


const total =
subtotal + vatAmount;



  return this.prisma.quote.create({

    data:{
      
      





number:`DEV-${Date.now()}`,

status:QuoteStatus.DRAFT,


title:data.title,


description:data.description,


subtotal,


vatRate,


vatAmount,


amount:total,


clientId:data.clientId,


userId:data.userId,





      quoteItems:{


        create:

          data.items.map(
            (item:any)=>({


              description:
                item.description,


              quantity:
                item.quantity,


              unitPrice:
                item.unitPrice,


              total:
                item.quantity *
                item.unitPrice,


            })
          ),


      },


    },


    include:{


      client:true,


      quoteItems:true,


    },


  });


}



  async findAllByUser(
    userId: string,
  ) {

    return this.prisma.quote.findMany({

      where: {
        userId,
      },

      include: {
        client: true,
        quoteItems: true,
      },

    });

  }





  async findOne(
    id: string,
    userId: string,
  ) {


    const quote =
      await this.prisma.quote.findFirst({

        where: {
          id,
          userId,
        },

        include: {
          client: true,
          quoteItems: true,
        },

      });



    if (!quote) {

      throw new NotFoundException(
        'Quote not found',
      );

    }



    return quote;

  }




  async findOneForPdf(
  id:string,
  userId:string,
){

  const quote =
    await this.prisma.quote.findFirst({

      where:{
        userId,

        OR:[
          {
            id,
          },
          {
            number:id,
          },
        ],
      },


      include:{

        client:true,

        quoteItems:true,


        user:{
          include:{
            company:true,
          },
        },

      },

    });



  if(!quote){

    throw new NotFoundException(
      'Quote not found',
    );

  }



  console.log(
    "QUOTE PDF USER =>",
    JSON.stringify(
      quote.user,
      null,
      2
    )
  );


  return quote;

}



  async update(
    id: string,
    userId: string,
    data: any,
  ) {


    const quote =
      await this.prisma.quote.findFirst({

        where:{
          id,
          userId,
        },

      });



    if(!quote){

      throw new NotFoundException(
        'Quote not found',
      );

    }



    return this.prisma.quote.update({

      where:{
        id,
      },

      data,

    });

  }







  async remove(
    id: string,
    userId: string,
  ) {


    const quote =
      await this.prisma.quote.findFirst({

        where:{
          id,
          userId,
        },

      });



    if(!quote){

      throw new NotFoundException(
        'Quote not found',
      );

    }



    return this.prisma.quote.delete({

      where:{
        id,
      },

    });

  }








  async convertToInvoice(
  id:string,
  userId:string,
) {


  const quote =
    await this.prisma.quote.findFirst({

      where:{
        id,
        userId,
      },

      include:{
        client:true,
        quoteItems:true,
      },

    });



  if(!quote){

    throw new NotFoundException(
      'Quote not found',
    );

  }



  console.log(
    "DEVIS CONVERSION =>",
    JSON.stringify(
      quote,
      null,
      2
    )
  );



  const existingInvoice =
    await this.prisma.invoice.findUnique({

      where:{
        quoteId: quote.id,
      },

      include:{
        invoiceItems:true,
      },

    });



  if(existingInvoice){

    return existingInvoice;

  }





  if(!quote.quoteItems || quote.quoteItems.length === 0){

    throw new BadRequestException(
      "Impossible de convertir : le devis ne contient aucune ligne"
    );

  }






  const subtotal =
  quote.quoteItems.reduce(

    (sum,item)=>
      sum +
      item.quantity *
      item.unitPrice,

    0

  );


const vatRate =
  quote.vatRate ?? 20;


const vatAmount =
  subtotal * vatRate / 100;


const amount =
  subtotal + vatAmount;







  const invoice =
    await this.prisma.invoice.create({

      data:{


        number:
  `FAC-${Date.now()}`,


status:
  InvoiceStatus.DRAFT,


subtotal,

vatRate,

vatAmount,

amount,



        clientId:
          quote.clientId,



        userId:
          quote.userId,



        quoteId:
          quote.id,




        invoiceItems:{


          create:

            quote.quoteItems.map(
              item=>({

                description:
                  item.description,


                quantity:
                  item.quantity,


                unitPrice:
                  item.unitPrice,


                total:
                  item.quantity *
                  item.unitPrice,

              })

            ),


        },


      },


      include:{


        client:true,


        invoiceItems:true,


      },


    });






  await this.prisma.quote.update({

    where:{
      id:quote.id,
    },


    data:{
      status:QuoteStatus.CONVERTED,
    },


  });






  console.log(
    "FACTURE CREEE =>",
    JSON.stringify(
      invoice,
      null,
      2
    )
  );



  return invoice;


}





    






    

async updateStatus(
  id: string,
  userId: string,
  status: QuoteStatus,
) {

  const quote =
    await this.findOne(
      id,
      userId,
    );


  if (
    !this.canChangeStatus(
      quote.status,
      status,
    )
  ) {

    throw new BadRequestException(
      `Impossible de passer de ${quote.status} à ${status}`,
    );

  }



  return this.prisma.quote.update({

    where:{
      id: quote.id,
    },

    data:{
      status,
    },

    include:{

      client:true,

      quoteItems:true,

    },

  });

}





private canChangeStatus(
  current: QuoteStatus,
  next: QuoteStatus,
): boolean {


  const transitions: Record<QuoteStatus, QuoteStatus[]> = {


    DRAFT:[
      QuoteStatus.SENT,
    ],


    SENT:[
      QuoteStatus.ACCEPTED,
      QuoteStatus.REFUSED,
    ],


    ACCEPTED:[
      QuoteStatus.CONVERTED,
    ],


    REFUSED:[],


    CONVERTED:[],


  };


  return transitions[current].includes(next);

}

}