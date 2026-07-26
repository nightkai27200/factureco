"use client";


import {
  useEffect,
  useState
} from "react";


import ProtectedRoute from "@/components/ProtectedRoute";



import {
  getMySubscription,
  upgradePlan
} from "@/services/subscription.service";

import {
createCheckout
} from "@/services/stripe.service";




export default function SubscriptionPage(){


const [subscription,setSubscription] =
useState<any>(null);


const [loading,setLoading] =
useState(true);





useEffect(()=>{


 


async function load(){


try{


const data =
await getMySubscription();


setSubscription(data);


}
catch(error){

console.error(
"Erreur abonnement :",
error
);

}
finally{

setLoading(false);

}


}


load();


},[]);



async function handlePayment(
  plan:string
){

try{


const data =
  await createCheckout(plan);


window.location.href =
  data.url;


}
catch(error){

console.error(error);

alert(
"Erreur Stripe"
);

}

}


async function handleUpgrade(
plan:string
){


if(
!confirm(
`Passer à l'offre ${plan} ?`
)
){
return;
}


try{


const data =
await upgradePlan(plan);



setSubscription(data);



alert(
"Abonnement mis à jour"
);



}
catch(error){


console.error(error);


alert(
"Erreur changement abonnement"
);


}


}






return (


<ProtectedRoute>


<main

style={{

padding:"40px",

background:"#f5f7fb",

minHeight:"100vh"

}}

>


<h1>
Mon abonnement
</h1>





{loading && (

<p>
Chargement...
</p>

)}






{
subscription && (

    


<div

style={{

background:"#fff",

padding:"30px",

borderRadius:"15px",

maxWidth:"600px"

}}

>

    {
!loading && !subscription && (

<p>
Impossible de charger l'abonnement.
</p>

)
}


<h2>

Plan actuel :


<p>

Statut :

<strong>
{
subscription.subscriptionStatus
}

</strong>

</p>

{" "}

{
subscription.subscription?.name
}

</h2>





<h3>

Prix :

{" "}

{
subscription.subscription?.price
} €

/ mois

</h3>






<h3>
Fonctionnalités
</h3>




<ul>

{

Object.entries(
subscription.subscription?.features || {}
)

.map(([key,value])=>(


<li key={key}>

{key}

 :

{" "}

{String(value)}

</li>


))


}

</ul>







<hr />



<h2>
Changer d'offre
</h2>





<button

onClick={()=>
handlePayment("STARTER")
}

style={{

padding:"12px 20px",

background:"#1e3a8a",

color:"white",

borderRadius:"8px"

}}

>

Passer STARTER

</button>







<button

onClick={()=>
handlePayment("PRO")
}

style={{

padding:"12px 20px",

background:"#16a34a",

color:"white",

borderRadius:"8px"

}}

>

Passer PRO

</button>





</div>


)}





</main>


</ProtectedRoute>


);


}