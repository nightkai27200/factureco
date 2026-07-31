
"use client";

import {
  useEffect,
  useState,
} from "react";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getStats,
} from "../../services/dashboard.service";

import api from "@/lib/api";

import {
  createCheckout,
  createPortalSession,
} from "@/services/stripe.service";

type Stats = {
  revenueHT: number;
  revenueTTC: number;
  pendingInvoices: number;
  acceptedQuotes: number;
  clients: number;
};

type SubscriptionResponse = {
  plan?: string | {
    name?: string;
  } | null;

  subscription?: string | {
    name?: string;
  } | null;

  subscriptionStatus?: string | null;
};

export default function Dashboard() {

  const [stats, setStats] =
    useState<Stats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [portalLoading, setPortalLoading] =
    useState(false);

  const [subscription, setSubscription] =
    useState("FREE");


  // ==========================================
  // Récupérer proprement le nom du plan
  // ==========================================

  function getPlanName(
    data: SubscriptionResponse
  ): string {

    const value =
      data.plan ??
      data.subscription ??
      "FREE";


    // Si le backend renvoie directement :
    // "FREE", "STARTER", "PRO"

    if (typeof value === "string") {

      return value.toUpperCase();

    }


    // Si le backend renvoie :
    // { name: "FREE" }

    if (
      typeof value === "object" &&
      value !== null &&
      typeof value.name === "string"
    ) {

      return value.name.toUpperCase();

    }


    return "FREE";
  }



  // ==========================================
  // Gestion abonnement Stripe
  // ==========================================

  const handleManageSubscription =
    async () => {

      try {

        setPortalLoading(true);


        console.log(
          "PLAN ACTUEL =",
          subscription
        );


        // ======================================
        // FREE
        // → Stripe Checkout
        // → STARTER
        // ======================================

        if (subscription === "FREE") {

          console.log(
            "FREE → CHECKOUT STARTER"
          );


          const data =
            await createCheckout(
              "STARTER"
            );


          console.log(
            "REPONSE CHECKOUT =",
            data
          );


          if (!data?.url) {

            throw new Error(
              "URL Checkout Stripe manquante"
            );

          }


          window.location.href =
            data.url;


          return;
        }


        // ======================================
        // STARTER / PRO
        // → Customer Portal
        // ======================================

        console.log(
          "ABONNEMENT PAYANT → PORTAIL STRIPE"
        );


        const data =
          await createPortalSession();


        console.log(
          "REPONSE PORTAIL =",
          data
        );


        if (!data?.url) {

          throw new Error(
            "URL du portail Stripe manquante"
          );

        }


        window.location.href =
          data.url;

      }

      catch (error: any) {

        console.error(
          "Erreur Stripe :",
          error?.response?.data ||
          error
        );


        alert(
          error?.response?.data?.message ||
          error?.message ||
          "Impossible d'ouvrir Stripe."
        );

      }

      finally {

        setPortalLoading(false);

      }

    };



  // ==========================================
  // Chargement Dashboard
  // ==========================================

  useEffect(() => {

    async function loadDashboard() {

      try {


        // ======================================
        // Statistiques
        // ======================================

        const statsData =
          await getStats();


        setStats(
          statsData
        );


        // ======================================
        // Abonnement
        // ======================================

        const response =
          await api.get<SubscriptionResponse>(
            "/subscription/me"
          );


        console.log(
          "REPONSE /subscription/me =",
          response.data
        );


        const currentPlan =
          getPlanName(
            response.data
          );


        console.log(
          "PLAN FINAL =",
          currentPlan
        );


        setSubscription(
          currentPlan
        );

      }

      catch (error) {

        console.error(
          "Erreur chargement dashboard :",
          error
        );


        // Par sécurité :
        // si impossible de récupérer
        // l'abonnement, on considère FREE

        setSubscription(
          "FREE"
        );

      }

      finally {

        setLoading(
          false
        );

      }

    }


    loadDashboard();

  }, []);



  return (

    <ProtectedRoute>

      <main
        style={{
          padding: "40px",
          background: "#f5f7fb",
          minHeight: "100vh",
        }}
      >

        <h1>
          Tableau de bord
        </h1>


        {loading && (

          <p>
            Chargement...
          </p>

        )}


        {!loading && stats && (

          <div>


            {/* ==================================
                STATISTIQUES
            ================================== */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(220px,1fr))",
                gap: "20px",
                marginTop: "30px",
              }}
            >

              <Card
                title="Chiffre d'affaires HT"
                value={
                  `${stats.revenueHT.toFixed(2)} €`
                }
              />


              <Card
                title="Chiffre d'affaires TTC"
                value={
                  `${stats.revenueTTC.toFixed(2)} €`
                }
              />


              <Card
                title="Factures en attente"
                value={
                  String(
                    stats.pendingInvoices
                  )
                }
              />


              <Card
                title="Clients"
                value={
                  String(
                    stats.clients
                  )
                }
              />

            </div>



            {/* ==================================
                DEVIS ACCEPTÉS
            ================================== */}

            <div
              style={{
                marginTop: "30px",
                background: "#fff",
                padding: "25px",
                borderRadius: "10px",
              }}
            >

              <h2>
                Devis acceptés
              </h2>


              <p
                style={{
                  fontSize: "32px",
                  fontWeight: "bold",
                }}
              >
                {stats.acceptedQuotes}
              </p>

            </div>



            {/* ==================================
                ABONNEMENT
            ================================== */}

            <div
              style={{
                marginTop: "30px",
                background: "#fff",
                padding: "25px",
                borderRadius: "10px",
              }}
            >

              <h2>
                Abonnement
              </h2>


              <p
                style={{
                  color: "#666",
                  marginTop: "8px",
                }}
              >

                Abonnement actuel :{" "}

                <strong>
                  {subscription}
                </strong>

              </p>


              <p
                style={{
                  color: "#666",
                  marginTop: "8px",
                }}
              >

                {subscription === "FREE"

                  ? "Passez à STARTER pour débloquer les fonctionnalités supplémentaires."

                  : "Gérez votre abonnement, votre moyen de paiement et votre facturation."

                }

              </p>


              <button
                type="button"
                onClick={
                  handleManageSubscription
                }
                disabled={
                  portalLoading
                }
                style={{
                  marginTop: "20px",
                  padding: "12px 20px",
                  background:
                    portalLoading
                      ? "#94a3b8"
                      : "#1e3a8a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor:
                    portalLoading
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "16px",
                }}
              >

                {portalLoading

                  ? "Ouverture..."

                  : subscription === "FREE"

                    ? "Passer à STARTER"

                    : "Gérer mon abonnement"

                }

              </button>

            </div>

          </div>

        )}

      </main>

    </ProtectedRoute>

  );

}



// ==========================================
// CARTE STATISTIQUE
// ==========================================

function Card({

  title,
  value,

}: {

  title: string;
  value: string;

}) {

  return (

    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >

      <h3>
        {title}
      </h3>


      <p
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          color: "#1e3a8a",
        }}
      >
        {value}
      </p>

    </div>

  );

}

