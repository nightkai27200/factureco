"use client";

import { useEffect, useState } from "react";

import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { API_URL } from "@/lib/config";



type Company = {

  id?: string;

  name: string;

  address: string;

  city: string;

  phone: string;

  email: string;

  website?: string;

  logo?: string;

  // ==========================
  // INFORMATIONS LÉGALES
  // ==========================

  siret?: string;

  vatNumber?: string;

};





export default function CompanyPage() {



  const [company, setCompany] =
    useState<Company>({

      name: "",
      address: "",
      city: "",
      phone: "",
      email: "",
      website: "",
      logo: "",

      siret: "",

      vatNumber: "",

    });



  const [loading, setLoading] =
    useState(true);



  const [saving, setSaving] =
    useState(false);



  const [file, setFile] =
    useState<File | null>(null);





  // ============================================================
  // CHARGEMENT ENTREPRISE
  // ============================================================

  async function loadCompany() {

    try {

      const response =
        await api.get(
          "/company"
        );


      const data =
        response.data as Company;


      setCompany({

        name:
          data.name || "",

        address:
          data.address || "",

        city:
          data.city || "",

        phone:
          data.phone || "",

        email:
          data.email || "",

        website:
          data.website || "",

        logo:
          data.logo || "",

        siret:
          data.siret || "",

        vatNumber:
          data.vatNumber || "",

        id:
          data.id,

      });


    }
    catch (error) {

      console.error(
        "Erreur chargement entreprise",
        error
      );

    }
    finally {

      setLoading(false);

    }

  }





  useEffect(() => {

    loadCompany();

  }, []);





  // ============================================================
  // MODIFICATION CHAMP
  // ============================================================

  function updateField(
    field: keyof Company,
    value: string
  ) {

    setCompany({

      ...company,

      [field]: value,

    });

  }





  // ============================================================
  // MODIFICATION SIRET
  // ============================================================

  function updateSiret(
    value: string
  ) {

    // On garde uniquement les chiffres
    const cleanSiret =
      value
        .replace(/\D/g, "")
        .slice(0, 14);


    updateField(
      "siret",
      cleanSiret
    );

  }





  // ============================================================
  // MODIFICATION TVA
  // ============================================================

  function updateVatNumber(
    value: string
  ) {

    const cleanVat =
      value
        .toUpperCase()
        .replace(/\s/g, "")
        .slice(0, 20);


    updateField(
      "vatNumber",
      cleanVat
    );

  }





  // ============================================================
  // SAUVEGARDE
  // ============================================================

  async function saveCompany() {


    // --------------------------
    // Vérification SIRET
    // --------------------------

    if (
      company.siret &&
      !/^\d{14}$/.test(
        company.siret
      )
    ) {

      alert(
        "Le SIRET doit contenir exactement 14 chiffres."
      );

      return;

    }



    // --------------------------
    // Vérification TVA
    // --------------------------

    if (
      company.vatNumber &&
      !/^FR[A-Z0-9]{2}\d{9}$/.test(
        company.vatNumber
      )
    ) {

      alert(
        "Le numéro de TVA intracommunautaire français doit être au format FR + 11 caractères."
      );

      return;

    }



    try {

      setSaving(true);


      await api.post(
        "/company",
        company
      );


      alert(
        "Entreprise enregistrée avec succès."
      );


    }
    catch (error) {

      console.error(
        "Erreur sauvegarde entreprise",
        error
      );


      alert(
        "Erreur lors de la sauvegarde de l'entreprise."
      );

    }
    finally {

      setSaving(false);

    }

  }





  // ============================================================
  // UPLOAD LOGO
  // ============================================================

  async function uploadLogo() {


    if (!file) {

      alert(
        "Choisir un logo."
      );

      return;

    }



    const formData =
      new FormData();


    formData.append(
      "logo",
      file
    );



    try {


      const response =
        await api.post<Company>(

          "/company/logo",

          formData,

          {

            headers: {

              "Content-Type":
                "multipart/form-data",

            },

          }

        );



      setCompany(
        response.data
      );


      console.log(
        "COMPANY APRES LOGO =>",
        response.data
      );


      setFile(null);


      alert(
        "Logo envoyé avec succès."
      );


    }
    catch (error) {

      console.error(
        "Erreur upload logo",
        error
      );


      alert(
        "Erreur lors de l'upload du logo."
      );

    }

  }





  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <ProtectedRoute>

        <main
          style={page}
        >

          <p>
            Chargement...
          </p>

        </main>

      </ProtectedRoute>

    );

  }





  // ============================================================
  // PAGE
  // ============================================================

  return (

    <ProtectedRoute>

      <main
        style={page}
      >


        <div
          style={header}
        >

          <div>

            <h1
              style={title}
            >
              🏢 Mon entreprise
            </h1>

            <p
              style={subtitle}
            >
              Ces informations apparaîtront
              sur vos factures et devis.
            </p>

          </div>

        </div>



        {/* ======================================================
            INFORMATIONS ENTREPRISE
        ====================================================== */}

        <section
          style={card}
        >

          <h2
            style={sectionTitle}
          >
            Informations de l'entreprise
          </h2>



          {/* NOM */}

          <div>

            <label style={label}>
              Nom entreprise *
            </label>


            <input
              value={company.name}
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
              placeholder="Nom de votre entreprise"
              style={input}
            />

          </div>



          {/* SIRET */}

          <div>

            <label style={label}>
              SIRET *
            </label>


            <input
              value={
                company.siret || ""
              }
              onChange={(e) =>
                updateSiret(
                  e.target.value
                )
              }
              placeholder="12345678901234"
              maxLength={14}
              inputMode="numeric"
              style={{
                ...input,

                borderColor:
                  company.siret &&
                  company.siret.length !== 14
                    ? "#dc2626"
                    : "#ccc",
              }}
            />


            <div
              style={{
                marginTop: "-14px",
                marginBottom: "20px",
                fontSize: "13px",
                color:
                  company.siret &&
                  company.siret.length !== 14
                    ? "#dc2626"
                    : "#666",
              }}
            >

              {company.siret
                ? `${company.siret.length}/14 chiffres`
                : "14 chiffres"}

            </div>

          </div>



          {/* TVA */}

          <div>

            <label style={label}>
              TVA intracommunautaire
            </label>


            <input
              value={
                company.vatNumber || ""
              }
              onChange={(e) =>
                updateVatNumber(
                  e.target.value
                )
              }
              placeholder="FR12345678901"
              style={input}
            />


            <small
              style={help}
            >
              Exemple : FR12345678901
            </small>

          </div>



          {/* ADRESSE */}

          <div>

            <label style={label}>
              Adresse *
            </label>


            <input
              value={company.address}
              onChange={(e) =>
                updateField(
                  "address",
                  e.target.value
                )
              }
              placeholder="Adresse de l'entreprise"
              style={input}
            />

          </div>



          {/* VILLE */}

          <div>

            <label style={label}>
              Ville *
            </label>


            <input
              value={company.city}
              onChange={(e) =>
                updateField(
                  "city",
                  e.target.value
                )
              }
              placeholder="Ville"
              style={input}
            />

          </div>



          {/* TELEPHONE */}

          <div>

            <label style={label}>
              Téléphone
            </label>


            <input
              value={company.phone}
              onChange={(e) =>
                updateField(
                  "phone",
                  e.target.value
                )
              }
              placeholder="01 23 45 67 89"
              style={input}
            />

          </div>



          {/* EMAIL */}

          <div>

            <label style={label}>
              Email
            </label>


            <input
              type="email"
              value={company.email}
              onChange={(e) =>
                updateField(
                  "email",
                  e.target.value
                )
              }
              placeholder="contact@entreprise.fr"
              style={input}
            />

          </div>



          {/* SITE WEB */}

          <div>

            <label style={label}>
              Site web
            </label>


            <input
              value={
                company.website || ""
              }
              onChange={(e) =>
                updateField(
                  "website",
                  e.target.value
                )
              }
              placeholder="https://www.monentreprise.fr"
              style={input}
            />

          </div>



          {/* SAUVEGARDE */}

          <button

            onClick={saveCompany}

            disabled={saving}

            style={{
              ...button,

              opacity:
                saving ? 0.6 : 1,

              cursor:
                saving
                  ? "not-allowed"
                  : "pointer",
            }}

          >

            {saving
              ? "⏳ Enregistrement..."
              : "💾 Enregistrer"}

          </button>


        </section>





        {/* ======================================================
            LOGO
        ====================================================== */}

        <section
          style={card}
        >

          <h2
            style={sectionTitle}
          >
            Logo de l'entreprise
          </h2>



          {company.logo && (

            <div
              style={{
                marginBottom: "25px",
              }}
            >

              <p
                style={label}
              >
                Logo actuel
              </p>


              <div
                style={{
                  padding: "20px",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: "10px",
                  background: "#fafafa",
                  display: "inline-block",
                }}
              >

                <img

                  src={`${API_URL}/${company.logo}`}

                  alt="Logo entreprise"

                  style={{
                    width: "150px",
                    maxHeight: "100px",
                    objectFit: "contain",
                  }}

                />

              </div>

            </div>

          )}



          <label style={label}>
            Choisir un nouveau logo
          </label>


          <input

            type="file"

            accept="image/png,image/jpeg,image/webp"

            onChange={(e) =>

              setFile(
                e.target.files?.[0] || null
              )

            }

            style={{
              marginBottom: "20px",
            }}

          />



          <br />


          <button

            onClick={uploadLogo}

            style={button}

          >

            📤 Envoyer logo

          </button>


        </section>





        {/* ======================================================
            INFORMATION PDF
        ====================================================== */}

        <section
          style={infoCard}
        >

          <h3
            style={{
              marginTop: 0,
            }}
          >
            📄 Informations affichées sur vos documents
          </h3>


          <p
            style={{
              marginBottom: "8px",
            }}
          >
            Les informations suivantes pourront
            apparaître sur vos factures et devis :
          </p>


          <ul
            style={{
              marginTop: "8px",
              paddingLeft: "20px",
              lineHeight: "1.8",
            }}
          >

            <li>
              Nom de l'entreprise
            </li>

            <li>
              Adresse
            </li>

            <li>
              SIRET
            </li>

            <li>
              TVA intracommunautaire
            </li>

            <li>
              Téléphone
            </li>

            <li>
              Email
            </li>

            <li>
              Logo
            </li>

          </ul>

        </section>


      </main>

    </ProtectedRoute>

  );

}





// ============================================================
// STYLES
// ============================================================

const page = {

  padding: "40px",

  maxWidth: "700px",

  margin: "auto",

};



const header = {

  marginBottom: "30px",

};



const title = {

  marginBottom: "8px",

};



const subtitle = {

  color: "#6b7280",

  marginTop: 0,

};



const card = {

  background: "white",

  border: "1px solid #e5e7eb",

  borderRadius: "12px",

  padding: "25px",

  marginBottom: "25px",

  boxShadow:
    "0 2px 8px rgba(0,0,0,0.04)",

};



const sectionTitle = {

  marginTop: 0,

  marginBottom: "25px",

  fontSize: "20px",

};



const label = {

  display: "block",

  fontWeight: 600,

  marginBottom: "6px",

};



const help = {

  display: "block",

  marginTop: "-14px",

  marginBottom: "20px",

  color: "#6b7280",

  fontSize: "13px",

};



const input = {

  display: "block",

  width: "100%",

  padding: "11px",

  margin: "8px 0 20px",

  border: "1px solid #ccc",

  borderRadius: "6px",

  boxSizing: "border-box" as const,

};



const button = {

  padding: "12px 25px",

  background: "#2563eb",

  color: "white",

  border: "none",

  borderRadius: "8px",

  cursor: "pointer",

  fontWeight: 600,

};



const infoCard = {

  background: "#eff6ff",

  border: "1px solid #bfdbfe",

  borderRadius: "12px",

  padding: "20px",

  marginBottom: "30px",

};