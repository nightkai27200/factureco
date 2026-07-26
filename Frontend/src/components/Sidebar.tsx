"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";


export default function Sidebar(){

  const router = useRouter();


  function logout(){

    localStorage.removeItem("token");

    router.push("/login");

  }


  return (

    <aside
      style={{
        width:"240px",
        height:"100vh",
        background:"#111827",
        color:"white",
        padding:"20px",
        position:"fixed",
        left:0,
        top:0
      }}
    >


      


      <nav
        style={{
          display:"flex",
          flexDirection:"column",
          gap:"15px",
          marginTop:"30px"
        }}
      >


        <Link
          href="/dashboard"
          style={{color:"white"}}
        >
          Dashboard
        </Link>



        <Link
          href="/clients"
          style={{color:"white"}}
        >
          Clients
        </Link>



        <Link
  href="/devis"
  style={{
    color:"white"
  }}
>
  Devis
</Link>



        <Link
          href="/invoices"
          style={{color:"white"}}
        >
          Factures
        </Link>



        <Link
          href="/company"
          style={{color:"white"}}
        >
          Société
        </Link>


      </nav>



      <button

        onClick={logout}

        style={{
          marginTop:"40px",
          padding:"10px",
          width:"100%",
          cursor:"pointer"
        }}

      >
        Déconnexion
      </button>


    </aside>

  );

}