import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


const adapter = new PrismaPg({

  connectionString: process.env.DATABASE_URL,

});


const prisma = new PrismaClient({
  adapter,
});



async function main(){


await prisma.subscriptionPlan.createMany({

data:[

{
name:"FREE",

price:0,

features:{
  maxClients:10,
  maxQuotes:5,
  maxInvoices:5,
  logo:true,
  pdf:true
}

},


{
name:"STARTER",

price:9.99,

features:{
  maxClients:-1,
  maxQuotes:-1,
  maxInvoices:-1,
  logo:true,
  pdf:true,
  support:true
}

}

],

skipDuplicates:true

});


console.log("Plans créés");


}



main()

.catch((e)=>{

console.error(e);

process.exit(1);

})

.finally(async()=>{

await prisma.$disconnect();

});