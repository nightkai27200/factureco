"use client";


import Link from "next/link";


export default function PaymentSuccess(){


return (

<main

style={{

padding:"50px",

textAlign:"center"

}}

>


<h1>
Paiement réussi 🎉
</h1>


<p>
Votre abonnement va être activé.
</p>



<Link href="/dashboard">

Accéder au tableau de bord

</Link>


</main>


);


}