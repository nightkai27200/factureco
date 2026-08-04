
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getQuote,
  getQuotePdf,
  Quote,
} from "@/services/quote.service";

export default function DevisPdfPage() {
  const params = useParams<{ id?: string }>();

  const quoteId =
    typeof params?.id === "string"
      ? params.id
      : undefined;

  const [quote, setQuote] =
    useState<Quote | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [pdfUrl, setPdfUrl] =
    useState<string | null>(null);


  // =========================================================
  // CHARGER LE DEVIS + PDF
  // =========================================================

  useEffect(() => {
    if (!quoteId) {
      setLoading(false);
      setError(
        "Identifiant du devis introuvable.",
      );
      return;
    }

    const currentQuoteId =
      quoteId;

    let cancelled = false;

    async function loadPdf() {
      try {
        setLoading(true);
        setError("");

        // ---------------------------------------------------
        // Charger le devis
        // ---------------------------------------------------

        const quoteData =
          await getQuote(
            currentQuoteId,
          );

        if (cancelled) {
          return;
        }

        setQuote(
          quoteData,
        );

        // ---------------------------------------------------
        // Charger le PDF
        // ---------------------------------------------------

        const blob =
          await getQuotePdf(
            currentQuoteId,
          );

        if (cancelled) {
          return;
        }

        const url =
          window.URL.createObjectURL(
            blob,
          );

        setPdfUrl(url);

      } catch (err: any) {
        console.error(
          "Erreur chargement PDF :",
          err,
        );

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Impossible de générer le PDF du devis.",
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [quoteId]);


  // =========================================================
  // NETTOYAGE URL PDF
  // =========================================================

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(
          pdfUrl,
        );
      }
    };
  }, [pdfUrl]);


  // =========================================================
  // RETOUR
  // =========================================================

  function handleBack() {
    if (quoteId) {
      window.location.href =
        `/devis/${quoteId}`;
      return;
    }

    window.location.href =
      "/devis";
  }


  // =========================================================
  // OUVRIR PDF
  // =========================================================

  function handleOpenPdf() {
    if (!pdfUrl) {
      return;
    }

    window.open(
      pdfUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }


  // =========================================================
  // TELECHARGER PDF
  // =========================================================

  function handleDownload() {
    if (!pdfUrl) {
      return;
    }

    const link =
      document.createElement(
        "a",
      );

    link.href =
      pdfUrl;

    link.download =
      quote
        ? `devis-${quote.number}.pdf`
        : "devis.pdf";

    document.body.appendChild(
      link,
    );

    link.click();

    document.body.removeChild(
      link,
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
            padding: "40px 20px",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              padding: "30px",
              background: "#fff",
              border:
                "1px solid #e2e8f0",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p>
              Génération du PDF...
            </p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }


  // =========================================================
  // ERREUR
  // =========================================================

  if (error) {
    return (
      <ProtectedRoute>
        <main
          style={{
            minHeight: "100vh",
            padding: "40px 20px",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                padding: "16px",
                marginBottom: "20px",
                borderRadius: "8px",
                border:
                  "1px solid #fecaca",
                background: "#fef2f2",
                color: "#b91c1c",
              }}
            >
              {error}
            </div>

            <button
              type="button"
              onClick={handleBack}
              style={{
                padding:
                  "11px 18px",
                borderRadius:
                  "8px",
                border:
                  "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Retour au devis
            </button>
          </div>
        </main>
      </ProtectedRoute>
    );
  }


  // =========================================================
  // PAGE PDF
  // =========================================================

  return (
    <ProtectedRoute>
      <main
        style={{
          minHeight: "100vh",
          padding: "30px 20px",
          background: "#f1f5f9",
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
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: "15px",
              marginBottom:
                "20px",
              flexWrap: "wrap",
            }}
          >

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                }}
              >
                PDF du devis
              </h1>

              {quote && (
                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color:
                      "#64748b",
                  }}
                >
                  Devis{" "}
                  <strong>
                    {quote.number}
                  </strong>
                  {" — "}
                  {quote.title ||
                    "Sans titre"}
                </p>
              )}
            </div>


            {/* ================================================= */}
            {/* ACTIONS */}
            {/* ================================================= */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap:
                  "wrap",
              }}
            >

              <button
                type="button"
                onClick={handleBack}
                style={{
                  padding:
                    "10px 16px",
                  borderRadius:
                    "8px",
                  border:
                    "1px solid #d1d5db",
                  background:
                    "#fff",
                  cursor:
                    "pointer",
                }}
              >
                Retour
              </button>


              <button
                type="button"
                onClick={
                  handleDownload
                }
                disabled={
                  !pdfUrl
                }
                style={{
                  padding:
                    "10px 16px",
                  borderRadius:
                    "8px",
                  border:
                    "none",
                  background:
                    "#2563eb",
                  color:
                    "#fff",
                  cursor:
                    !pdfUrl
                      ? "not-allowed"
                      : "pointer",
                  fontWeight:
                    600,
                }}
              >
                Télécharger
              </button>


              <button
                type="button"
                onClick={
                  handleOpenPdf
                }
                disabled={
                  !pdfUrl
                }
                style={{
                  padding:
                    "10px 16px",
                  borderRadius:
                    "8px",
                  border:
                    "none",
                  background:
                    "#111827",
                  color:
                    "#fff",
                  cursor:
                    !pdfUrl
                      ? "not-allowed"
                      : "pointer",
                  fontWeight:
                    600,
                }}
              >
                Ouvrir dans un nouvel onglet
              </button>

            </div>

          </div>


          {/* ================================================= */}
          {/* PDF */}
          {/* ================================================= */}

          {pdfUrl && (
            <div
              style={{
                width: "100%",
                height:
                  "calc(100vh - 170px)",
                minHeight:
                  "700px",
                background:
                  "#fff",
                border:
                  "1px solid #cbd5e1",
                borderRadius:
                  "12px",
                overflow:
                  "hidden",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <iframe
                src={pdfUrl}
                title={
                  quote
                    ? `PDF du devis ${quote.number}`
                    : "PDF du devis"
                }
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          )}

        </div>
      </main>
    </ProtectedRoute>
  );
}
