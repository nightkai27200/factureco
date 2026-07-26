import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';


async function main() {


const app =
await NestFactory.createApplicationContext(
  AppModule
);



const prisma =
app.get(PrismaService);



const hash =
await bcrypt.hash(
  "123456",
  10
);



const user =
await prisma.user.update({

where:{
 email:"kevdev59177@gmail.com",
},


data:{
 passwordHash:hash,
},


});



console.log(
"Utilisateur modifié :",
user.email
);


console.log(
"Mot de passe : 123456"
);



await app.close();

}


main();