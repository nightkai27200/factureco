"use client";


import Link from "next/link";



export default function PricingPage(){


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
"Factures PDF",
"Logo entreprise",
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

boxShadow:"0 5px 15px #ddd",

textAlign:"center"

}}

>



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

Choisir {plan.name}

</Link>





</div>


))


}




</div>





</main>


);


}