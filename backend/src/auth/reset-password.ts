import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';


async function main(){


const prisma =
new PrismaService();



const hash =
await bcrypt.hash(
  "123456",
  10,
);



await prisma.user.update({

where:{
 email:"kevdev59177@gmail.com",
},


data:{
 passwordHash:hash,
},


});



console.log(
"Mot de passe changé : 123456"
);


await prisma.$disconnect();

}


main();