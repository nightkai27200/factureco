import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';



@Injectable()
export class InvoicesService {


  constructor(
    private prisma: PrismaService,
  ) {}




  // Créer une facture
  async create(
  data:any,
) {


  const {
    items,
    ...invoiceData
  } = data;



  const subtotal =
items.reduce(
  (sum,item) =>
    sum + (item.quantity * item.unitPrice),
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
    "Taux de TVA invalide. Autorisés : 0, 5.5, 10, 20"
  );

}


const vatAmount =
  subtotal * vatRate / 100;


const amount =
subtotal + vatAmount;

return this.prisma.invoice.create({

  data:{

    ...invoiceData,


    number:
      `FAC-${Date.now()}`,


    status:
      InvoiceStatus.DRAFT,


    subtotal,

    vatRate,

    vatAmount,

    amount,


    invoiceItems:{

        create:

          items.map(item => ({

            description:
              item.description,


            quantity:
              item.quantity,


            unitPrice:
              item.unitPrice,


            total:
              item.quantity * item.unitPrice,

          })),


      },


    },


    include:{

  client:true,

  invoiceItems:true,

  user:{
    include:{
      company:true,
    },
  },

},})


}






  // Toutes les factures utilisateur
  async findAll(
    userId:string,
  ) {


    return this.prisma.invoice.findMany({

      where:{
        userId,
      },


      include:{

  client:true,

  quote:true,

  invoiceItems:true,

  user:{
    include:{
      company:true,
    },
  },

},})

  }






  // Une facture
  async findOne(
    id:string,
    userId:string,
  ) {


    const invoice =
      await this.prisma.invoice.findFirst({

        where:{

          id,

          userId,

        },


        include:{

  client:true,

  quote:true,

  invoiceItems:true,

  user:{
    include:{
      company:true,
    },
  },

},})




    if(!invoice){

      throw new NotFoundException(
        'Invoice not found',
      );

    }



    return invoice;

  }








  // Modifier une facture
  async update(
    id:string,
    userId:string,
    data:any,
  ) {



    const invoice =
      await this.findOne(
        id,
        userId,
      );



    return this.prisma.invoice.update({

      where:{
        id:invoice.id,
      },


      data,


      include:{

  client:true,

  invoiceItems:true,

  user:{
    include:{
      company:true,
    },
  },

},})

  }








  // Supprimer une facture
  async remove(
    id:string,
    userId:string,
  ) {


    const invoice =
      await this.findOne(
        id,
        userId,
      );



    return this.prisma.invoice.delete({

      where:{
        id:invoice.id,
      },

    });

  }

    // Facture complète pour génération PDF
    async findOneForPdf(
  id:string,
  userId:string,
){

  const invoices =
    await this.prisma.invoice.findMany();


  console.log(
    "TOUTES LES FACTURES =>",
    JSON.stringify(invoices,null,2)
  );


  const invoice =
    await this.prisma.invoice.findUnique({

      where:{
  id,
  userId,
},
      include:{
        client:true,
        invoiceItems:true,

        user:{
          include:{
            company:true,
          },
        },

      },

    });


  console.log(
    "FACTURE PDF =>",
    invoice
  );


  if(!invoice){

    throw new NotFoundException(
      'Invoice not found',
    );

  }


  return invoice;

}



  



  async updateStatus(
  id:string,
  userId:string,
  status:InvoiceStatus,
){

  const invoice =
    await this.findOne(
      id,
      userId,
    );


  // même statut = on retourne simplement la facture
  if(invoice.status === status){

    return invoice;

  }



  const allowedTransitions:
  Record<InvoiceStatus, InvoiceStatus[]> = {


    DRAFT:[
      InvoiceStatus.SENT,
    ],


    SENT:[
      InvoiceStatus.PAID,
      InvoiceStatus.CANCELLED,
    ],


    PAID:[],


    CANCELLED:[],


  };




  if(
    !allowedTransitions[invoice.status]
      .includes(status)
  ){

    throw new BadRequestException(
      `Impossible de passer de ${invoice.status} à ${status}`,
    );

  }




  return this.prisma.invoice.update({

    where:{
      id:invoice.id,
    },


    data:{
      status,
    },


    include:{

  client:true,

  quote:true,

  invoiceItems:true,

  user:{
    include:{
      company:true,
    },
  },

},})


}


}



