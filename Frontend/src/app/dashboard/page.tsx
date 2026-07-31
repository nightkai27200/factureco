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
// Récupération propre du nom du plan
// ==========================================

function getPlanName(
data: SubscriptionResponse
): string {


console.log(
  "DONNEES ABONNEMENT :",
  data
);


/*
 * Cas 1 :
 *
 * {
 *   plan: "FREE"
 * }
 */

if (
  typeof data.plan === "string"
) {

  return data.plan.toUpperCase();

}


/*
 * Cas 2 :
 *
 * {
 *   plan: {
 *     name: "FREE"
 *   }
 * }
 */

if (
  data.plan &&
  typeof data.plan === "object" &&
  typeof data.plan.name === "string"
) {

  return data.plan.name.toUpperCase();

}


/*
 * Cas 3 :
 *
 * {
 *   subscription: "FREE"
 * }
 */

if (
  typeof data.subscription === "string"
) {

  return data.subscription.toUpperCase();

}


/*
 * Cas 4 :
 *
 * {
 *   subscription: {
 *     name: "FREE"
 *   }
 * }
 */

if (
  data.subscription &&
  typeof data.subscription === "object" &&
  typeof data.subscription.name === "string"
) {

  return data.subscription.name.toUpperCase();

}


/*
 * Si aucune information exploitable
 * n'est reçue, on considère FREE.
 */

return "FREE";


}

// ==========================================
// Ouverture Stripe
// ==========================================

const handleManageSubscription =
async () => {


  try {

    setPortalLoading(true);


    console.log(
      "================================="
    );

    console.log(
      "PLAN ACTUEL =",
      subscription
    );

    console.log(
      "================================="
    );


    // ======================================
    // FREE
    //
    // FREE n'a PAS encore de client Stripe.
    //
    // On doit donc obligatoirement utiliser
    // Checkout pour créer l'abonnement.
    // ======================================

    if (
      subscription === "FREE"
    ) {

      console.log(
        "FREE -> STRIPE CHECKOUT STARTER"
      );


      const checkout =
        await createCheckout(
          "STARTER"
        );


      console.log(
        "CHECKOUT STRIPE =",
        checkout
      );


      if (
        !checkout ||
        !checkout.url
      ) {

        throw new Error(
          "Stripe n'a pas retourné d'URL Checkout."
        );

      }


      console.log(
        "REDIRECTION VERS STRIPE..."
      );


      window.location.href =
        checkout.url;


      return;
    }


    // ======================================
    // STARTER / PRO
    //
    // Ces utilisateurs ont normalement
    // déjà un stripeCustomerId.
    // ======================================

    if (
      subscription === "STARTER" ||
      subscription === "PRO" ||
      subscription === "PREMIUM"
    ) {

      console.log(
        "ABONNEMENT PAYANT -> CUSTOMER PORTAL"
      );


      const portal =
        await createPortalSession();


      console.log(
        "PORTAIL STRIPE =",
        portal
      );


      if (
        !portal ||
        !portal.url
      ) {

        throw new Error(
          "Stripe n'a pas retourné d'URL portail."
        );

      }


      window.location.href =
        portal.url;


      return;
    }


    // ======================================
    // Sécurité
    //
    // Si une valeur inconnue arrive du
    // backend, on retourne vers Checkout.
    // ======================================

    console.warn(
      "Plan inconnu :",
      subscription
    );


    const checkout =
      await createCheckout(
        "STARTER"
      );


    if (
      !checkout ||
      !checkout.url
    ) {

      throw new Error(
        "URL Checkout Stripe manquante."
      );

    }


    window.location.href =
      checkout.url;

  }


  catch (error: any) {

    console.error(
      "================================="
    );

    console.error(
      "ERREUR STRIPE"
    );

    console.error(
      error?.response?.data ||
      error
    );

    console.error(
      "================================="
    );


    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Impossible d'ouvrir Stripe.";


    alert(
      message
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
      "================================="
    );

    console.log(
      "REPONSE /subscription/me =",
      response.data
    );

    console.log(
      "================================="
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


    /*
     * En cas d'erreur de récupération
     * de l'abonnement, on considère
     * l'utilisateur comme FREE.
     *
     * Cela évite d'envoyer un utilisateur
     * sans client Stripe vers le portail.
     */

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

// ==========================================
// Affichage
// ==========================================

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
// Carte statistique
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
