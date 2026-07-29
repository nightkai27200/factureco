"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";


type Item = {
  description: string;
  quantity: number;
  price: number;
};


type Client = {
  id: string;
  name: string;
};



export default function NewInvoicePage() {


const router = useRouter();


const [clients,setClients] = useState<Client[]>([]);

const [clientId,setClientId] = useState("");


const [items,setItems] = useState<Item[]>([
  {
    description:"",
    quantity:1,
    price:0
  }
]);


const [loading,setLoading] = useState(false);





// Chargement des clients

useEffect(()=>{


async function loadClients(){

try{

const response =
await api.get<Client[]>("/clients");


setClients(response.data);


}
catch(error){

console.error(
"Erreur chargement clients",
error
);

}

}


loadClients();


},[]);







// Modification ligne facture

function updateItem(
index:number,
field:keyof Item,
value:string|number
){


const newItems=[...items];


newItems[index]={
...newItems[index],
[field]:value
};


setItems(newItems);


}







function addItem(){


setItems([
...items,
{
description:"",
quantity:1,
price:0
}
]);


}








function removeItem(index:number){


if(items.length === 1)
return;


setItems(
items.filter((_,i)=>i!==index)
);


}








// Calculs

const totalHT =
items.reduce(
(total,item)=>
total + item.quantity * item.price,
0
);


const tva =
totalHT * 0.20;


const totalTTC =
totalHT + tva;








// Création facture

async function createInvoice(){


if(!clientId){

alert(
"Veuillez choisir un client"
);

return;

}



if(items.some(
(item)=>
!item.description ||
item.price <=0
)){

alert(
"Veuillez compléter les produits"
);

return;

}




try{


setLoading(true);



await api.post(
"/invoices",
{

clientId,

items,

amount:totalTTC,

status:"DRAFT"

}

);




router.push("/factures");



}
catch(error){


console.error(
"Erreur création facture",
error
);


alert(
"Erreur lors de la création"
);



}
finally{

setLoading(false);

}


}








return (

<ProtectedRoute>


<main

style={{
padding:"40px",
maxWidth:"1000px"
}}

>


<h1>
➕ Nouvelle facture
</h1>





<div
style={{
marginBottom:"25px"
}}
>


<label>
Client
</label>



<select

value={clientId}

onChange={(e)=>
setClientId(e.target.value)
}


style={{
display:"block",
width:"100%",
padding:"12px",
marginTop:"8px",
borderRadius:"8px"
}}

>


<option value="">
-- Choisir un client --
</option>


{
clients.map((client)=>(

<option

key={client.id}

value={client.id}

>

{client.name}

</option>


))

}


</select>


</div>









<h2>
Produits / Services
</h2>





{

items.map(
(item,index)=>(


<div

key={index}

style={{
display:"grid",
gridTemplateColumns:
"2fr 100px 150px 50px",
gap:"10px",
marginBottom:"10px"
}}

>



<input

placeholder="Description"

value={item.description}

onChange={(e)=>
updateItem(
index,
"description",
e.target.value
)
}


/>





<input

type="number"

min="1"

value={item.quantity}

onChange={(e)=>
updateItem(
index,
"quantity",
Number(e.target.value)
)
}


/>





<input

type="number"

placeholder="Prix"

value={item.price}

onChange={(e)=>
updateItem(
index,
"price",
Number(e.target.value)
)
}


/>






<button

onClick={()=>
removeItem(index)
}

>

🗑

</button>





</div>


)

)



}





<button

onClick={addItem}

style={{
marginTop:"10px"
}}

>

➕ Ajouter une ligne

</button>









<hr

style={{
margin:"30px 0"
}}

/>





<div>

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
{totalTTC.toFixed(2)} €
</h2>


</div>









<button

disabled={loading}

onClick={createInvoice}

style={{

marginTop:"20px",

padding:"14px 25px",

background:"#2563eb",

color:"white",

border:"none",

borderRadius:"8px",

cursor:"pointer"

}}

>


{
loading
?
"Création..."
:
"Créer la facture"
}



</button>







</main>


</ProtectedRoute>


);


}