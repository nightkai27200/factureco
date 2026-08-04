"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getQuote,
  getQuotePdf,
  Quote,
} from "@/services/quote.service";

import ProtectedRoute from "@/components/ProtectedRoute";


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}


export default function DevisDetailPage({
  params,
}: PageProps) {

  const [quote, setQuote] =
    useState<Quote | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================================================
  // CHARGER LE DEVIS
  // =========================================================

  useEffect(() => {

    let cancelled = false;

    async function loadQuote() {

      try {

        setLoading(true);
        setError("");

        // IMPORTANT :
        // params est une Promise avec Next.js récent
        const { id } = await params;

        if (!id) {

          throw new Error(
            "Identifiant du devis manquant.",
          );

        }

        const data =
          await getQuote(id);

        if (!cancelled) {
          setQuote(data);
        }

      } catch (err: any) {

        console.error(
          "Erreur chargement devis :",
          err,
        );

        if (cancelled) {
          return;
        }

        const message =
          err?.response?.data?.message;

        if (Array.isArray(message)) {

          setError(
            message.join(", "),
          );

        } else {

          setError(
            message ||
            err?.message ||
            "Impossible de charger le devis.",
          );

        }

        setQuote(null);

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

  }, [params]);


  // =========================================================
  // PDF
  // =========================================================

  async function handlePdf() {

    if (!quote) {
      return;
    }

    try {

      setError("");

      const blob =
        await getQuotePdf(quote.id);

      const url =
        window.URL.createObjectURL(blob);

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );

      // Libérer l'URL un peu plus tard
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);

    } catch (err: any) {

      console.error(
        "Erreur génération PDF :",
        err,
      );

      const message =
        err?.response?.data?.message;

      if (Array.isArray(message)) {

        setError(
          message.join(", "),
        );

      } else {

        setError(
          message ||
          "Impossible de générer le PDF.",
        );

      }

    }

  }


  // =========================================================
  // RETOUR
  // =========================================================

  function handleBack() {

    window.location.href =
      "/devis";

  }


  // =========================================================
  // FORMAT €
  // =========================================================

  function formatAmount(
    value: number,
  ) {

    return new Intl.NumberFormat(
      "fr-FR",
      {
        style: "currency",
        currency: "EUR",
      },
    ).format(value);

  }


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <ProtectedRoute>

        <main
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >

          <p>
            Chargement du devis...
          </p>

        </main>

      </ProtectedRoute>

    );

  }


  // =========================================================
  // ERREUR
  // =========================================================

  if (error || !quote) {

    return (

      <ProtectedRoute>

        <main
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >

          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              border:
                "1px solid #ef4444",
              background:
                "#fef2f2",
              color:
                "#b91c1c",
              marginBottom: "20px",
            }}
          >

            {error ||
              "Devis introuvable."}

          </div>


          <button
            type="button"
            onClick={handleBack}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Retour aux devis
          </button>

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
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 20px",
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
            alignItems: "center",
            marginBottom: "30px",
            gap: "20px",
          }}
        >

          <div>

            <h1>
              Devis {quote.number}
            </h1>

            <p>
              {quote.title}
            </p>

          </div>


          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Retour
            </button>


            <button
              type="button"
              onClick={handlePdf}
              style={{
                padding: "10px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Voir le PDF
            </button>

          </div>

        </div>


        {/* ================================================= */}
        {/* INFORMATIONS */}
        {/* ================================================= */}

        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "24px",
            marginBottom: "20px",
          }}
        >

          <h2>
            Informations
          </h2>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >

            <div>

              <strong>
                Numéro
              </strong>

              <p>
                {quote.number}
              </p>

            </div>


            <div>

              <strong>
                Statut
              </strong>

              <p>
                {quote.status}
              </p>

            </div>


            <div>

              <strong>
                Client
              </strong>

              <p>
                {quote.client?.name ||
                  "Client inconnu"}
              </p>

            </div>


            <div>

              <strong>
                Email
              </strong>

              <p>
                {quote.client?.email ||
                  "-"}
              </p>

            </div>

          </div>


          {quote.description && (

            <div
              style={{
                marginTop: "20px",
              }}
            >

              <strong>
                Description
              </strong>

              <p>
                {quote.description}
              </p>

            </div>

          )}

        </section>


        {/* ================================================= */}
        {/* LIGNES */}
        {/* ================================================= */}

        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "24px",
            marginBottom: "20px",
          }}
        >

          <h2>
            Lignes du devis
          </h2>


          <div
            style={{
              marginTop: "20px",
              overflowX: "auto",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >

              <thead>

                <tr>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px",
                      borderBottom:
                        "1px solid #ddd",
                    }}
                  >
                    Description
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                      padding: "12px",
                      borderBottom:
                        "1px solid #ddd",
                    }}
                  >
                    Quantité
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                      padding: "12px",
                      borderBottom:
                        "1px solid #ddd",
                    }}
                  >
                    Prix unitaire HT
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                      padding: "12px",
                      borderBottom:
                        "1px solid #ddd",
                    }}
                  >
                    Total HT
                  </th>

                </tr>

              </thead>


              <tbody>

                {quote.items?.map(
                  (item) => (

                    <tr key={item.id}>

                      <td
                        style={{
                          padding: "12px",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {item.description}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {item.quantity}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom:
                            "1px solid #eee",
                        }}
                      >
                        {formatAmount(
                          Number(
                            item.unitPrice,
                          ),
                        )}
                      </td>

                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom:
                            "1px solid #eee",
                          fontWeight: 600,
                        }}
                      >
                        {formatAmount(
                          Number(
                            item.total,
                          ),
                        )}
                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* ================================================= */}
        {/* TOTAUX */}
        {/* ================================================= */}

        <section
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >

          <div
            style={{
              width: "320px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "24px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "12px",
                gap: "20px",
              }}
            >

              <span>
                Sous-total HT
              </span>

              <strong>
                {formatAmount(
                  Number(
                    quote.subtotal,
                  ),
                )}
              </strong>

            </div>


            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: "12px",
                gap: "20px",
              }}
            >

              <span>
                TVA ({quote.vatRate}%)
              </span>

              <strong>
                {formatAmount(
                  Number(
                    quote.vatAmount,
                  ),
                )}
              </strong>

            </div>


            <hr />


            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginTop: "15px",
                fontSize: "20px",
                gap: "20px",
              }}
            >

              <strong>
                Total TTC
              </strong>

              <strong>
                {formatAmount(
                  Number(
                    quote.amount,
                  ),
                )}
              </strong>

            </div>

          </div>

        </section>

      </main>

    </ProtectedRoute>

  );

}