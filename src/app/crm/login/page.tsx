"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LockKeyhole, ArrowUpRight } from "lucide-react";
export default function Login() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [invited, setInvited] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1)),
      token = params.get("access_token");
    if (!token) return;
    window.history.replaceState(null, "", "/crm/login");
    fetch("/api/crm/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token }),
    })
      .then(async (r) => {
        const v = await r.json();
        if (!r.ok) throw new Error(v.error);
        setInvited(true);
      })
      .catch((e) => setError(e.message));
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const r = await fetch("/api/crm/auth", {
          method: invited ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
        v = await r.json();
      if (!r.ok) throw new Error(v.error);
      window.location.assign("/crm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="crm-login">
      <div className="crm-login-brand">
        <span className="crm-logomark">T</span>
        <span>
          TALENTIQUES<span className="crm-brand-sub">ESPACE ÉQUIPE</span>
        </span>
      </div>
      <div className="crm-login-card">
        <LockKeyhole size={26} />
        <p className="crm-eyebrow">ACCÈS PRIVÉ</p>
        <h1>
          {invited ? "Bienvenue dans l’équipe." : "Votre espace de travail."}
        </h1>
        <p>
          {invited
            ? "Définissez votre mot de passe pour continuer."
            : "Connectez-vous avec votre compte approuvé."}
        </p>
        <form onSubmit={submit}>
          {!invited && (
            <label>
              Adresse email
              <input
                required
                type="email"
                name="email"
                autoComplete="username"
              />
            </label>
          )}
          <label>
            Mot de passe
            <input
              required
              type="password"
              name="password"
              minLength={invited ? 12 : 1}
              maxLength={128}
              autoComplete={invited ? "new-password" : "current-password"}
            />
          </label>
          {error && (
            <p className="crm-error" role="alert">
              {error}
            </p>
          )}
          <button className="crm-primary" disabled={busy}>
            {busy
              ? "Connexion…"
              : invited
                ? "Définir et continuer"
                : "Se connecter"}
            <ArrowUpRight size={17} />
          </button>
        </form>
        <small>Accès sur invitation · Supabase Auth</small>
      </div>
      <Link href="/">Revenir au site TALENTIQUES</Link>
    </main>
  );
}
