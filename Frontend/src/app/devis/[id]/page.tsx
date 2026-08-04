"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  getQuote,
  getQuotePdf,
  updateQuote,
  updateQuoteStatus,
  convertQuoteToInvoice,
  Quote,
} from "@/services/quote.service";

import ProtectedRoute from "@/components/ProtectedRoute";


// =========================================================
// PAGE DETAIL DEVIS
// =========================================================

export default function DevisDetailPage() {

  // =========================================================
  // PARAMETRE ID
  // =========================================================

  const params =
    useParams<{ id?: string }>();

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

  const [actionLoading, setActionLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // =========================================================
  // FORMULAIRE
  // =========================================================

  const [editTitle, setEditTitle] =
    useState("");

  const [editDescription, setEditDescription] =
    useState("");

  const [editVatRate, setEditVatRate] =
    useState(20);


  // =========================================================
  // TAUX TVA
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

      return message
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .join(", ") || fallback;
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

        const data =
          await getQuote(
            currentQuoteId,
          );

        if (cancelled) {
          return;
        }

        setQuote(data);

        setEditTitle(
          data.title || "",
        );

        setEditDescription(
          data.description || "",
        );

        setEditVatRate(
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
  // FORMAT EURO
  // =========================================================

  function formatAmount(
    value: number,
  ): string {

    if (
      !Number.isFinite(value)
    ) {
      return "0,00 €";
    }

    return new Intl.NumberFormat(
      "fr-FR",
      {
        style: "currency",
        currency: "EUR",
      },
    ).format(value);
  }


  // =========================================================
  // LIBELLE STATUT
  // =========================================================

  function getStatusLabel(
    status: string,
  ): string {

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
        return "Converti en facture";

      default:
        return status;
    }
  }


  // =========================================================
  // STYLE STATUT
  // =========================================================

  function getStatusStyle(
    status: string,
  ): React.CSSProperties {

    switch (status) {

      case "DRAFT":
        return {
          background: "#f3f4f6",
          color: "#374151",
          border: "1px solid #d1d5db",
        };

      case "SENT":
        return {
          background: "#eff6ff",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        };

      case "ACCEPTED":
        return {
          background: "#ecfdf5",
          color: "#047857",
          border: "1px solid #a7f3d0",
        };

      case "REFUSED":
        return {
          background: "#fef2f2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        };

      case "CONVERTED":
        return {
          background: "#f5f3ff",
          color: "#6d28d9",
          border: "1px solid #ddd6fe",
        };

      default:
        return {
          background: "#f3f4f6",
          color: "#374151",
          border: "1px solid #d1d5db",
        };
    }
  }


  // =========================================================
  // EDITION
  // =========================================================

  function handleEdit() {

    if (!quote) {
      return;
    }

    setEditTitle(
      quote.title || "",
    );

    setEditDescription(
      quote.description || "",
    );

    setEditVatRate(
      Number(quote.vatRate) || 0,
    );

    setError("");
    setSuccess("");
    setEditing(true);
  }


  function handleCancelEdit() {

    if (!quote) {
      return;
    }

    setEditTitle(
      quote.title || "",
    );

    setEditDescription(
      quote.description || "",
    );

    setEditVatRate(
      Number(quote.vatRate) || 0,
    );

    setEditing(false);
    setError("");
    setSuccess("");
  }


  // =========================================================
  // SAUVEGARDE
  // =========================================================

  async function handleSaveEdit() {

    if (!quote) {
      return;
    }

    const cleanTitle =
      editTitle.trim();

    if (!cleanTitle) {

      setError(
        "Le titre du devis est obligatoire.",
      );

      return;
    }

    const vatRate =
      Number(editVatRate);

    if (
      !Number.isFinite(vatRate) ||
      vatRate < 0
    ) {

      setError(
        "Le taux de TVA est invalide.",
      );

      return;
    }

    try {

      setSaving(true);
      setError("");
      setSuccess("");

      await updateQuote(
        quote.id,
        {
          title: cleanTitle,
          description:
            editDescription.trim() ||
            undefined,
          vatRate,
        },
      );

      const freshQuote =
        await getQuote(
          quote.id,
        );

      setQuote(freshQuote);

      setEditTitle(
        freshQuote.title || "",
      );

      setEditDescription(
        freshQuote.description || "",
      );

      setEditVatRate(
        Number(freshQuote.vatRate) || 0,
      );

      setEditing(false);

      setSuccess(
        "Le devis a été modifié avec succès.",
      );

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
  // STATUT
  // =========================================================

  async function handleStatusChange(
    status:
      | "SENT"
      | "ACCEPTED"
      | "REFUSED",
  ) {

    if (!quote) {
      return;
    }

    try {

      setActionLoading(true);
      setError("");
      setSuccess("");

      await updateQuoteStatus(
        quote.id,
        status,
      );

      const freshQuote =
        await getQuote(
          quote.id,
        );

      setQuote(freshQuote);

      setSuccess(
        "Le statut du devis a été mis à jour.",
      );

    } catch (err: unknown) {

      console.error(
        "Erreur changement statut :",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "Impossible de modifier le statut du devis.",
        ),
      );

    } finally {

      setActionLoading(false);
    }
  }


  // =========================================================
  // CONVERSION FACTURE
  // =========================================================

  async function handleConvertToInvoice() {

    if (!quote) {
      return;
    }

    const confirmed =
      window.confirm(
        "Voulez-vous convertir ce devis en facture ?",
      );

    if (!confirmed) {
      return;
    }

    try {

      setActionLoading(true);
      setError("");
      setSuccess("");

      const invoice =
        await convertQuoteToInvoice(
          quote.id,
        );

      const freshQuote =
        await getQuote(
          quote.id,
        );

      setQuote(freshQuote);

      setSuccess(
        `Facture ${invoice.number} créée avec succès.`,
      );

    } catch (err: unknown) {

      console.error(
        "Erreur conversion facture :",
        err,
      );

      setError(
        getErrorMessage(
          err,
          "Impossible de convertir le devis en facture.",
        ),
      );

    } finally {

      setActionLoading(false);
    }
  }


  // =========================================================
  // PDF
  // =========================================================

  async function handlePdf() {

    if (!quote) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      const blob =
        await getQuotePdf(
          quote.id,
        );

      const url =
        window.URL.createObjectURL(
          blob,
        );

      window.open(
        url,
        "_blank",
        "noopener,noreferrer",
      );

      window.setTimeout(() => {

        window.URL.revokeObjectURL(
          url,
        );

      }, 10000);

    } catch (err: unknown) {

      console.error(
        "Erreur génération PDF :",
        err,
      );

      setError(
        "Impossible de générer le PDF.",
      );
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

          <div
            style={{
              padding: "24px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              background: "#fff",
            }}
          >
            Chargement du devis...
          </div>

        </main>

      </ProtectedRoute>
    );
  }


  // =========================================================
  // ERREUR
  // =========================================================

  if (error && !quote) {

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
              border: "1px solid #ef4444",
              background: "#fef2f2",
              color: "#b91c1c",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>

          <button
            type="button"
            onClick={handleBack}
          >
            Retour aux devis
          </button>

        </main>

      </ProtectedRoute>
    );
  }


  if (!quote) {
    return null;
  }


  // =========================================================
  // ITEMS
  // =========================================================

  const quoteItems =
    quote.items ??
    quote.quoteItems ??
    [];


  // =========================================================
  // RENDU
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >

          <div>

            <h1>
              Devis {quote.number}
            </h1>

            <p>
              {quote.title || "Sans titre"}
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
              disabled={
                actionLoading ||
                saving
              }
            >
              Retour
            </button>

            <button
              type="button"
              onClick={handlePdf}
              disabled={
                actionLoading ||
                saving
              }
            >
              Voir le PDF
            </button>

            {!editing &&
              quote.status !== "CONVERTED" && (

              <button
                type="button"
                onClick={handleEdit}
                disabled={
                  actionLoading ||
                  saving
                }
              >
                Modifier
              </button>

            )}

          </div>

        </div>


        {error && (

          <div
            style={{
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>

        )}


        {success && (

          <div
            style={{
              padding: "14px",
              marginBottom: "20px",
              borderRadius: "8px",
              background: "#f0fdf4",
              color: "#166534",
            }}
          >
            {success}
          </div>

        )}


        {editing && (

          <section
            style={{
              border: "1px solid #93c5fd",
              borderRadius: "10px",
              padding: "24px",
              marginBottom: "20px",
              background: "#eff6ff",
            }}
          >

            <h2>
              Modifier le devis
            </h2>

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >

              <div>

                <label>
                  Titre
                </label>

                <input
                  type="text"
                  value={editTitle}
                  onChange={(event) =>
                    setEditTitle(
                      event.target.value,
                    )
                  }
                  disabled={saving}
                  style={{
                    width: "100%",
                    padding: "12px",
                  }}
                />

              </div>


              <div>

                <label>
                  Description
                </label>

                <textarea
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(
                      event.target.value,
                    )
                  }
                  rows={5}
                  disabled={saving}
                  style={{
                    width: "100%",
                    padding: "12px",
                  }}
                />

              </div>


              <div>

                <label>
                  Taux de TVA
                </label>

                <select
                  value={editVatRate}
                  onChange={(event) =>
                    setEditVatRate(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  disabled={saving}
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


              <div>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving
                    ? "Enregistrement..."
                    : "Enregistrer"}
                </button>

              </div>

            </div>

          </section>

        )}


        {/* STATUT */}

        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "24px",
            marginBottom: "20px",
            background: "#fff",
          }}
        >

          <strong>
            Statut du devis
          </strong>

          <div
            style={{
              marginTop: "10px",
              marginBottom: "20px",
            }}
          >

            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "999px",
                fontWeight: 600,
                ...getStatusStyle(
                  quote.status,
                ),
              }}
            >
              {getStatusLabel(
                quote.status,
              )}
            </span>

          </div>


          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            {quote.status === "DRAFT" && (

              <button
                type="button"
                onClick={() =>
                  handleStatusChange("SENT")
                }
                disabled={
                  actionLoading ||
                  saving ||
                  editing
                }
              >
                {actionLoading
                  ? "Traitement..."
                  : "Envoyer le devis"}
              </button>

            )}


            {quote.status === "SENT" && (

              <>
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange("ACCEPTED")
                  }
                  disabled={
                    actionLoading ||
                    saving ||
                    editing
                  }
                >
                  Accepter
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange("REFUSED")
                  }
                  disabled={
                    actionLoading ||
                    saving ||
                    editing
                  }
                >
                  Refuser
                </button>
              </>

            )}


            {quote.status === "ACCEPTED" && (

              <button
                type="button"
                onClick={
                  handleConvertToInvoice
                }
                disabled={
                  actionLoading ||
                  saving ||
                  editing
                }
              >
                {actionLoading
                  ? "Conversion..."
                  : "Convertir en facture"}
              </button>

            )}

          </div>

        </section>


        {/* INFORMATIONS */}

        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "24px",
            marginBottom: "20px",
            background: "#fff",
          }}
        >

          <h2>
            Informations
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >

            <div>
              <strong>Numéro</strong>
              <p>{quote.number}</p>
            </div>

            <div>
              <strong>Statut</strong>
              <p>
                {getStatusLabel(
                  quote.status,
                )}
              </p>
            </div>

            <div>
              <strong>Client</strong>
              <p>
                {quote.client?.name ||
                  "Client inconnu"}
              </p>
            </div>

            <div>
              <strong>Email</strong>
              <p>
                {quote.client?.email || "-"}
              </p>
            </div>

          </div>


          {!editing &&
            quote.description && (

            <div>

              <strong>
                Description
              </strong>

              <p
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                {quote.description}
              </p>

            </div>

          )}

        </section>


        {/* LIGNES */}

        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "24px",
            marginBottom: "20px",
            background: "#fff",
          }}
        >

          <h2>
            Lignes du devis
          </h2>

          <div
            style={{
              overflowX: "auto",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "700px",
              }}
            >

              <thead>

                <tr>

                  <th>
                    Description
                  </th>

                  <th>
                    Quantité
                  </th>

                  <th>
                    Prix unitaire HT
                  </th>

                  <th>
                    Total HT
                  </th>

                </tr>

              </thead>


              <tbody>

                {quoteItems.length > 0 ? (

                  quoteItems.map(
                    (item) => (

                      <tr
                        key={item.id}
                      >

                        <td>
                          {item.description}
                        </td>

                        <td>
                          {Number(
                            item.quantity,
                          )}
                        </td>

                        <td>
                          {formatAmount(
                            Number(
                              item.unitPrice,
                            ),
                          )}
                        </td>

                        <td>
                          {formatAmount(
                            Number(
                              item.total,
                            ),
                          )}
                        </td>

                      </tr>

                    ),
                  )

                ) : (

                  <tr>

                    <td colSpan={4}>
                      Aucune ligne dans ce devis.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* TOTAUX */}

        <section
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >

          <div
            style={{
              width: "320px",
              maxWidth: "100%",
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "24px",
              background: "#fff",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
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
                justifyContent: "space-between",
                marginTop: "12px",
              }}
            >

              <span>
                TVA ({Number(
                  quote.vatRate,
                )} %)
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
                justifyContent: "space-between",
                marginTop: "15px",
                fontSize: "20px",
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