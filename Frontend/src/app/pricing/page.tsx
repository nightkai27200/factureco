"use client";

import Link from "next/link";
import { useState } from "react";


export default function PricingPage(){


const [loading, setLoading] = useState("");



async function handleCheckout(plan:string){


try {


setLoading(plan);


const token = localStorage.getItem("token");


if(!token){

alert("Vous devez être connecté pour continuer");

return;

}



const response = await fetch(

`${process.env.NEXT_PUBLIC_API_URL}/stripe/create-checkout`,

{

method:"POST",

headers:{

"Content-Type":"application/json",

"Authorization":`Bearer ${token}`

},


body:JSON.stringify({

plan

})

}

);



const data = await response.json();



if(data.url){

window.location.href = data.url;

}


}

catch(error){

console.error(error);

alert("Erreur lors de la création du paiement");

}

finally{

setLoading("");

}


}





const plans = [

{
name:"FREE",
price:"0 €",
features:[
"5 clients",
"5 devis",
"PDF simple"
]
},


{
name:"STARTER",
price:"9,99 €/mois",
features:[
"Clients illimités",
"Devis illimités",
"Factures PDF professionnelles",
"Logo de votre entreprise",
"Suivi des paiements",
"Support"
]
},



{
name:"PRO",
price:"19,99 €/mois",
features:[
"Tout Starter",
"Statistiques avancées",
"Support prioritaire",
"Fonctions professionnelles"
]
}


];






return (


<main

style={{

padding:"60px",

background:"#f5f7fb",

minHeight:"100vh"

}}

>


<h1

style={{

textAlign:"center",

fontSize:"40px"

}}

>

Choisissez votre abonnement

</h1>





<p

style={{

textAlign:"center"

}}

>

Commencez gratuitement puis évoluez selon vos besoins.

</p>






<div

style={{

display:"flex",

justifyContent:"center",

gap:"30px",

flexWrap:"wrap",

marginTop:"50px"

}}

>


{

plans.map((plan)=>(


<div

key={plan.name}

style={{

background:"#fff",

width:"300px",

padding:"30px",

borderRadius:"15px",

boxShadow:
plan.name === "STARTER"
  ? "0 8px 25px rgba(30,58,138,0.25)"
  : "0 5px 15px #ddd",

textAlign:"center",

border:
plan.name === "STARTER"
  ? "2px solid #1e3a8a"
  : "1px solid #eee",

position:"relative"

}}

>

{plan.name === "STARTER" && (

<div
style={{
position:"absolute",
top:"-15px",
left:"50%",
transform:"translateX(-50%)",
background:"#1e3a8a",
color:"white",
padding:"6px 18px",
borderRadius:"20px",
fontSize:"13px",
fontWeight:"bold",
whiteSpace:"nowrap"
}}
>
LE PLUS POPULAIRE
</div>

)}

<h2>
{plan.name}
</h2>





<h3

style={{

fontSize:"30px"

}}

>

{plan.price}

</h3>


{plan.name === "STARTER" && (

<p
style={{
fontSize:"14px",
color:"#555",
marginTop:"-15px",
marginBottom:"20px"
}}
>
Pour les entrepreneurs qui veulent gagner du temps
</p>

)}





<ul

style={{

textAlign:"left"

}}

>


{

plan.features.map((feature)=>(


<li key={feature}>

✓ {feature}

</li>


))

}


</ul>






{

plan.name === "FREE" ?


<Link

href={`/register?plan=${plan.name}`}

style={{

display:"block",

marginTop:"30px",

background:"#1e3a8a",

color:"white",

padding:"12px",

borderRadius:"8px",

textDecoration:"none"

}}

>

Créer un compte

</Link>



:


<button

onClick={()=>handleCheckout(plan.name)}

disabled={loading !== ""}


style={{

display:"block",

width:"100%",

marginTop:"30px",

background:"#1e3a8a",

color:"white",

padding:"12px",

borderRadius:"8px",

border:"none",

cursor:"pointer"

}}

>


{

loading === plan.name

?

"Redirection Stripe..."

:

plan.name === "STARTER"

? "Passer à STARTER"

: `Choisir ${plan.name}`

}


</button>



}



</div>


))


}


</div>





</main>


);


}