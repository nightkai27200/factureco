"use client";

import { useState } from "react";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Vous devez être connecté.");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stripe/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan: "STARTER",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur Stripe");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Impossible de lancer le paiement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "60px auto",
        padding: "20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: 38,
          marginBottom: 10,
        }}
      >
        Mon abonnement
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#666",
          marginBottom: 50,
        }}
      >
        Choisissez l'offre adaptée à vos besoins.
      </p>

      <div
        style={{
          display: "flex",
          gap: 30,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {/* FREE */}

        <div
          style={{
            width: 330,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 16,
            padding: 30,
          }}
        >
          <h2>🆓 FREE</h2>

          <h1>0 €</h1>

          <p>Idéal pour découvrir Factureco.</p>

          <ul
            style={{
              marginTop: 25,
              lineHeight: "32px",
            }}
          >
            <li>✅ 5 clients</li>
            <li>✅ 5 devis</li>
            <li>✅ PDF simple</li>
            <li>❌ Logo personnalisé</li>
            <li>❌ Support prioritaire</li>
          </ul>

          <button
            disabled
            style={{
              width: "100%",
              marginTop: 30,
              padding: 14,
              background: "#ddd",
              border: "none",
              borderRadius: 8,
              color: "#555",
            }}
          >
            Offre actuelle
          </button>
        </div>

        {/* STARTER */}

        <div
          style={{
            width: 330,
            background: "#1e3a8a",
            color: "white",
            borderRadius: 16,
            padding: 30,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 15,
              right: 15,
              background: "#facc15",
              color: "#000",
              padding: "5px 10px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            POPULAIRE
          </span>

          <h2>⭐ STARTER</h2>

          <h1>9,99 €/mois</h1>

          <p>Pour les indépendants et petites entreprises.</p>

          <ul
            style={{
              marginTop: 25,
              lineHeight: "32px",
            }}
          >
            <li>✅ Clients illimités</li>
            <li>✅ Devis illimités</li>
            <li>✅ Factures illimitées</li>
            <li>✅ Export PDF</li>
            <li>✅ Logo entreprise</li>
            <li>✅ Support</li>
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 30,
              padding: 14,
              background: "white",
              color: "#1e3a8a",
              border: "none",
              borderRadius: 8,
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading
              ? "Redirection vers Stripe..."
              : "⭐ Passer à Starter"}
          </button>
        </div>
      </div>
    </main>
  );
}