"use client";
import { useState } from "react";
export function CompleteInformation({ token }: { token: string }) {
  const [done, setDone] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = new FormData(event.currentTarget),
        r = await fetch("/api/crm/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, text: data.get("text") }),
        }),
        v = await r.json();
      if (!r.ok) throw new Error(v.error);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-5 py-12">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-xs font-bold tracking-widest text-[#133960]">
          TALENTIQUES
        </p>
        <h1 className="mb-6 mt-6 font-heading text-3xl text-[#133960]">
          {done ? "Informations reçues." : "Compléter votre dossier"}
        </h1>
        {done ? (
          <p className="text-slate-600">
            Notre équipe vérifiera ces informations avant de poursuivre votre
            prestation.
          </p>
        ) : (
          <form onSubmit={submit}>
            <label className="text-sm font-semibold text-slate-700">
              Informations demandées
              <textarea
                className="input mt-3"
                name="text"
                required
                minLength={5}
                maxLength={4000}
                rows={7}
              />
            </label>
            <p className="mt-3 text-xs text-slate-500">
              N’indiquez aucun mot de passe ni information bancaire.
            </p>
            {error && (
              <p role="alert" className="mt-4 text-red-700">
                {error}
              </p>
            )}
            <button
              disabled={busy}
              className="mt-5 rounded-lg bg-[#133960] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Envoi…" : "Transmettre les informations"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
