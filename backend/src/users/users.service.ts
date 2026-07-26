import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';


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


const selectedPlan =
await this.prisma.subscriptionPlan.findUnique({

where:{
 name:data.plan || "FREE"
},

});



if(!selectedPlan){

throw new Error(
"Le plan FREE n'existe pas"
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
data.plan || "FREE",





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