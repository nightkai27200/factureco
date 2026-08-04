"use client";

import {
  useEffect,
  useState,
} from "react";

import ProtectedRoute from "@/components/ProtectedRoute";

import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  Client,
} from "@/services/client.service";


export default function ClientsPage() {

  const [clients, setClients] =
    useState<Client[]>([]);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [editingEmail, setEditingEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);


  // =====================================
  // CHARGER LES CLIENTS
  // =====================================

  async function loadClients() {

    try {

      setLoading(true);

      const data =
        await getClients();

      setClients(data);

    } catch (error) {

      console.error(
        "Erreur chargement clients :",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadClients();

  }, []);


  // =====================================
  // AJOUTER UN CLIENT
  // =====================================

  async function addClient() {

    if (!name.trim()) {

      alert(
        "Veuillez renseigner le nom du client."
      );

      return;

    }

    try {

      setSaving(true);

      await createClient({
        name: name.trim(),
        email: email.trim(),
      });

      setName("");
      setEmail("");

      setShowForm(false);

      await loadClients();

    } catch (error: any) {

      console.error(
        "Erreur création client :",
        error
      );

      const message =
        error?.response?.data?.message;

      if (
        error?.response?.status === 403 &&
        message?.includes("Limite atteinte")
      ) {

        alert(
          "Vous avez atteint la limite de 5 clients avec votre abonnement FREE.\n\nPassez à STARTER pour avoir des clients illimités."
        );

        return;

      }

      alert(
        message ||
        "Impossible de créer le client."
      );

    } finally {

      setSaving(false);

    }

  }


  // =====================================
  // COMMENCER MODIFICATION
  // =====================================

  function startEdit(client: Client) {

    setEditingId(client.id);

    setEditingName(
      client.name
    );

    setEditingEmail(
      client.email || ""
    );

  }


  // =====================================
  // ANNULER MODIFICATION
  // =====================================

  function cancelEdit() {

    setEditingId(null);

    setEditingName("");

    setEditingEmail("");

  }


  // =====================================
  // ENREGISTRER MODIFICATION
  // =====================================

  async function saveEdit() {

    if (!editingId) {
      return;
    }

    if (!editingName.trim()) {

      alert(
        "Le nom du client est obligatoire."
      );

      return;

    }

    try {

      setSaving(true);

      await updateClient(
        editingId,
        {
          name: editingName.trim(),
          email: editingEmail.trim(),
        }
      );

      cancelEdit();

      await loadClients();

    } catch (error: any) {

      console.error(
        "Erreur modification client :",
        error
      );

      alert(
        error?.response?.data?.message ||
        "Impossible de modifier le client."
      );

    } finally {

      setSaving(false);

    }

  }


  // =====================================
  // SUPPRIMER
  // =====================================

  async function removeClient(
    id: string
  ) {

    const confirmed =
      window.confirm(
        "Voulez-vous vraiment supprimer ce client ?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteClient(id);

      await loadClients();

    } catch (error: any) {

      console.error(
        "Erreur suppression client :",
        error
      );

      alert(
        error?.response?.data?.message ||
        "Impossible de supprimer le client."
      );

    }

  }


  return (

    <ProtectedRoute>

      <main
        style={{
          minHeight: "100vh",
          padding: "40px",
          background: "#f5f7fb",
        }}
      >

        {/* =================================
            HEADER
        ================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >

          <div>

            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              Clients
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "#6b7280",
              }}
            >
              Gérez vos clients et leurs informations.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              setShowForm(!showForm)
            }
            style={{
              padding: "12px 18px",
              background: "#1e3a8a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >

            {showForm
              ? "Fermer"
              : "+ Nouveau client"
            }

          </button>

        </div>


        {/* =================================
            FORMULAIRE AJOUT
        ================================= */}

        {showForm && (

          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "12px",
              marginBottom: "30px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >

            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                fontSize: "20px",
              }}
            >
              Ajouter un client
            </h2>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "15px",
              }}
            >

              <input
                placeholder="Nom du client"
                value={name}
                onChange={
                  e =>
                    setName(
                      e.target.value
                    )
                }
                style={inputStyle}
              />


              <input
                placeholder="Adresse email"
                type="email"
                value={email}
                onChange={
                  e =>
                    setEmail(
                      e.target.value
                    )
                }
                style={inputStyle}
              />

            </div>


            <button
              type="button"
              onClick={addClient}
              disabled={saving}
              style={{
                marginTop: "18px",
                padding: "11px 18px",
                background:
                  saving
                    ? "#94a3b8"
                    : "#1e3a8a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor:
                  saving
                    ? "not-allowed"
                    : "pointer",
                fontWeight: "600",
              }}
            >

              {saving
                ? "Création..."
                : "Ajouter le client"
              }

            </button>

          </div>

        )}


        {/* =================================
            LISTE
        ================================= */}

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >

          <div
            style={{
              padding: "22px 25px",
              borderBottom:
                "1px solid #e5e7eb",
            }}
          >

            <h2
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              Liste des clients
            </h2>

          </div>


          {loading && (

            <div
              style={{
                padding: "30px",
                color: "#6b7280",
              }}
            >
              Chargement des clients...
            </div>

          )}


          {!loading &&
            clients.length === 0 && (

              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >

                <p>
                  Aucun client pour le moment.
                </p>

                <p>
                  Cliquez sur
                  <strong>
                    {" + Nouveau client "}
                  </strong>
                  pour commencer.
                </p>

              </div>

            )}


          {!loading &&
            clients.map(client => (

              <div
                key={client.id}
                style={{
                  padding: "22px 25px",
                  borderBottom:
                    "1px solid #e5e7eb",
                }}
              >

                {editingId === client.id ? (

                  /* =========================
                     MODE ÉDITION
                  ========================= */

                  <div>

                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom: "18px",
                      }}
                    >
                      Modifier le client
                    </h3>


                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: "15px",
                      }}
                    >

                      <input
                        placeholder="Nom"
                        value={editingName}
                        onChange={
                          e =>
                            setEditingName(
                              e.target.value
                            )
                        }
                        style={inputStyle}
                      />


                      <input
                        placeholder="Email"
                        type="email"
                        value={editingEmail}
                        onChange={
                          e =>
                            setEditingEmail(
                              e.target.value
                            )
                        }
                        style={inputStyle}
                      />

                    </div>


                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "18px",
                      }}
                    >

                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={saving}
                        style={primaryButton}
                      >
                        {saving
                          ? "Enregistrement..."
                          : "Enregistrer"
                        }
                      </button>


                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={secondaryButton}
                      >
                        Annuler
                      </button>

                    </div>

                  </div>

                ) : (

                  /* =========================
                     AFFICHAGE CLIENT
                  ========================= */

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >

                    <div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "17px",
                          color: "#111827",
                        }}
                      >
                        {client.name}
                      </h3>


                      <p
                        style={{
                          margin:
                            "6px 0 0",
                          color: "#6b7280",
                        }}
                      >
                        {client.email ||
                          "Aucun email"}
                      </p>

                    </div>


                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(client)
                        }
                        style={secondaryButton}
                      >
                        Modifier
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          removeClient(
                            client.id
                          )
                        }
                        style={{
                          ...secondaryButton,
                          color: "#dc2626",
                        }}
                      >
                        Supprimer
                      </button>

                    </div>

                  </div>

                )}

              </div>

            ))}

        </div>

      </main>

    </ProtectedRoute>

  );

}


// ======================================
// STYLES
// ======================================

const inputStyle = {

  width: "100%",

  boxSizing: "border-box" as const,

  padding: "12px 14px",

  border:
    "1px solid #d1d5db",

  borderRadius: "8px",

  outline: "none",

  fontSize: "15px",

};


const primaryButton = {

  padding: "10px 16px",

  background: "#1e3a8a",

  color: "#fff",

  border: "none",

  borderRadius: "8px",

  cursor: "pointer",

  fontWeight: "600",

};


const secondaryButton = {

  padding: "10px 16px",

  background: "#fff",

  color: "#374151",

  border:
    "1px solid #d1d5db",

  borderRadius: "8px",

  cursor: "pointer",

  fontWeight: "600",

};