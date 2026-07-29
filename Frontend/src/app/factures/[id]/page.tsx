"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";


type Invoice = {

  id:string;

  number:string;

  status:string;

  amount:number;


  invoiceItems:{
    description:string;
    quantity:number;
    unitPrice:number;
    total:number;
  }[];


  client:{
    name:string;
    email?:string;
    address?:string;
  };

};





export default function InvoiceDetailsPage(){


const params = useParams();

const router = useRouter();


const id = params.id as string;



const [invoice,setInvoice] =
useState<Invoice | null>(null);


const [loading,setLoading] =
useState(true);






async function loadInvoice(){


try{


const response =
await api.get<Invoice>(
`/invoices/${id}`
);


console.log(
"FACTURE :",
response.data
);


setInvoice(
response.data
);



}
catch(error){

console.error(
"Erreur chargement facture",
error
);


}
finally{

setLoading(false);

}


}







useEffect(()=>{


if(id){

loadInvoice();

}


},[id]);









async function downloadPdf(){


try{


const response =
await api.get<Blob>(

`/invoices/${id}/pdf`,

{

responseType:"blob"

}

);




const url =
window.URL.createObjectURL(
response.data
);



window.open(url);



}
catch(error){

console.error(error);

alert(
"Erreur génération PDF"
);

}


}










if(loading){

return (

<p>
Chargement...
</p>

);

}







if(!invoice){

return (

<p>
Facture introuvable
</p>

);

}







const totalHT =
(invoice.invoiceItems ?? []).reduce(
  (total,item)=>
    total + item.total,
  0
);


const tva =
totalHT * 0.20;


const totalTTC =
totalHT + tva;








return (


<ProtectedRoute>


<main

style={{

padding:"40px",

maxWidth:"900px",

margin:"auto"

}}

>



<button

onClick={()=>router.push("/factures")}

style={{

marginBottom:"20px"

}}

>

⬅ Retour

</button>







<div

style={{

border:"1px solid #ddd",

borderRadius:"10px",

padding:"30px"

}}

>






<div

style={{

display:"flex",

justifyContent:"space-between",

alignItems:"center"

}}

>


<div>

<h1>
Facture
</h1>


<h2>
{invoice.number}
</h2>


<p>
Statut : {invoice.status}
</p>


</div>





<button

onClick={downloadPdf}

>

📄 Télécharger PDF

</button>



</div>







<hr/>







<h3>
Client
</h3>


<p>
<strong>
{invoice.client?.name}
</strong>
</p>


<p>
{invoice.client?.email}
</p>


<p>
{invoice.client?.address}
</p>









<h3>
Détails
</h3>





<table

style={{

width:"100%",

borderCollapse:"collapse"

}}

>


<thead>

<tr>

<th
style={{
textAlign:"left",
padding:"10px"
}}
>
Description
</th>


<th
style={{
padding:"10px"
}}
>
Quantité
</th>


<th
style={{
padding:"10px"
}}
>
Prix
</th>


<th
style={{
padding:"10px"
}}
>
Total
</th>


</tr>

</thead>





<tbody>


{

(invoice.invoiceItems ?? [])
.map(

(item,index)=>(


<tr

key={index}

style={{

borderBottom:"1px solid #ddd"

}}

>


<td
style={{
padding:"10px"
}}
>
{item.description}
</td>



<td
style={{
padding:"10px",
textAlign:"center"
}}
>
{item.quantity}
</td>




<td
style={{
padding:"10px",
textAlign:"right"
}}
>
{item.unitPrice.toFixed(2)} €
</td>





<td

style={{

padding:"10px",

textAlign:"right"

}}

>

{item.total.toFixed(2)} €

</td>




</tr>


)

)


}





</tbody>


</table>







<hr/>








<div

style={{

textAlign:"right",

marginTop:"20px"

}}

>



<p>

Total HT :

<strong>

{" "}

{totalHT.toFixed(2)} €

</strong>

</p>





<p>

TVA 20% :

<strong>

{" "}

{tva.toFixed(2)} €

</strong>

</p>







<h2>

Total TTC :

{" "}

{totalTTC.toFixed(2)} €

</h2>






</div>








</div>






</main>



</ProtectedRoute>


);


}