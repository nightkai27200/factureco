"use client";

import {
  useEffect,
  useState,
} from "react";

import { API_URL } from "@/lib/config";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getQuotes,
  createQuote,
  Quote,
} from "@/services/quote.service";

import {
  getClients,
  Client,
} from "@/services/client.service";

import api from "@/lib/api";


// ============================================================
// LIGNE DE DEVIS
// ============================================================

type Line = {
  description: string;
  quantity: number;
  unitPrice: number;
};


// ============================================================
// PAGE
// ============================================================

export default function DevisPage() {

  const [quotes, setQuotes] =
    useState<Quote[]>([]);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [clientId, setClientId] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [lines, setLines] =
    useState<Line[]>([
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);


  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  async function loadData() {

    try {

      const q =
        await getQuotes();

      const c =
        await getClients();

      setQuotes(q);

      setClients(c);

    }
    catch (error) {

      console.error(
        "Erreur chargement données",
        error
      );

    }

  }


  useEffect(() => {

    loadData();

  }, []);


  // ==========================================================
  // MODIFIER UNE LIGNE
  // ==========================================================

  function updateLine(
    index: number,
    field: keyof Line,
    value: string | number,
  ) {

    const copy =
      [...lines];

    copy[index] = {
      ...copy[index],
      [field]: value,
    };

    setLines(copy);

  }


  // ==========================================================
  // AJOUTER UNE LIGNE
  // ==========================================================

  function addLine() {

    setLines([
      ...lines,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);

  }


  // ==========================================================
  // TOTAL
  // ==========================================================

  function total() {

    return lines.reduce(
      (sum, line) =>
        sum +
        line.quantity *
        line.unitPrice,
      0
    );

  }


  // ==========================================================
  // CREER LE DEVIS
  // ==========================================================

  async function saveQuote() {

    if (!clientId) {

      alert(
        "Choisir un client"
      );

      return;

    }


    if (!title.trim()) {

      alert(
        "Saisir un titre pour le devis"
      );

      return;

    }


    if (lines.length === 0) {

      alert(
        "Ajouter au moins une ligne au devis"
      );

      return;

    }


    const invalidLine =
      lines.some(
        (line) =>
          !line.description.trim() ||
          line.quantity <= 0 ||
          line.unitPrice < 0
      );


    if (invalidLine) {

      alert(
        "Vérifiez les lignes du devis."
      );

      return;

    }


    try {

      // IMPORTANT :
      // Le montant total n'est PAS envoyé au backend.
      // Le backend doit recalculer le montant à partir
      // des lignes du devis.

      await createQuote({

        clientId,

        title: title.trim(),

        items: lines.map(
          (line) => ({

            description:
              line.description.trim(),

            quantity:
              line.quantity,

            unitPrice:
              line.unitPrice,

          })
        ),

      });


      alert(
        "Devis créé avec succès."
      );


      setTitle("");

      setClientId("");

      setLines([
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ]);


      await loadData();

    }
    catch (error) {

      console.error(
        "Erreur création devis",
        error
      );

      alert(
        "Erreur lors de la création du devis."
      );

    }

  }


  // ==========================================================
  // PDF
  // ==========================================================

  async function downloadPdf(
    quoteId: string,
  ) {

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      const response =
        await api.get<Blob>(
          `/quotes/${quoteId}/pdf`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            responseType:
              "blob",
          }
        );


      const url =
        window.URL.createObjectURL(
          response.data
        );


      window.open(url);


    }
    catch (error) {

      console.error(
        "Erreur PDF",
        error
      );

      alert(
        "Impossible de télécharger le PDF"
      );

    }

  }


  // ==========================================================
  // CONVERSION EN FACTURE
  // ==========================================================

  async function convertQuote(
    quoteId: string,
  ) {

    try {

      const response =
        await fetch(
          `${API_URL}/quotes/${quoteId}/convert`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );


      if (!response.ok) {

        throw new Error(
          "Erreur conversion devis"
        );

      }


      alert(
        "Devis transformé en facture"
      );


      await loadData();

    }
    catch (error) {

      console.error(
        "Erreur conversion",
        error
      );

      alert(
        "Impossible de transformer le devis en facture"
      );

    }

  }


  // ==========================================================
  // SUPPRESSION
  // ==========================================================

  async function deleteQuote(
    quoteId: string,
  ) {

    try {

      const response =
        await fetch(
          `${API_URL}/quotes/${quoteId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );


      if (!response.ok) {

        throw new Error(
          "Erreur suppression devis"
        );

      }


      await loadData();

    }
    catch (error) {

      console.error(
        "Erreur suppression",
        error
      );

      alert(
        "Impossible de supprimer le devis"
      );

    }

  }


  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (

    <ProtectedRoute>

      <main
        style={{
          padding: "40px",
        }}
      >

        <h1>
          Devis
        </h1>


        {/* ====================================================
            NOUVEAU DEVIS
        ==================================================== */}

        <h2>
          Nouveau devis
        </h2>


        {/* CLIENT */}

        <select
          value={clientId}
          onChange={(e) =>
            setClientId(
              e.target.value
            )
          }
        >

          <option value="">
            Choisir un client
          </option>


          {clients.map(
            (client) => (

              <option
                key={client.id}
                value={client.id}
              >
                {client.name}
              </option>

            )
          )}

        </select>


        <br />
        <br />


        {/* TITRE */}

        <input
          placeholder="Titre du devis"
          value={title}
          onChange={(e) =>
            setTitle(
              e.target.value
            )
          }
        />


        {/* ====================================================
            LIGNES
        ==================================================== */}

        <h3>
          Lignes
        </h3>


        {lines.map(
          (line, index) => (

            <div
              key={index}
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "10px",
              }}
            >

              <input
                placeholder="Description"
                value={
                  line.description
                }
                onChange={(e) =>
                  updateLine(
                    index,
                    "description",
                    e.target.value
                  )
                }
              />


              <input
                type="number"
                min="1"
                value={
                  line.quantity
                }
                onChange={(e) =>
                  updateLine(
                    index,
                    "quantity",
                    Number(
                      e.target.value
                    )
                  )
                }
              />


              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  line.unitPrice
                }
                onChange={(e) =>
                  updateLine(
                    index,
                    "unitPrice",
                    Number(
                      e.target.value
                    )
                  )
                }
              />

            </div>

          )
        )}


        <button
          onClick={addLine}
        >
          Ajouter une ligne
        </button>


        {/* TOTAL */}

        <h3>
          Total :{" "}
          {total().toFixed(2)} €
        </h3>


        {/* CREATION */}

        <button
          onClick={saveQuote}
        >
          Créer le devis
        </button>


        <hr />


        {/* ====================================================
            LISTE DES DEVIS
        ==================================================== */}

        <h2>
          Mes devis
        </h2>


        {quotes.map(
          (q) => (

            <div
              key={q.id}
              style={{
                border:
                  "1px solid #ddd",

                padding: "15px",

                marginBottom: "10px",

                borderRadius: "8px",
              }}
            >

              <p>

                <strong>
                  {q.number}
                </strong>

              </p>


              <p>

                Statut :{" "}

                {q.status}

              </p>


              <p>

                Montant :{" "}

                {Number(
                  q.amount || 0
                ).toFixed(2)} €

              </p>


              {/* ACTIONS */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >

                {/* PDF */}

                <button
                  onClick={() =>
                    downloadPdf(
                      q.id
                    )
                  }
                >
                  📄 PDF
                </button>


                {/* CONVERTIR */}

                <button
                  onClick={() =>
                    convertQuote(
                      q.id
                    )
                  }
                >
                  🔄 Convertir
                </button>


                {/* SUPPRIMER */}

                <button
                  onClick={() =>
                    deleteQuote(
                      q.id
                    )
                  }
                >
                  🗑 Supprimer
                </button>

              </div>

            </div>

          )
        )}

      </main>

    </ProtectedRoute>

  );

}