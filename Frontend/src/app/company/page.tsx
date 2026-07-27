"use client";

import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/services/api";
import { API_URL } from "@/lib/config";



type Company = {

 id?:string;

 name:string;

 address:string;

 city:string;

 phone:string;

 email:string;

 website?:string;

 logo?:string;

};





export default function CompanyPage(){



const [company,setCompany] =
useState<Company>({

name:"",
address:"",
city:"",
phone:"",
email:"",
website:"",
logo:"",

});



const [loading,setLoading] =
useState(true);



const [file,setFile] =
useState<File|null>(null);







async function loadCompany(){


try{


const response =
await api.get(
"/company"
);


const data = response.data as Company;


setCompany(data);




}
catch(error){

console.error(
"Erreur chargement entreprise",
error
);


}
finally{

setLoading(false);

}


}







useEffect(()=>{

loadCompany();

},[]);










function updateField(
field:keyof Company,
value:string
){

setCompany({

...company,

[field]:value

});

}









async function saveCompany(){



try{


await api.post(
"/company",
company
);



alert(
"Entreprise enregistrée"
);



}
catch(error){

console.error(error);

alert(
"Erreur sauvegarde"
);

}



}











async function uploadLogo(){


if(!file){

alert(
"Choisir un logo"
);

return;

}



const formData =
new FormData();


formData.append(
"logo",
file
);



try{


const response =
await api.post<Company>(

"/company/logo",

formData,

{

headers:{
"Content-Type":
"multipart/form-data",
}

}

);



setCompany(response.data);


console.log(
 "COMPANY APRES LOGO =>",
 response.data
);


alert(
"Logo envoyé"
);



}
catch(error){

console.error(error);

alert(
"Erreur upload logo"
);


}



}







if(loading){

return (
<p>
Chargement...
</p>
)

}







return (


<ProtectedRoute>


<main

style={{

padding:"40px",

maxWidth:"700px",

margin:"auto"

}}

>



<h1>
🏢 Mon entreprise
</h1>






<div>


<label>
Nom entreprise
</label>


<input

value={company.name}

onChange={(e)=>
updateField(
"name",
e.target.value
)
}

style={input}

/>



</div>






<div>


<label>
Adresse
</label>


<input

value={company.address}

onChange={(e)=>
updateField(
"address",
e.target.value
)
}

style={input}

/>



</div>






<div>


<label>
Ville
</label>


<input

value={company.city}

onChange={(e)=>
updateField(
"city",
e.target.value
)
}

style={input}

/>



</div>






<div>


<label>
Téléphone
</label>


<input

value={company.phone}

onChange={(e)=>
updateField(
"phone",
e.target.value
)
}

style={input}

/>



</div>






<div>


<label>
Email
</label>


<input

value={company.email}

onChange={(e)=>
updateField(
"email",
e.target.value
)
}

style={input}

/>



</div>







<div>


<label>
Site web
</label>


<input

value={company.website || ""}

onChange={(e)=>
updateField(
"website",
e.target.value
)
}

style={input}

/>



</div>









<button

onClick={saveCompany}

style={button}

>

💾 Enregistrer

</button>









<hr

style={{
margin:"30px 0"
}}

/>













{
company.logo && (

<div>

<p>
Logo entreprise
</p>


<img

src={`${API_URL}/${company.logo}`}

alt="Logo entreprise"

style={{
 width:"150px",
 marginBottom:"20px"
}}

/>


</div>

)
}






<input

type="file"

accept="image/*"

onChange={(e)=>

setFile(
e.target.files?.[0] || null
)

}

/>






<button

onClick={uploadLogo}

style={button}

>

📤 Envoyer logo

</button>









</main>


</ProtectedRoute>


);




}



const input = {

display:"block",

width:"100%",

padding:"10px",

margin:"8px 0 20px",

border:"1px solid #ccc",

borderRadius:"6px"

};





const button = {

padding:"12px 25px",

background:"#2563eb",

color:"white",

border:"none",

borderRadius:"8px",

cursor:"pointer"

};