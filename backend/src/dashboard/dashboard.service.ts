import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class DashboardService {


constructor(
 private prisma: PrismaService,
){}




async getStats(userId:string){


const invoices =
await this.prisma.invoice.findMany({

where:{
 userId,
},

});



const quotes =
await this.prisma.quote.findMany({

where:{
 userId,
},

});



const clients =
await this.prisma.client.count({

where:{
 userId,
},

});





// CA HT

const revenueHT =
invoices.reduce(
(sum,invoice)=>
sum + invoice.subtotal,
0
);




// CA TTC

const revenueTTC =
invoices.reduce(
(sum,invoice)=>
sum + invoice.amount,
0
);





// Factures en attente

const pendingInvoices =
invoices.filter(
invoice =>
invoice.status === "SENT"
).length;






// devis acceptés

const acceptedQuotes =
quotes.filter(
quote =>
quote.status === "ACCEPTED"
).length;






return {

revenueHT,

revenueTTC,

pendingInvoices,

acceptedQuotes,

clients,

};


}



}