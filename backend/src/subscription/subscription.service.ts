import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class SubscriptionService {


  constructor(
    private prisma: PrismaService,
  ) {}



  async checkInvoiceLimit(userId:string){


    const user =
    await this.prisma.user.findUnique({

      where:{
        id:userId,
      },

      include:{
        subscription:true,
        invoices:true,
      },

    });



    if(!user){

      throw new ForbiddenException(
        "Utilisateur introuvable"
      );

    }



    const features =
    user.subscription?.features as any;



    const maxInvoices =
    features?.maxInvoices ?? 5;



    if(
      maxInvoices !== -1 &&
      user.invoices.length >= maxInvoices
    ){

      throw new ForbiddenException(
        `Limite atteinte : ${maxInvoices} factures maximum avec votre abonnement.`
      );

    }


    return true;

  }






  async checkClientLimit(userId:string){


    const user =
    await this.prisma.user.findUnique({

      where:{
        id:userId,
      },

      include:{
        subscription:true,
        clients:true,
      },

    });



    if(!user){

      throw new ForbiddenException(
        "Utilisateur introuvable"
      );

    }



    const features =
    user.subscription?.features as any;



    const maxClients =
    features?.maxClients ?? 5;



    if(
      maxClients !== -1 &&
      user.clients.length >= maxClients
    ){

      throw new ForbiddenException(
        `Limite atteinte : ${maxClients} clients maximum avec votre abonnement.`
      );

    }


    return true;

  }






  async checkQuoteLimit(userId:string){


    const user =
    await this.prisma.user.findUnique({

      where:{
        id:userId,
      },

      include:{
        subscription:true,
        quotes:true,
      },

    });



    if(!user){

      throw new ForbiddenException(
        "Utilisateur introuvable"
      );

    }



    const features =
    user.subscription?.features as any;



    const maxQuotes =
    features?.maxQuotes ?? 5;



    if(
      maxQuotes !== -1 &&
      user.quotes.length >= maxQuotes
    ){

      throw new ForbiddenException(
        `Limite atteinte : ${maxQuotes} devis maximum avec votre abonnement.`
      );

    }


    return true;

  }







  async getUserSubscription(userId:string){


    const user =
    await this.prisma.user.findUnique({

      where:{
        id:userId,
      },

      include:{
        subscription:true,
      },

    });



    if(!user){

      throw new ForbiddenException(
        "Utilisateur introuvable"
      );

    }



    return {

      id:user.id,

      email:user.email,

      subscriptionStatus:
      user.subscriptionStatus,

      subscription:
      user.subscription,

    };

  }


}