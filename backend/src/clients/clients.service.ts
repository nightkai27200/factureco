import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';


@Injectable()
export class ClientsService {


  constructor(
    private prisma: PrismaService,
    private subscriptionService: SubscriptionService,
  ) {}



  // Créer un client
  async create(data: any) {

  console.log("=== CREATION CLIENT ===");
  console.log("DATA REÇUE :", data);

  await this.subscriptionService.checkClientLimit(
    data.userId,
  );

  console.log("LIMITE CLIENT OK");

  const client = await this.prisma.client.create({
    data,
  });

  console.log("CLIENT CRÉÉ :", client);

  return client;

}




  // Tous les clients (admin)
  async findAll() {

    return this.prisma.client.findMany({
      orderBy:{
        createdAt:'desc',
      },
    });

  }





  // Clients d'un utilisateur
  async findAllByUser(userId:string) {

    return this.prisma.client.findMany({

      where:{
        userId,
      },

      orderBy:{
        createdAt:'desc',
      },

    });

  }





  // Trouver un client
  async findOne(
    id:string,
    userId:string,
  ) {


    return this.prisma.client.findFirst({

      where:{
        id,
        userId,
      },

    });

  }





  // Modifier un client
  async update(
    id:string,
    userId:string,
    data:any,
  ) {


    return this.prisma.client.update({

      where:{
        id,
        userId,
      },

      data,

    });

  }





  // Supprimer un client
  async remove(
    id:string,
    userId:string,
  ) {


    return this.prisma.client.delete({

      where:{
        id,
        userId,
      },

    });

  }



}