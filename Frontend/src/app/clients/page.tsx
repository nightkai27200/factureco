"use client";


import {
 useEffect,
 useState
} from "react";


import ProtectedRoute
from "@/components/ProtectedRoute";


import {
 getClients,
 createClient,
 deleteClient,
 Client
}
from "@/services/client.service";



export default function ClientsPage(){


const [clients,setClients]
=
useState<Client[]>([]);


const [name,setName]
=
useState("");

const [email,setEmail]
=
useState("");



async function loadClients(){

 const data =
 await getClients();

 setClients(data);

}



useEffect(()=>{

 loadClients();

},[]);




async function addClient(){

  try {

    await createClient({
      name,
      email
    });

    setName("");
    setEmail("");

    await loadClients();

  } catch (error: any) {

    console.error(
      "Erreur création client :",
      error
    );

    const message =
      error?.response?.data?.message;

    if (
      error?.response?.status === 403 &&
      message?.includes("Limite atteinte")
    ) {

      alert(
        "Vous avez atteint la limite de 5 clients avec votre abonnement FREE.\n\nPassez à STARTER pour avoir des clients illimités."
      );

      return;
    }

    alert(
      message ||
      "Impossible de créer le client."
    );

  }

}



async function removeClient(
 id:string
){

 await deleteClient(id);

 loadClients();

}




return (

<ProtectedRoute>


<main
style={{
padding:"40px"
}}
>


<h1>
Clients
</h1>



<div
style={{
marginBottom:"30px"
}}
>


<h2>
Ajouter un client
</h2>



<input

placeholder="Nom"

value={name}

onChange={
e=>setName(e.target.value)
}

/>



<input

placeholder="Email"

value={email}

onChange={
e=>setEmail(e.target.value)
}

/>



<button
onClick={addClient}
>

Ajouter

</button>


</div>





<h2>
Liste des clients
</h2>



{

clients.length===0 &&

<p>
Aucun client
</p>

}




{

clients.map(client=>(


<div

key={client.id}

style={{

border:"1px solid #ddd",

padding:"15px",

marginBottom:"10px",

borderRadius:"8px"

}}

>


<p>

<strong>
{client.name}
</strong>

</p>



<p>
{client.email}
</p>



<button

onClick={()=>removeClient(client.id)}

>

Supprimer

</button>



</div>


))


}



</main>


</ProtectedRoute>


);


}