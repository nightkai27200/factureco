"use client";

import {
  useEffect,
  useState
} from "react";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getQuotes,
  createQuote,
  Quote
} from "@/services/quote.service";


import {
  getClients,
  Client
} from "@/services/client.service";

import api from "@/services/api";


type Line = {

  description:string;

  quantity:number;

  unitPrice:number;

};




export default function DevisPage(){


const [quotes,setQuotes] =
useState<Quote[]>([]);


const [clients,setClients] =
useState<Client[]>([]);



const [clientId,setClientId] =
useState("");



const [title,setTitle] =
useState("");



const [lines,setLines] =
useState<Line[]>([

{
 description:"",
 quantity:1,
 unitPrice:0
}

]);





async function loadData(){


try{


const q =
await getQuotes();


const c =
await getClients();



setQuotes(q);

setClients(c);


}

catch(error){

console.error(
"Erreur chargement données",
error
);

}


}






useEffect(()=>{


loadData();


},[]);








function updateLine(
index:number,
field:keyof Line,
value:any
){


const copy =
[...lines];


copy[index] = {

...copy[index],

[field]:value

};


setLines(copy);


}






function addLine(){


setLines([

...lines,

{

description:"",

quantity:1,

unitPrice:0

}

]);


}






function total(){


return lines.reduce(

(sum,line)=>

sum +

line.quantity *

line.unitPrice,

0

);


}







async function saveQuote(){



if(!clientId){

alert(
"Choisir un client"
);

return;

}



await createQuote({


clientId,


title,


amount:total(),



items:

lines.map(line=>({


description:
line.description,


quantity:
line.quantity,


unitPrice:
line.unitPrice,


total:
line.quantity *
line.unitPrice


}))



});



alert(
"Devis créé"
);



setTitle("");

setLines([

{
description:"",
quantity:1,
unitPrice:0
}

]);



loadData();



}








return (

<ProtectedRoute>


<main
style={{
padding:"40px"
}}
>


<h1>
Devis
</h1>



<h2>
Nouveau devis
</h2>




<select

value={clientId}

onChange={
e=>setClientId(
e.target.value
)
}

>


<option value="">

Choisir un client

</option>



{

clients.map(client=>(


<option

key={client.id}

value={client.id}

>

{client.name}

</option>


))


}



</select>




<br/><br/>





<input

placeholder="Titre du devis"

value={title}

onChange={
e=>setTitle(
e.target.value
)
}

/>





<h3>
Lignes
</h3>





{

lines.map((line,index)=>(


<div

key={index}

style={{

display:"flex",

gap:"10px",

marginBottom:"10px"

}}

>



<input

placeholder="Description"

value={line.description}

onChange={
e=>

updateLine(

index,

"description",

e.target.value

)

}

/>





<input

type="number"

value={line.quantity}

onChange={
e=>

updateLine(

index,

"quantity",

Number(
e.target.value
)

)

}

/>





<input

type="number"

value={line.unitPrice}

onChange={
e=>

updateLine(

index,

"unitPrice",

Number(
e.target.value
)

)

}

/>




</div>


))


}







<button
onClick={addLine}
>

Ajouter une ligne

</button>





<h3>

Total :

{total().toFixed(2)} €

</h3>





<button
onClick={saveQuote}
>

Créer le devis

</button>







<hr/>






<h2>
Mes devis
</h2>







{

quotes.map((q)=>(


<div

key={q.id}

style={{

border:"1px solid #ddd",

padding:"15px",

marginBottom:"10px",

borderRadius:"8px"

}}

>


<p>

<strong>

{q.number}

</strong>

</p>




<p>

Statut :

{q.status}

</p>




<p>

Montant :

{q.amount.toFixed(2)} €

</p>





<div

style={{

display:"flex",

gap:"10px"

}}

>




<button

onClick={async()=>{

try{


const response =
await api.get<Blob>(

`/quotes/${q.id}/pdf`,

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

console.error(
"Erreur PDF",
error
);

alert(
"Impossible de télécharger le PDF"
);

}


}}

>

📄 PDF

</button>







<button

onClick={async()=>{


await fetch(

`http://localhost:3000/quotes/${q.id}/convert`,

{

method:"POST",

headers:{

Authorization:

`Bearer ${localStorage.getItem("token")}`

}

}

);



alert(
"Devis transformé en facture"
);



loadData();



}}

>

🔄 Convertir

</button>







<button

onClick={async()=>{


await fetch(

`http://localhost:3000/quotes/${q.id}`,

{

method:"DELETE",

headers:{

Authorization:

`Bearer ${localStorage.getItem("token")}`

}

}

);



loadData();



}}

>

🗑 Supprimer

</button>






</div>




</div>



))


}





</main>


</ProtectedRoute>


);


}