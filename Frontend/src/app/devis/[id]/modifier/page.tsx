
"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getQuote,
  updateQuote,
  Quote,
} from "@/services/quote.service";


// =========================================================
// PAGE MODIFICATION DEVIS
// =========================================================

export default function ModifierDevisPage() {

  const router = useRouter();

  const params =
    useParams<{ id?: string }>();


  // =========================================================
  // ID DU DEVIS
  // =========================================================

  const quoteId =
    typeof params?.id === "string"
      ? params.id
      : undefined;


  // =========================================================
  // ETATS
  // =========================================================

  const [quote, setQuote] =
    useState<Quote | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =========================================================
  // FORMULAIRE
  // =========================================================

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [clientId, setClientId] =
    useState("");

  const [vatRate, setVatRate] =
    useState(20);


  // =========================================================
  // TAUX TVA DISPONIBLES
  // =========================================================

  const VAT_RATES = [
    0,
    5.5,
    10,
    20,
  ];


  // =========================================================
  // MESSAGE ERREUR
  // =========================================================

  function getErrorMessage(
    err: unknown,
    fallback: string,
  ): string {

    if (
      typeof err !== "object" ||
      err === null
    ) {
      return fallback;
    }

    const errorObject =
      err as {
        response?: {
          data?: {
            message?: unknown;
          };
        };
      };

    const message =
      errorObject.response?.data?.message;

    if (Array.isArray(message)) {

      const messages =
        message.filter(
          (item): item is string =>
            typeof item === "string",
        );

      return (
        messages.join(", ") ||
        fallback
      );
    }

    if (
      typeof message === "string" &&
      message.trim()
    ) {
      return message;
    }

    return fallback;
  }


  // =========================================================
  // CHARGER LE DEVIS
  // =========================================================

  useEffect(() => {

    if (!quoteId) {

      setLoading(false);

      setError(
        "Identifiant du devis introuvable.",
      );

      return;
    }

    const currentQuoteId: string =
      quoteId;

    let cancelled = false;


    async function loadQuote() {

      try {

        setLoading(true);
        setError("");
        setSuccess("");


        const data =
          await getQuote(
            currentQuoteId,
          );


        if (cancelled) {
          return;
        }


        setQuote(data);


        // -------------------------------------------------
        // REMPLIR LE FORMULAIRE
        // -------------------------------------------------

        setTitle(
          data.title || "",
        );

        setDescription(
          data.description || "",
        );

        setClientId(
          data.clientId || "",
        );

        setVatRate(
          Number(data.vatRate) || 0,
        );


      } catch (err: unknown) {

        console.error(
          "Erreur chargement devis :",
          err,
        );


        if (cancelled) {
          return;
        }


        setError(
          getErrorMessage(
            err,
            "Impossible de charger le devis.",
          ),
        );


      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }
    }


    loadQuote();


    return () => {
      cancelled = true;
    };

  }, [quoteId]);


  // =========================================================
  // ENREGISTRER
  // =========================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {

    event.preventDefault();


    if (!quote) {
      return;
    }


    // -------------------------------------------------------
    // VALIDATION TITRE
    // -------------------------------------------------------

    const cleanTitle =
      title.trim();


    if (!cleanTitle) {

      setError(
        "Le titre du devis est obligatoire.",
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // VALIDATION CLIENT
    // -------------------------------------------------------

    if (!clientId.trim()) {

      setError(
        "Le client du devis est obligatoire.",
      );

      setSuccess("");

      return;
    }


    // -------------------------------------------------------
    // VALIDATION TVA
    // -------------------------------------------------------

    const cleanVatRate =
      Number(vatRate);


    if (
      !Number.isFinite(
        cleanVatRate,
      ) ||
      cleanVatRate < 0
    ) {

      setError(
        "Le taux de TVA est invalide.",
      );

      setSuccess("");

      return;
    }


    try {

      setSaving(true);
      setError("");
      setSuccess("");


      // -----------------------------------------------------
      // MODIFICATION DU DEVIS
      // -----------------------------------------------------

      await updateQuote(
        quote.id,
        {
          title: cleanTitle,

          description:
            description.trim() ||
            undefined,

          clientId:
            clientId.trim(),

          vatRate:
            cleanVatRate,
        },
      );


      // -----------------------------------------------------
      // MESSAGE
      // -----------------------------------------------------

      setSuccess(
        "Le devis a été modifié avec succès.",
      );


      // -----------------------------------------------------
      // RETOUR VERS LE DETAIL
      // -----------------------------------------------------

      window.setTimeout(() => {

        router.push(
          `/devis/${quote.id}`,
        );

      }, 700);


    } catch (err: unknown) {

      console.error(
        "Erreur modification devis :",
        err,
      );


      setError(
        getErrorMessage(
          err,
          "Impossible de modifier le devis.",
        ),
      );


    } finally {

      setSaving(false);
    }
  }


  // =========================================================
  // ANNULER
  // =========================================================

  function handleCancel() {

    if (!quote) {
      router.push("/devis");
      return;
    }

    router.push(
      `/devis/${quote.id}`,
    );
  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <ProtectedRoute>

        <main
          style={{
            minHeight: "100vh",
            padding: "40px",
            background: "#f8fafc",
          }}
        >

          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >

            <div
              style={{
                background: "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "40px",
                textAlign: "center",
              }}
            >

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                }}
              >
                Chargement du devis...
              </p>

            </div>

          </div>

        </main>

      </ProtectedRoute>
    );
  }


  // =========================================================
  // ERREUR CHARGEMENT
  // =========================================================

  if (!quote) {

    return (

      <ProtectedRoute>

        <main
          style={{
            minHeight: "100vh",
            padding: "40px",
            background: "#f8fafc",
          }}
        >

          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >

            <div
              style={{
                background: "#fef2f2",
                color: "#991b1b",
                border:
                  "1px solid #fecaca",
                borderRadius: "10px",
                padding: "18px",
                marginBottom: "20px",
              }}
            >
              {error ||
                "Devis introuvable."}
            </div>


            <button
              type="button"
              onClick={() =>
                router.push("/devis")
              }
              style={{
                padding:
                  "11px 18px",
                borderRadius: "8px",
                border:
                  "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Retour aux devis
            </button>

          </div>

        </main>

      </ProtectedRoute>
    );
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <ProtectedRoute>

      <main
        style={{
          minHeight: "100vh",
          padding: "40px",
          background: "#f8fafc",
        }}
      >

        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap: "20px",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >

            <div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                Modifier le devis
              </h1>

              <p
                style={{
                  marginTop: "8px",
                  marginBottom: 0,
                  color: "#64748b",
                }}
              >
                Devis {quote.number}
              </p>

              {quote.client && (

                <p
                  style={{
                    marginTop: "5px",
                    marginBottom: 0,
                    color: "#475569",
                    fontWeight: 600,
                  }}
                >
                  Client :{" "}
                  {quote.client.name}
                </p>

              )}

            </div>


            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              style={{
                padding:
                  "10px 16px",
                borderRadius: "8px",
                border:
                  "1px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                cursor:
                  saving
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              ← Retour au devis
            </button>

          </div>


          {/* ================================================= */}
          {/* MESSAGES */}
          {/* ================================================= */}

          {error && (

            <div
              style={{
                padding:
                  "14px 16px",
                marginBottom:
                  "20px",
                borderRadius: "8px",
                background:
                  "#fef2f2",
                color:
                  "#991b1b",
                border:
                  "1px solid #fecaca",
              }}
            >
              {error}
            </div>

          )}


          {success && (

            <div
              style={{
                padding:
                  "14px 16px",
                marginBottom:
                  "20px",
                borderRadius: "8px",
                background:
                  "#f0fdf4",
                color:
                  "#166534",
                border:
                  "1px solid #bbf7d0",
              }}
            >
              {success}
            </div>

          )}


          {/* ================================================= */}
          {/* FORMULAIRE */}
          {/* ================================================= */}

          <form
            onSubmit={handleSubmit}
          >

            <section
              style={{
                background: "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "28px",
              }}
            >

              <h2
                style={{
                  marginTop: 0,
                  marginBottom: "25px",
                  fontSize: "22px",
                }}
              >
                Informations du devis
              </h2>


              {/* ============================================= */}
              {/* NUMERO */}
              {/* ============================================= */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600,
                  }}
                >
                  Numéro du devis
                </label>

                <input
                  type="text"
                  value={quote.number}
                  disabled
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding: "12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #e5e7eb",
                    background:
                      "#f8fafc",
                    color:
                      "#64748b",
                  }}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#64748b",
                  }}
                >
                  Le numéro du devis ne peut
                  pas être modifié.
                </small>

              </div>


              {/* ============================================= */}
              {/* CLIENT */}
              {/* ============================================= */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  htmlFor="client"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600,
                  }}
                >
                  Client
                </label>

                <input
                  id="client"
                  type="text"
                  value={
                    quote.client?.name ||
                    "Client inconnu"
                  }
                  disabled
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding: "12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #e5e7eb",
                    background:
                      "#f8fafc",
                    color:
                      "#475569",
                  }}
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#64748b",
                  }}
                >
                  Le client est conservé sur
                  le devis actuel.
                </small>

              </div>


              {/* ============================================= */}
              {/* TITRE */}
              {/* ============================================= */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  htmlFor="title"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600,
                  }}
                >
                  Titre
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  placeholder="Ex : Rénovation complète"
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding: "12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #cbd5e1",
                    outline: "none",
                  }}
                />

              </div>


              {/* ============================================= */}
              {/* DESCRIPTION */}
              {/* ============================================= */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >

                <label
                  htmlFor="description"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600,
                  }}
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  rows={6}
                  placeholder="Description du devis..."
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding: "12px",
                    borderRadius: "8px",
                    border:
                      "1px solid #cbd5e1",
                    resize: "vertical",
                    fontFamily:
                      "inherit",
                  }}
                />

              </div>


              {/* ============================================= */}
              {/* TVA */}
              {/* ============================================= */}

              <div
                style={{
                  marginBottom: "30px",
                }}
              >

                <label
                  htmlFor="vatRate"
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: 600,
                  }}
                >
                  Taux de TVA
                </label>

                <select
                  id="vatRate"
                  value={vatRate}
                  onChange={(event) =>
                    setVatRate(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  disabled={saving}
                  style={{
                    padding:
                      "12px 14px",
                    borderRadius: "8px",
                    border:
                      "1px solid #cbd5e1",
                    background: "#fff",
                    minWidth: "220px",
                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer",
                  }}
                >

                  {VAT_RATES.map(
                    (rate) => (

                      <option
                        key={rate}
                        value={rate}
                      >
                        {rate} %
                      </option>

                    ),
                  )}

                </select>

              </div>


              {/* ============================================= */}
              {/* ACTIONS */}
              {/* ============================================= */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "12px",
                  flexWrap: "wrap",
                  paddingTop: "20px",
                  borderTop:
                    "1px solid #e5e7eb",
                }}
              >

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    padding:
                      "12px 20px",
                    borderRadius: "8px",
                    border:
                      "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Annuler
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding:
                      "12px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      "#111827",
                    color: "#fff",
                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {saving
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>

              </div>

            </section>

          </form>


          {/* ================================================= */}
          {/* INFORMATIONS */}
          {/* ================================================= */}

          <section
            style={{
              marginTop: "20px",
              background: "#fff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "24px",
            }}
          >

            <h2
              style={{
                marginTop: 0,
                fontSize: "18px",
              }}
            >
              Statut du devis
            </h2>

            <p
              style={{
                marginBottom: 0,
                color: "#475569",
              }}
            >
              Statut actuel :{" "}

              <strong>
                {quote.status === "DRAFT"
                  ? "Brouillon"
                  : quote.status === "SENT"
                    ? "Envoyé"
                    : quote.status === "ACCEPTED"
                      ? "Accepté"
                      : quote.status === "REFUSED"
                        ? "Refusé"
                        : "Converti en facture"}
              </strong>
            </p>

            <p
              style={{
                marginBottom: 0,
                marginTop: "8px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              La modification ne change pas
              le statut du devis.
            </p>

          </section>

        </div>

      </main>

    </ProtectedRoute>
  );
}

