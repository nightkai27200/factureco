"use client";

import {
  useEffect,
  useState,
} from "react";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  deleteQuote,
  getQuotes,
  Quote,
} from "@/services/quote.service";


export default function DevisPage() {

  const [quotes, setQuotes] =
    useState<Quote[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);


  // =========================================================
  // CHARGER LES DEVIS
  // =========================================================

  async function loadQuotes() {

    try {

      setLoading(true);

      setError("");

      const data =
        await getQuotes();

      setQuotes(data);

    } catch (err: any) {

      console.error(
        "Erreur chargement devis :",
        err,
      );

      setError(
        err?.response?.data?.message ||
        "Impossible de charger les devis.",
      );

    } finally {

      setLoading(false);

    }
  }


  // =========================================================
  // CHARGEMENT INITIAL
  // =========================================================

  useEffect(() => {

    loadQuotes();

  }, []);


  // =========================================================
  // FORMAT MONTANT
  // =========================================================

  function formatAmount(
    amount: number | null | undefined,
  ) {

    const value =
      Number(amount ?? 0);

    return new Intl.NumberFormat(
      "fr-FR",
      {
        style: "currency",
        currency: "EUR",
      },
    ).format(value);
  }


  // =========================================================
  // FORMAT DATE
  // =========================================================

  function formatDate(
    date: string,
  ) {

    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    ).format(
      new Date(date),
    );
  }


  // =========================================================
  // STATUT
  // =========================================================

  function formatStatus(
    status: Quote["status"],
  ) {

    switch (status) {

      case "DRAFT":
        return "Brouillon";

      case "SENT":
        return "Envoyé";

      case "ACCEPTED":
        return "Accepté";

      case "REFUSED":
        return "Refusé";

      case "CONVERTED":
        return "Converti";

      default:
        return status;
    }
  }


  // =========================================================
  // COULEUR STATUT
  // =========================================================

  function statusStyle(
    status: Quote["status"],
  ) {

    switch (status) {

      case "DRAFT":

        return {
          background: "#f3f4f6",
          color: "#374151",
        };

      case "SENT":

        return {
          background: "#dbeafe",
          color: "#1d4ed8",
        };

      case "ACCEPTED":

        return {
          background: "#dcfce7",
          color: "#15803d",
        };

      case "REFUSED":

        return {
          background: "#fee2e2",
          color: "#b91c1c",
        };

      case "CONVERTED":

        return {
          background: "#ede9fe",
          color: "#6d28d9",
        };

      default:

        return {
          background: "#f3f4f6",
          color: "#374151",
        };
    }
  }


  // =========================================================
  // SUPPRIMER
  // =========================================================

  async function handleDelete(
    quote: Quote,
  ) {

    const confirmed =
      window.confirm(
        `Voulez-vous vraiment supprimer le devis ${quote.number} ?`,
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(
        quote.id,
      );

      setError("");

      await deleteQuote(
        quote.id,
      );

      setQuotes(
        current =>
          current.filter(
            item =>
              item.id !== quote.id,
          ),
      );

    } catch (err: any) {

      console.error(
        "Erreur suppression devis :",
        err,
      );

      setError(
        err?.response?.data?.message ||
        "Impossible de supprimer le devis.",
      );

    } finally {

      setDeletingId(null);

    }
  }


  // =========================================================
  // RENDU
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
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              marginBottom: "30px",
            }}
          >

            <div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: 700,
                }}
              >
                Devis
              </h1>

              <p
                style={{
                  marginTop: "8px",
                  color: "#64748b",
                }}
              >
                Gérez vos devis clients.
              </p>

            </div>


            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/devis/nouveau";
              }}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Nouveau devis
            </button>

          </div>


          {/* ================================================= */}
          {/* ERREUR */}
          {/* ================================================= */}

          {error && (

            <div
              style={{
                padding: "15px 18px",
                marginBottom: "20px",
                borderRadius: "8px",
                background: "#fee2e2",
                color: "#991b1b",
                border:
                  "1px solid #fecaca",
              }}
            >
              {error}
            </div>

          )}


          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading && (

            <div
              style={{
                padding: "40px",
                background: "#fff",
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >

              <p>
                Chargement des devis...
              </p>

            </div>

          )}


          {/* ================================================= */}
          {/* AUCUN DEVIS */}
          {/* ================================================= */}

          {!loading &&
            quotes.length === 0 && (

              <div
                style={{
                  padding: "50px 30px",
                  background: "#fff",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >

                <h2
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  Aucun devis
                </h2>

                <p
                  style={{
                    color: "#64748b",
                    marginBottom: "25px",
                  }}
                >
                  Vous n'avez pas encore créé
                  de devis.
                </p>


                <button
                  type="button"
                  onClick={() => {
                    window.location.href =
                      "/devis/nouveau";
                  }}
                  style={{
                    padding:
                      "11px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      "#111827",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Créer mon premier devis
                </button>

              </div>

            )}


          {/* ================================================= */}
          {/* LISTE */}
          {/* ================================================= */}

          {!loading &&
            quotes.length > 0 && (

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >

                {quotes.map(
                  (quote) => {

                    const status =
                      statusStyle(
                        quote.status,
                      );

                    return (

                      <div
                        key={quote.id}
                        style={{
                          background:
                            "#fff",
                          border:
                            "1px solid #e2e8f0",
                          borderRadius:
                            "12px",
                          padding:
                            "22px",
                        }}
                      >

                        {/* ================================= */}
                        {/* TOP */}
                        {/* ================================= */}

                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "flex-start",
                            gap: "20px",
                          }}
                        >

                          <div>

                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "12px",
                                marginBottom:
                                  "8px",
                              }}
                            >

                              <h2
                                style={{
                                  margin: 0,
                                  fontSize:
                                    "20px",
                                }}
                              >
                                {quote.number}
                              </h2>


                              <span
                                style={{
                                  ...status,
                                  padding:
                                    "5px 10px",
                                  borderRadius:
                                    "999px",
                                  fontSize:
                                    "13px",
                                  fontWeight:
                                    600,
                                }}
                              >
                                {formatStatus(
                                  quote.status,
                                )}
                              </span>

                            </div>


                            {quote.client && (

                              <p
                                style={{
                                  margin:
                                    "5px 0",
                                  fontWeight:
                                    600,
                                }}
                              >
                                {quote.client.name}
                              </p>

                            )}


                            {quote.client
                              ?.company && (

                              <p
                                style={{
                                  margin:
                                    "3px 0",
                                  color:
                                    "#64748b",
                                }}
                              >
                                {
                                  quote.client
                                    .company
                                }
                              </p>

                            )}


                            {quote.title && (

                              <p
                                style={{
                                  marginTop:
                                    "10px",
                                  color:
                                    "#475569",
                                }}
                              >
                                {quote.title}
                              </p>

                            )}

                          </div>


                          {/* ================================= */}
                          {/* MONTANTS */}
                          {/* ================================= */}

                          <div
                            style={{
                              textAlign:
                                "right",
                              minWidth:
                                "180px",
                            }}
                          >

                            <p
                              style={{
                                margin: 0,
                                color:
                                  "#64748b",
                                fontSize:
                                  "13px",
                              }}
                            >
                              TTC
                            </p>

                            <strong
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "4px",
                                fontSize:
                                  "22px",
                              }}
                            >
                              {formatAmount(
                                quote.amount,
                              )}
                            </strong>

                            <p
                              style={{
                                marginTop:
                                  "6px",
                                color:
                                  "#64748b",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {formatDate(
                                quote.createdAt,
                              )}
                            </p>

                          </div>

                        </div>


                        {/* ================================= */}
                        {/* MONTANTS DETAIL */}
                        {/* ================================= */}

                        <div
                          style={{
                            display:
                              "flex",
                            gap: "30px",
                            flexWrap:
                              "wrap",
                            marginTop:
                              "20px",
                            paddingTop:
                              "15px",
                            borderTop:
                              "1px solid #e5e7eb",
                          }}
                        >

                          <div>

                            <span
                              style={{
                                display:
                                  "block",
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b",
                              }}
                            >
                              HT
                            </span>

                            <strong>
                              {formatAmount(
                                quote.subtotal,
                              )}
                            </strong>

                          </div>


                          <div>

                            <span
                              style={{
                                display:
                                  "block",
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b",
                              }}
                            >
                              TVA (
                              {
                                quote.vatRate
                              }
                              %)
                            </span>

                            <strong>
                              {formatAmount(
                                quote.vatAmount,
                              )}
                            </strong>

                          </div>


                          <div>

                            <span
                              style={{
                                display:
                                  "block",
                                fontSize:
                                  "12px",
                                color:
                                  "#64748b",
                              }}
                            >
                              TTC
                            </span>

                            <strong>
                              {formatAmount(
                                quote.amount,
                              )}
                            </strong>

                          </div>

                        </div>


                        {/* ================================= */}
                        {/* ACTIONS */}
                        {/* ================================= */}

                        <div
                          style={{
                            display:
                              "flex",
                            gap: "10px",
                            flexWrap:
                              "wrap",
                            marginTop:
                              "20px",
                          }}
                        >

                          <button
                            type="button"
                            onClick={() => {
                              window.location.href =
                                `/devis/${quote.id}`;
                            }}
                            style={{
                              padding:
                                "9px 14px",
                              borderRadius:
                                "7px",
                              border:
                                "1px solid #d1d5db",
                              background:
                                "#fff",
                              cursor:
                                "pointer",
                            }}
                          >
                            Voir
                          </button>


                          <button
                            type="button"
                            onClick={() => {
                              window.location.href =
                                `/devis/${quote.id}/modifier`;
                            }}
                            style={{
                              padding:
                                "9px 14px",
                              borderRadius:
                                "7px",
                              border:
                                "1px solid #d1d5db",
                              background:
                                "#fff",
                              cursor:
                                "pointer",
                            }}
                          >
                            Modifier
                          </button>


                          <button
                            type="button"
                            onClick={() => {
                              window.location.href =
                                `/devis/${quote.id}/pdf`;
                            }}
                            style={{
                              padding:
                                "9px 14px",
                              borderRadius:
                                "7px",
                              border:
                                "1px solid #d1d5db",
                              background:
                                "#fff",
                              cursor:
                                "pointer",
                            }}
                          >
                            PDF
                          </button>


                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              quote.id
                            }
                            onClick={() =>
                              handleDelete(
                                quote,
                              )
                            }
                            style={{
                              padding:
                                "9px 14px",
                              borderRadius:
                                "7px",
                              border:
                                "1px solid #fecaca",
                              background:
                                "#fff",
                              color:
                                "#dc2626",
                              cursor:
                                deletingId ===
                                quote.id
                                  ? "wait"
                                  : "pointer",
                            }}
                          >
                            {deletingId ===
                            quote.id
                              ? "Suppression..."
                              : "Supprimer"}
                          </button>

                        </div>

                      </div>

                    );
                  },
                )}

              </div>

            )}

        </div>

      </main>

    </ProtectedRoute>

  );
}