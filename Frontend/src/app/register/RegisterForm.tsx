"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function RegisterForm() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const plan =
    searchParams.get("plan") || "FREE";


  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    plan: plan,
  });


  const [error, setError] = useState("");



  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  }



  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault();


    try {

      await api.post(
        "/users",
        form
      );


      alert(
        "Compte créé avec succès"
      );


      router.push("/login");


    } catch (err) {

      console.error(err);

      setError(
        "Erreur lors de la création du compte"
      );

    }

  }



  return (

    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >

      <form

        onSubmit={handleSubmit}

        style={{
          width: "400px",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #ddd",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}

      >

        <h1>
          Créer un compte
        </h1>


        <p>
          Inscrivez-vous gratuitement pour commencer.
        </p>


        <p>
          Offre choisie :
          <strong> {plan}</strong>
        </p>



        <input

          name="name"

          placeholder="Nom"

          value={form.name}

          onChange={handleChange}

          required

        />



        <input

          name="email"

          type="email"

          placeholder="Email"

          value={form.email}

          onChange={handleChange}

          required

        />



        <input

          name="password"

          type="password"

          placeholder="Mot de passe"

          value={form.password}

          onChange={handleChange}

          required

        />



        {
          error && (

            <p style={{ color: "red" }}>
              {error}
            </p>

          )
        }



        <button type="submit">

          Créer mon compte

        </button>



        <p>

          Déjà inscrit ?

          {" "}

          <Link href="/login">

            Se connecter

          </Link>

        </p>


      </form>


    </main>

  );

}