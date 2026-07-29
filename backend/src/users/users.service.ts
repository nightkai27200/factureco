import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SubscriptionStatus } from '@prisma/client';


@Injectable()
export class UsersService {


  constructor(
    private prisma: PrismaService,
  ) {}




  async create(data: {
  email: string;
  name?: string;
  password: string;
  plan?: string;
}) {

  console.log("DONNEES RECUES :", data);


const selectedPlan =
await this.prisma.subscriptionPlan.findUnique({

where:{
 name:data.plan || "FREE"
},

});



if(!selectedPlan){

throw new Error(
`Le plan ${data.plan || "FREE"} n'existe pas`
);

}




const hash =
await bcrypt.hash(
data.password,
10,
);





return this.prisma.$transaction(
async(tx)=>{


const user =
await tx.user.create({

data:{


email:data.email,


name:
data.name
||
"Utilisateur",


passwordHash:hash,


subscriptionId:
selectedPlan.id,


subscriptionStatus:
data.plan === "STARTER"
  ? SubscriptionStatus.PENDING
  : SubscriptionStatus.FREE,




},

});





await tx.company.create({

data:{


name:
`${data.name || "Mon"} Entreprise`,


userId:user.id,


},

});





return user;


});

}







  async findOneByEmail(
    email:string,
  ) {


    return this.prisma.user.findUnique({

      where:{
        email,
      },


      include:{

        subscription:true,

        company:true,

      },


    });


  }








  async resetPassword(
    email:string,
    newPassword:string,
  ){


    const hash =
      await bcrypt.hash(
        newPassword,
        10,
      );



    return this.prisma.user.update({


      where:{
        email,
      },


      data:{

        passwordHash:hash,

      },


    });


  }




}