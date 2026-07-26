"use client";


import {
  useState
} from "react";


import {
  useRouter
} from "next/navigation";


import {
  login
} from "@/services/auth.service";



export default function LoginPage(){


const router =
useRouter();


const [email,setEmail]
=
useState("");



const [password,setPassword]
=
useState("");



const [error,setError]
=
useState("");




async function handleLogin(){


try{


await login(
email,
password
);



router.push(
"/dashboard"
);



}
catch(e){

console.log(e);


setError(
"Email ou mot de passe incorrect"
);


}



}




return (

<div
style={{
maxWidth:"400px",
margin:"80px auto"
}}
>


<h1>
Connexion
</h1>



<input

placeholder="Email"

value={email}

onChange={
e=>setEmail(e.target.value)
}

style={{
width:"100%",
padding:"10px",
marginBottom:"10px"
}}

/>



<input

type="password"

placeholder="Mot de passe"

value={password}

onChange={
e=>setPassword(e.target.value)
}

style={{
width:"100%",
padding:"10px"
}}

/>




<button

onClick={handleLogin}

style={{
marginTop:"20px",
padding:"10px",
width:"100%"
}}

>

Se connecter

</button>




{
error &&
<p style={{
color:"red"
}}>
{error}
</p>
}



</div>

);


}