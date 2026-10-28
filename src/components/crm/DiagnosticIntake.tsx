"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { MARKETS, STATUSES } from "@/lib/crm/core";
import { submitIntake } from "@/lib/crm/intake-client";
export function DiagnosticIntake() {
  const [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(false),
    [error, setError] = useState(""),
    [promise, setPromise] = useState<number | null>(null);
  useEffect(() => {
    fetch("/api/crm/intake")
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => {
        if (v) setPromise(v.promise);
      })
      .catch(() => {});
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await submitIntake(new FormData(e.currentTarget));
      setPromise(result.promise);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <div className="py-10 text-center" role="status">
        <CheckCircle2 size={44} className="mx-auto mb-6 text-emerald-600" />
        <h2 className="font-heading text-3xl font-semibold text-[#133960]">
          Votre demande a bien été reçue !
        </h2>
        <p className="mt-5 leading-7 text-slate-600">
          Notre équipe va examiner votre CV, analyser sa compatibilité ATS et
          évaluer son adéquation avec votre objectif professionnel.
        </p>
        <p className="mt-3 leading-7 text-slate-600">
          Vous recevrez par email un rapport détaillé accompagné de
          recommandations personnalisées
          {promise
            ? ` sous ${promise} heures ouvrées.`
            : ". Notre équipe vous précisera le délai de traitement."}
        </p>
        <p className="mt-5 text-sm text-slate-500">
          Pensez à vérifier vos courriers indésirables.
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-5">
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom complet *">
          <input
            name="fullName"
            required
            minLength={2}
            maxLength={150}
            autoComplete="name"
            className="input"
          />
        </Field>
        <Field label="Adresse email *">
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="input"
          />
        </Field>
        <Field label="Téléphone">
          <input
            name="phone"
            type="tel"
            maxLength={50}
            autoComplete="tel"
            className="input"
          />
        </Field>
        <Field label="Statut actuel *">
          <select
            name="statutActuel"
            required
            defaultValue=""
            className="input"
          >
            <option value="">Sélectionner</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>
      <fieldset className="rounded-xl border border-slate-200 p-4">
        <legend className="px-2 text-sm font-semibold text-slate-700">
          Marché(s) ciblé(s) *
        </legend>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          {MARKETS.map((m) => (
            <label key={m} className="flex items-center gap-2">
              <input type="checkbox" name="markets" value={m} />
              {m}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Objectif professionnel *">
        <textarea
          name="objectifProfessionnel"
          required
          minLength={5}
          maxLength={1000}
          rows={3}
          className="input"
          placeholder="Poste visé, secteur et type d’opportunité"
        />
      </Field>
      <Field label="Profil LinkedIn">
        <input
          type="url"
          name="profilLinkedIn"
          maxLength={300}
          className="input"
          placeholder="https://www.linkedin.com/in/..."
        />
      </Field>
      <Field label="CV actuel * · PDF ou DOCX · 5 Mo maximum">
        <input
          type="file"
          name="cv"
          required
          accept=".pdf,.docx"
          className="block w-full rounded-xl border border-dashed border-slate-300 p-4 text-sm"
        />
      </Field>
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck size={15} />
        Votre CV est conservé dans un espace privé et examiné par notre équipe.
      </p>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          required
          type="checkbox"
          name="privacy"
          value="1"
          className="mt-1"
        />
        <span>
          J’accepte le traitement de mes informations et de mon CV pour cette
          demande, selon la{" "}
          <Link
            className="underline"
            href="/politique-de-confidentialite"
            target="_blank"
          >
            politique de confidentialité
          </Link>
          . *
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input type="checkbox" name="marketing" value="1" className="mt-1" />
        <span>
          Je souhaite recevoir des conseils et actualités TALENTIQUES
          (facultatif).
        </span>
      </label>
      {error && (
        <p
          className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      <button
        disabled={busy}
        className="w-full rounded-xl bg-[#133960] px-6 py-4 font-semibold text-white hover:bg-[#1c4d7e] disabled:opacity-50"
      >
        {busy ? "Enregistrement sécurisé…" : "Demander mon diagnostic"}
      </button>
      {promise && (
        <p className="text-center text-xs text-slate-500">
          Rapport sous {promise} heures ouvrées, selon les horaires de notre
          équipe.
        </p>
      )}
    </form>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
