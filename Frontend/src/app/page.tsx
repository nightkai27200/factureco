
"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        fontFamily: "Arial",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          background: "#fff",
          boxShadow: "0 2px 8px #ddd",
        }}
      >
        <h2
          style={{
            color: "#1e3a8a",
          }}
        >
          Facturco
        </h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
          }}
        >
          <Link href="/">Accueil</Link>
          <Link href="/login">Connexion</Link>
          <Link href="/register">Créer un compte</Link>
          <Link href="/pricing">Tarifs</Link>
        </div>
      </nav>

      {/* HERO */}

      <section
        style={{
          padding: "80px 40px",
          textAlign: "center",
          background: "#1e3a8a",
          color: "white",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            marginBottom: "20px",
          }}
        >
          Créez vos factures
          <br />
          professionnelles en quelques secondes
        </h1>

        <p
          style={{
            fontSize: "20px",
            maxWidth: "700px",
            margin: "auto",
          }}
        >
          Gérez vos devis, vos factures, vos clients et générez vos PDF
          automatiquement.
        </p>

        <div
          style={{
            marginTop: "40px",
          }}
        >
          <Link
            href="/register"
            style={{
              background: "white",
              color: "#1e3a8a",
              padding: "15px 30px",
              borderRadius: "8px",
              fontWeight: "bold",
              marginRight: "15px",
            }}
          >
            Créer un compte
          </Link>

          <Link
            href="/login"
            style={{
              border: "2px solid white",
              color: "white",
              padding: "13px 30px",
              borderRadius: "8px",
            }}
          >
            Connexion
          </Link>
        </div>
      </section>

      {/* FEATURES */}

      <section
        style={{
          padding: "60px 40px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
          }}
        >
          Tout ce qu'il vous faut
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "25px",
            marginTop: "40px",
          }}
        >
          <Feature
            title="Factures PDF"
            text="Créez des factures professionnelles avec votre logo."
          />

          <Feature
            title="Gestion clients"
            text="Centralisez vos clients et leurs informations."
          />

          <Feature
            title="Devis"
            text="Créez des devis et transformez-les en factures."
          />

          <Feature
            title="Tableau de bord"
            text="Suivez votre chiffre d'affaires facilement."
          />
        </div>
      </section>

      <section
        style={{
          padding: "60px 40px",
          background: "#eff6ff",
          textAlign: "center",
        }}
      >
        <h2>Pourquoi choisir Facturco ?</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "25px",
            marginTop: "40px",
          }}
        >
          <Feature
            title="⚡ Rapide"
            text="Créez une facture en moins d'une minute."
          />

          <Feature
            title="🔒 Sécurisé"
            text="Vos données sont protégées."
          />

          <Feature
            title="📱 Accessible partout"
            text="Utilisez votre application depuis n'importe où."
          />
        </div>
      </section>

      {/* TARIFS */}

      <section
        style={{
          background: "#fff",
          padding: "60px 40px",
          textAlign: "center",
        }}
      >
        <h2>Nos abonnements</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
            marginTop: "40px",
          }}
        >
          <PriceCard
            name="FREE"
            price="0 €"
            features={["3 clients", "3 devis", "1 PDF simple"]}
          />

          {/* OFFRE FONDATEUR */}

          <PriceCard
            name="FONDATEUR 🚀"
            price="4,99 €/mois"
            features={[
              "Clients illimités",
              "Factures PDF",
              "Logo entreprise",
              "Tarif fondateur à vie",
            ]}
            featured
          />

          <PriceCard
            name="STARTER"
            price="9,99 €/mois"
            features={[
              "Clients illimités",
              "Factures PDF",
              "Logo entreprise",
            ]}
          />

          <PriceCard
            name="PRO"
            price="19,99 €/mois"
            features={[
              "Tout Starter",
              "Support prioritaire",
              "Fonctions avancées",
            ]}
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px #ddd",
      }}
    >
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function PriceCard({
  name,
  price,
  features,
  featured = false,
}: {
  name: string;
  price: string;
  features: string[];
  featured?: boolean;
}) {
  return (
    <div
      style={{
        width: "280px",
        padding: "30px",
        borderRadius: "15px",
        boxShadow: featured
          ? "0 4px 20px rgba(30,58,138,0.25)"
          : "0 2px 10px #ddd",
        background: "#fff",
        border: featured ? "3px solid #1e3a8a" : "1px solid #eee",
        position: "relative",
      }}
    >
      {featured && (
        <div
          style={{
            position: "absolute",
            top: "-15px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e3a8a",
            color: "white",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          OFFRE FONDATEUR
        </div>
      )}

      <h2>{name}</h2>

      <h3>{price}</h3>

      {featured && (
        <p
          style={{
            color: "#1e3a8a",
            fontWeight: "bold",
          }}
        >
          Prix spécial réservé aux premiers utilisateurs
        </p>
      )}

      <ul>
        {features.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>

      <Link
        href={`/register?plan=${name}`}
        style={{
          display: "block",
          marginTop: "20px",
          background: "#1e3a8a",
          color: "white",
          padding: "12px",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: featured ? "bold" : "normal",
        }}
      >
        {featured ? "Devenir Fondateur" : `Choisir ${name}`}
      </Link>
    </div>
  );
}

