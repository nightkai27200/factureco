import {
 Injectable
} from '@nestjs/common';


import Stripe from 'stripe';

import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';



@Injectable()
export class StripeService {


private stripe: Stripe;



constructor(

private config: ConfigService,

private prisma: PrismaService

){


const stripeKey =
this.config.get<string>(
  "STRIPE_SECRET_KEY"
);



if(!stripeKey){

throw new Error(
"STRIPE_SECRET_KEY manquante dans .env.local"
);

}



this.stripe =
new Stripe(

stripeKey,

{
apiVersion:"2026-06-24.dahlia"
}

);


}







async createCheckoutSession(
  plan:string,
  email:string,
  userId:string
){



const subscriptionPlan =
await this.prisma.subscriptionPlan.findUnique({

where:{
name:plan
}

});




if(!subscriptionPlan){

throw new Error(
"Plan introuvable"
);

}





if(!subscriptionPlan.stripePriceId){

throw new Error(
"Ce plan n'a pas de prix Stripe configuré"
);

}






const session =
await this.stripe.checkout.sessions.create({

mode:"subscription",



customer_email:
email,



line_items:[

{

price:
subscriptionPlan.stripePriceId,

quantity:1

}

],



success_url:
"https://factureco.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}",



cancel_url:
"https://factureco.vercel.app/payment-cancel",




metadata:{

plan:plan,

email:email,

userId:userId

}


});






return {

url:session.url

};


}









async handleWebhook(

payload:any,

signature:string

){



const endpointSecret =
this.config.get<string>(
"STRIPE_WEBHOOK_SECRET"
);




if(!endpointSecret){

throw new Error(
"STRIPE_WEBHOOK_SECRET manquante"
);

}





let event;



try{


event =
this.stripe.webhooks.constructEvent(

payload,

signature,

endpointSecret

);



}
catch(error){


throw new Error(
"Signature Stripe invalide"
);


}







// Paiement réussi

if(
event.type === "checkout.session.completed"
){



const session =
event.data.object as Stripe.Checkout.Session;



const userId =
session.metadata?.userId;



const plan =
session.metadata?.plan;



if(!userId || !plan){

throw new Error(
"Metadata Stripe manquante"
);

}




const subscriptionPlan =
await this.prisma.subscriptionPlan.findUnique({

where:{
name:plan
}

});





if(!subscriptionPlan){

throw new Error(
"Plan abonnement introuvable"
);

}






await this.prisma.user.update({

where:{
id:userId
},


data:{


subscriptionId:
subscriptionPlan.id,


subscriptionStatus:
"ACTIVE",


// sauvegarde client Stripe

stripeCustomerId:
session.customer as string


}


});



}









// Abonnement annulé

if(
event.type === "customer.subscription.deleted"
){



const subscription =
event.data.object as Stripe.Subscription;



const customerId =
subscription.customer as string;





const user =
await this.prisma.user.findFirst({

where:{
stripeCustomerId:customerId
}

});





if(user){



const freePlan =
await this.prisma.subscriptionPlan.findUnique({

where:{
name:"FREE"
}

});






await this.prisma.user.update({

where:{
id:user.id
},


data:{


subscriptionId:
freePlan?.id,


subscriptionStatus:
"ACTIVE"


}


});



}



}






return {

received:true

};


}


}