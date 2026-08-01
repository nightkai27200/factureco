
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function RegisterForm() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const selectedPlan =
    (searchParams.get("plan") || "FREE").toUpperCase();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    plan: selectedPlan,
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

    setError("");

    try {
      // ==========================================
      // Création du compte
      // ==========================================

      await api.post("/users", {
        ...form,
        plan: selectedPlan,
      });

      // ==========================================
      // Connexion automatique
      // ==========================================

      const loginResponse =
        await api.post<{
          access_token: string;
        }>("/auth/login", {
          email: form.email,
          password: form.password,
        });

      const token =
        loginResponse.data.access_token;

      if (!token) {
        throw new Error(
          "Token JWT introuvable après connexion"
        );
      }

      // ==========================================
      // Sauvegarde JWT
      // ==========================================

      localStorage.setItem(
        "token",
        token
      );

      // ==========================================
      // Plans payants => Stripe
      // ==========================================

      if (
        selectedPlan === "STARTER" ||
        selectedPlan === "FONDATEUR" ||
        selectedPlan === "PRO"
      ) {
        const stripeResponse =
          await api.post<{
            url: string;
          }>(
            "/stripe/create-checkout",
            {
              plan: selectedPlan,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const checkoutUrl =
          stripeResponse.data.url;

        if (!checkoutUrl) {
          throw new Error(
            "URL Stripe manquante"
          );
        }

        // Redirection vers Stripe
        window.location.href =
          checkoutUrl;

        return;
      }

      // ==========================================
      // Offre FREE
      // ==========================================

      alert(
        "Compte créé avec succès"
      );

      router.push("/login");

    } catch (err: any) {
      console.error(
        "Erreur inscription :",
        err
      );

      setError(
        err.response?.data?.message ||
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
          <strong>
            {" "}
            {selectedPlan}
          </strong>
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

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#1e3a8a",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {selectedPlan === "FONDATEUR"
            ? "Devenir Fondateur — 4,99 €/mois"
            : selectedPlan === "STARTER"
            ? "Continuer vers le paiement"
            : selectedPlan === "PRO"
            ? "Continuer vers le paiement"
            : "Créer mon compte"}
        </button>

        <p>
          Déjà inscrit ?{" "}
          <Link href="/login">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}

