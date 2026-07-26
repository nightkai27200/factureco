"use client";


import {
 useEffect,
 useState
} from "react";


import ProtectedRoute
from "@/components/ProtectedRoute";


import api
from "@/services/api";

import Link from "next/link";



type Invoice = {

 id:string;

 number:string;

 status:string;

 amount:number;

 client?:{

  name:string;

 };

};





export default function FacturesPage(){



const [invoices,setInvoices]
=
useState<Invoice[]>([]);



const [loading,setLoading]
=
useState(true);

const [search, setSearch] = useState("");





async function loadInvoices(){


try{


const response =
await api.get<Invoice[]>(
"/invoices"
);



setInvoices(
response.data
);



}

catch(error){

console.error(
"Erreur chargement factures",
error
);

}


finally{

setLoading(false);

}


}







useEffect(()=>{


loadInvoices();


},[]);

async function updateStatus(
 id:string,
 status:string
){

try{

await api.patch(
 `/invoices/${id}/status`,
 {
  status
 }
);


loadInvoices();


}

catch(error){

console.error(error);

alert(
"Erreur changement statut"
);

}

}







async function downloadPdf(
id:string
){


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

console.error(
error
);

alert(
"Erreur PDF"
);

}


}







async function markPaid(
id:string
){


try{


await api.patch(

`/invoices/${id}/status`,

{

status:"PAID"

}

);



loadInvoices();


}

catch(error){

console.error(error);

}


}






async function deleteInvoice(
id:string
){


try{


await api.delete(
`/invoices/${id}`
);



loadInvoices();


}

catch(error){

console.error(error);

}


}

const filteredInvoices = invoices.filter((invoice) => {
  const searchLower = search.toLowerCase();

  return (
    invoice.number.toLowerCase().includes(searchLower) ||
    invoice.client?.name?.toLowerCase().includes(searchLower)
  );
});






return (
  <ProtectedRoute>
    <main
      style={{
        padding: "40px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>📄 Factures</h1>

        <Link href="/factures/new">
  <button
    style={{
      padding: "10px 18px",
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    ➕ Nouvelle facture
  </button>
</Link>




      </div>

      <input
        type="text"
        placeholder="🔍 Rechercher une facture..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          fontSize: "16px",
        }}
      />

      {loading && <p>Chargement...</p>}

      {!loading && filteredInvoices.length === 0 && (
        <p>Aucune facture trouvée.</p>
      )}

      {!loading && filteredInvoices.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>N°</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Client</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Statut</th>
              <th style={{ padding: "12px", textAlign: "right" }}>Montant</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                style={{
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <td style={{ padding: "12px" }}>{invoice.number}</td>

                <td style={{ padding: "12px" }}>
                  {invoice.client?.name ?? "Client"}
                </td>

                <td style={{ padding: "12px" }}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      color: "#fff",
                      background:
                        invoice.status === "PAID"
                          ? "#16a34a"
                          : invoice.status === "DRAFT"
                          ? "#f59e0b"
                          : "#dc2626",
                    }}
                  >
                    {invoice.status}
                  </span>
                </td>

                <td
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {invoice.amount.toFixed(2)} €
                </td>

                <td
style={{
padding:"12px",
display:"flex",
gap:"8px",
justifyContent:"center"
}}
>


<button
onClick={()=>
downloadPdf(invoice.id)
}
>
📄 PDF
</button>



{
invoice.status === "DRAFT" && (

<button
onClick={()=>
updateStatus(
 invoice.id,
 "SENT"
)
}
>
📨 Envoyer
</button>

)

}




{
invoice.status === "SENT" && (

<button
onClick={()=>
updateStatus(
 invoice.id,
 "PAID"
)
}
>
💰 Payée
</button>

)

}




<button

onClick={()=>{
if(
confirm(
"Supprimer cette facture ?"
)
){

deleteInvoice(invoice.id);

}

}}

>
🗑
</button>


</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  </ProtectedRoute>
);
}