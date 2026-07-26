"use client";

import Link from "next/link";
import {
  useState
} from "react";



import api from "@/services/api";

import {
  useRouter,
  useSearchParams
} from "next/navigation";



export default function Register(){


const router = useRouter();

const searchParams = useSearchParams();


const plan =
searchParams.get("plan") || "FREE";


const [form,setForm] =
useState({

  name:"",
  email:"",
  password:"",
  plan:plan

});

const [error,setError] =
useState("");



function handleChange(
e:React.ChangeEvent<HTMLInputElement>
){


setForm({

 ...form,

 [e.target.name]:
 e.target.value

});


}




async function handleSubmit(
e:React.FormEvent
){


e.preventDefault();


try{


await api.post(
"/users",
form
);



alert(
"Compte créé avec succès"
);



router.push(
"/login"
);



}
catch(error){


console.error(
error
);


setError(
"Erreur création compte"
);


}


}





return (

<main

style={{

padding:"50px",

display:"flex",

justifyContent:"center"

}}

>


<form

onSubmit={handleSubmit}

style={{

width:"400px",

background:"#fff",

padding:"30px",

borderRadius:"12px"

}}

>


<h1>
Créer un compte
</h1>



<p>
Inscrivez-vous gratuitement pour commencer.
</p>

<p>
Abonnement choisi :
<strong> {plan}</strong>
</p>




<input

name="name"

placeholder="Nom"

value={form.name}

onChange={handleChange}

/>



<br/><br/>





<input

name="email"

placeholder="Email"

type="email"

value={form.email}

onChange={handleChange}

/>



<br/><br/>





<input

name="password"

placeholder="Mot de passe"

type="password"

value={form.password}

onChange={handleChange}

/>



<br/><br/>





{
error &&

<p style={{
color:"red"
}}>

{error}

</p>

}




<button>

Créer mon compte

</button>





<p>


Déjà inscrit ?


<Link href="/login">

 Se connecter

</Link>


</p>



</form>


</main>

);


}