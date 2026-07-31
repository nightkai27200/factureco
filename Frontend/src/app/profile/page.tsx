"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);

  // ==========================================
  // Chargement du profil
  // ==========================================

  useEffect(() => {
    async function loadProfile() {
      try {
        setError("");

        const response = await api.get<User>("/users/me");

        const data = response.data;

        setUser(data);

        setName(data.name || "");
        setEmail(data.email || "");
      } catch (err: any) {
        console.error(
          "Erreur chargement profil :",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Impossible de charger votre profil."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // ==========================================
  // Modifier les informations personnelles
  // ==========================================

  async function handleSaveProfile(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      setSaving(true);

      const response = await api.patch<User>(
        "/users/me",
        {
          name,
          email,
        }
      );

      const updatedUser = response.data;

      setUser(updatedUser);

      setName(updatedUser.name);
      setEmail(updatedUser.email);

      setMessage(
        "Profil mis à jour avec succès."
      );
    } catch (err: any) {
      console.error(
        "Erreur modification profil :",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Impossible de modifier le profil."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // Modifier le mot de passe
  // ==========================================

  async function handleChangePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 6) {
      setError(
        "Le mot de passe doit contenir au moins 6 caractères."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      await api.patch(
        "/users/me/password",
        {
          password,
        }
      );

      setPassword("");
      setConfirmPassword("");

      setMessage(
        "Mot de passe modifié avec succès."
      );
    } catch (err: any) {
      console.error(
        "Erreur changement mot de passe :",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Impossible de modifier le mot de passe."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  // ==========================================
  // Déconnexion
  // ==========================================

  function logout() {
    localStorage.removeItem("token");

    router.push("/login");
  }

  // ==========================================
  // Chargement
  // ==========================================

  if (loading) {
    return (
      <ProtectedRoute>
        <main
          style={{
            minHeight: "100vh",
            background: "#f5f7fb",
            padding: "40px",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            <p>
              Chargement du profil...
            </p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  // ==========================================
  // Page profil
  // ==========================================

  return (
    <ProtectedRoute>
      <main
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {/* ==================================
              HEADER
          ================================== */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
              gap: "20px",
            }}
          >
            <div>
              <h1
                style={{
                  marginBottom: "8px",
                }}
              >
                Mon profil
              </h1>

              <p
                style={{
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Gérez vos informations personnelles
                et votre compte Facturco.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/dashboard")
              }
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                background: "#e5e7eb",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              ← Dashboard
            </button>
          </div>

          {/* ==================================
              MESSAGES
          ================================== */}

          {message && (
            <div
              style={{
                background: "#dcfce7",
                color: "#166534",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {/* ==================================
              INFORMATIONS PERSONNELLES
          ================================== */}

          <section
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              marginBottom: "25px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <h2>
              Informations personnelles
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "25px",
              }}
            >
              Modifiez les informations de votre
              compte.
            </p>

            <form
              onSubmit={handleSaveProfile}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {/* Nom */}

              <label>
                <span
                  style={{
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Nom
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </label>

              {/* Email */}

              <label>
                <span
                  style={{
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Email
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </label>

              {/* Rôle */}

              <label>
                <span
                  style={{
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Rôle
                </span>

                <input
                  value={
                    user?.role || "USER"
                  }
                  disabled
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                    background: "#f3f4f6",
                  }}
                />
              </label>

              {/* Bouton */}

              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: "10px",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  background: saving
                    ? "#94a3b8"
                    : "#1e3a8a",
                  color: "white",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "15px",
                }}
              >
                {saving
                  ? "Enregistrement..."
                  : "Enregistrer les modifications"}
              </button>
            </form>
          </section>

          {/* ==================================
              SÉCURITÉ
          ================================== */}

          <section
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              marginBottom: "25px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <h2>
              Sécurité
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "25px",
              }}
            >
              Modifiez votre mot de passe.
            </p>

            <form
              onSubmit={handleChangePassword}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {/* Nouveau mot de passe */}

              <label>
                <span
                  style={{
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Nouveau mot de passe
                </span>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Nouveau mot de passe"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </label>

              {/* Confirmation */}

              <label>
                <span
                  style={{
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Confirmer le mot de passe
                </span>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirmer le mot de passe"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={passwordLoading}
                style={{
                  marginTop: "10px",
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    passwordLoading
                      ? "#94a3b8"
                      : "#111827",
                  color: "white",
                  cursor:
                    passwordLoading
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "15px",
                }}
              >
                {passwordLoading
                  ? "Modification..."
                  : "Modifier le mot de passe"}
              </button>
            </form>
          </section>

          {/* ==================================
              COMPTE
          ================================== */}

          <section
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <h2>
              Compte
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "6px",
              }}
            >
              ID utilisateur
            </p>

            <p
              style={{
                fontFamily: "monospace",
                marginBottom: "25px",
                wordBreak: "break-all",
              }}
            >
              {user?.id || "—"}
            </p>

            <button
              type="button"
              onClick={logout}
              style={{
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                background: "#dc2626",
                color: "white",
                cursor: "pointer",
              }}
            >
              Déconnexion
            </button>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}