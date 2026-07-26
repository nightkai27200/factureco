"use client";


import {
  useEffect,
  useState
} from "react";


import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getStats
} from "../../services/dashboard.service";

type Stats = {
  revenueHT: number;
  revenueTTC: number;
  pendingInvoices: number;
  acceptedQuotes: number;
  clients: number;
};








export default function Dashboard(){



const [stats,setStats] =
useState<Stats | null>(null);



const [loading,setLoading] =
useState(true);





useEffect(()=>{


async function loadDashboard(){


try{


const data =
await getStats();


setStats(data);



}
catch(error){


console.error(
"Erreur chargement dashboard :",
error
);


}
finally{


setLoading(false);


}



}



loadDashboard();



},[]);






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
Tableau de bord
</h1>





{loading && (

<p>
Chargement...
</p>

)}






{!loading && stats && (


<div>



<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(auto-fit,minmax(220px,1fr))",

gap:"20px",

marginTop:"30px"

}}

>



<Card

title="Chiffre d'affaires HT"

value={
`${stats.revenueHT.toFixed(2)} €`
}

/>



<Card

title="Chiffre d'affaires TTC"

value={
`${stats.revenueTTC.toFixed(2)} €`
}

/>



<Card

title="Factures en attente"

value={
String(stats.pendingInvoices)
}

/>



<Card

title="Clients"

value={
String(stats.clients)
}

/>



</div>





<div

style={{

marginTop:"30px",

background:"#fff",

padding:"25px",

borderRadius:"10px"

}}

>


<h2>
Devis acceptés
</h2>


<p

style={{

fontSize:"32px",

fontWeight:"bold"

}}

>

{stats.acceptedQuotes}

</p>


</div>



</div>


)}



</main>


</ProtectedRoute>


);


}







function Card({

title,

value

}:{

title:string;

value:string;

}){


return (


<div

style={{

background:"#fff",

padding:"25px",

borderRadius:"12px",

boxShadow:
"0 2px 8px rgba(0,0,0,0.08)"

}}

>


<h3>
{title}
</h3>


<p

style={{

fontSize:"30px",

fontWeight:"bold",

color:"#1e3a8a"

}}

>

{value}

</p>



</div>


);


}