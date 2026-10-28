"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  ChevronDown,
  CheckCircle2,
  FileText,
  ShieldCheck,
  UploadCloud,
  Search,
  X,
} from "lucide-react";
import { MARKET_OPTIONS, STATUSES } from "@/lib/crm/core";
import { submitIntake } from "@/lib/crm/intake-client";

const inputStyle =
  "block w-full min-h-[50px] rounded-xl border border-[#dbe5ee] bg-white px-4 py-3 text-[15px] text-[#153752] outline-none transition-colors duration-150 placeholder:text-[#94a7b8] hover:border-[#a9cde7] focus:border-[#0783c7] focus:ring-[3px] focus:ring-[#0783c7]/10 disabled:opacity-60";

export function DiagnosticIntake({ children }: { children?: React.ReactNode }) {
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [promise, setPromise] = useState<number | null>(null);
  const [fileName, setFileName] = useState("");
  const confirmationRef = useRef<HTMLDivElement>(null);
  const confirmationTitleId = useId();

  useEffect(() => {
    if (!success) return;
    // Wait for the shorter confirmation and its container to finish rendering.
    const frame = requestAnimationFrame(() => {
      const confirmation = confirmationRef.current;
      if (!confirmation) return;
      confirmation.focus({ preventScroll: true });
      const dialog = confirmation.closest("dialog");
      if (dialog) {
        // Keep the background page still when the intake lives in a dialog.
        dialog.scrollTo({ top: 0, behavior: "instant" });
      } else {
        const card = confirmation.closest("[data-diagnostic-card]") ?? confirmation;
        window.scrollTo({
          top: Math.max(0, window.scrollY + card.getBoundingClientRect().top - 92),
          behavior: "instant",
        });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [success]);

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
      <div ref={confirmationRef} tabIndex={-1} role="region" aria-labelledby={confirmationTitleId} className="text-[#133960] focus:outline-none">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0683C9]">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" aria-hidden="true" />
          Demande enregistrée
        </p>
        <h2 id={confirmationTitleId} className="mt-3 font-heading text-2xl font-semibold leading-tight tracking-tight sm:text-[28px]">
          Votre demande est confirmée.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#51667b] sm:text-[15px]">
          Nous avons bien reçu votre demande et votre CV.
        </p>
        <div className="mt-5 rounded-xl border border-[#dcecf8] border-l-[3px] border-l-[#0dd7ea] bg-[#f2f9ff] p-4">
          <h3 className="text-sm font-semibold">La suite, par e-mail</h3>
          <p className="mt-1.5 text-sm leading-6 text-[#51667b]">
            Notre équipe examinera votre profil et vous transmettra les prochaines étapes par e-mail.
            {promise ? ` Retour prévu sous ${promise} heures ouvrées.` : ""}
          </p>
        </div>
        <p className="mt-4 text-xs leading-5 text-[#64748b]">
          Pensez à consulter vos courriers indésirables.
        </p>
        <Link href="/" className="mt-4 inline-block rounded text-sm font-medium text-[#0683C9] underline underline-offset-4 hover:text-[#133960] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0683C9]">
          Retour à l’accueil
        </Link>
      </div>
    );

  return (
    <>
    {children}
    <form onSubmit={submit} className="space-y-7">
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <section aria-labelledby="diagnostic-contact-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 id="diagnostic-contact-heading" className="text-sm font-semibold text-[#133960]">
            Vos coordonnées
          </h3>
          <span className="text-xs text-[#8395a7]">* Champs obligatoires</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet *">
            <input
              name="fullName"
              required
              minLength={2}
              maxLength={150}
              autoComplete="name"
              className={inputStyle}
              placeholder="Prénom et nom"
            />
          </Field>
          <Field label="Adresse e-mail *">
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              className={inputStyle}
              placeholder="vous@exemple.com"
            />
          </Field>
          <Field label="Téléphone" optional>
            <input
              name="phone"
              type="tel"
              maxLength={50}
              autoComplete="tel"
              className={inputStyle}
              placeholder="+33 6 ..."
            />
          </Field>
          <Field label="Statut actuel *">
            <select
              name="statutActuel"
              required
              defaultValue=""
              className={inputStyle}
            >
              <option value="">Sélectionnez votre situation</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <div className="h-px bg-[#edf1f6]" aria-hidden="true" />

      <section aria-labelledby="diagnostic-project-heading" className="space-y-5">
        <h3 id="diagnostic-project-heading" className="text-sm font-semibold text-[#133960]">
          Votre projet professionnel
        </h3>
        <MarketPicker locale="fr" />
        <Field label="Votre objectif professionnel *">
          <textarea
            name="objectifProfessionnel"
            required
            minLength={5}
            maxLength={1000}
            rows={3}
            className={`${inputStyle} min-h-[116px] resize-y`}
            placeholder="Ex. Décrocher une alternance en marketing en France, ou évoluer vers un poste en finance…"
          />
        </Field>
        <Field label="Profil LinkedIn" optional>
          <input
            type="url"
            name="profilLinkedIn"
            maxLength={300}
            className={inputStyle}
            placeholder="https://www.linkedin.com/in/..."
          />
        </Field>
      </section>

      <div className="h-px bg-[#edf1f6]" aria-hidden="true" />

      <section aria-labelledby="diagnostic-document-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 id="diagnostic-document-heading" className="text-sm font-semibold text-[#133960]">
            Votre CV actuel *
          </h3>
          <span className="text-xs text-[#8395a7]">PDF ou DOCX · 5 Mo max.</span>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-[#c5d9e9] bg-[#f8fbff] transition-colors hover:border-[#0783c7] hover:bg-[#f2f9ff] focus-within:border-[#0783c7] focus-within:ring-[3px] focus-within:ring-[#0783c7]/10">
          <input
            type="file"
            name="cv"
            required
            accept=".pdf,.docx"
            aria-label="Importer votre CV actuel au format PDF ou DOCX"
            onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? "")}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div className="flex min-h-[116px] flex-col items-center justify-center px-4 py-5 text-center sm:min-h-[122px]">
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f3fc] text-[#0783c7]">
              {fileName ? <FileText size={20} aria-hidden="true" /> : <UploadCloud size={20} aria-hidden="true" />}
            </span>
            <span className="max-w-full truncate text-sm font-semibold text-[#133960]">
              {fileName || "Cliquez ou glissez votre CV ici"}
            </span>
            <span className="mt-1 text-xs text-[#7890a5]">
              {fileName ? "Cliquez pour remplacer le fichier" : "Fichier confidentiel · PDF ou DOCX"}
            </span>
          </div>
        </div>
        <p className="flex items-start gap-2 text-xs leading-5 text-[#7890a5]">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#0783c7]" aria-hidden="true" />
          Votre document reste privé et accessible uniquement aux personnes autorisées à traiter votre demande.
        </p>
      </section>

      <div className="space-y-4 border-t border-[#edf1f6] pt-6">
        <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-6 text-[#51667b]">
          <input
            required
            type="checkbox"
            name="privacy"
            value="1"
            className="mt-1.5 h-4 w-4 shrink-0 accent-[#0783c7]"
          />
          <span>
            J’accepte le traitement de mes données et de mon CV pour cette demande, conformément à la{" "}
            <Link
              className="font-medium text-[#087fc2] underline underline-offset-2 hover:text-[#133960]"
              href="/politique-de-confidentialite"
              target="_blank"
              rel="noopener noreferrer"
            >
              politique de confidentialité
            </Link>
            . *
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-6 text-[#51667b]">
          <input
            type="checkbox"
            name="marketing"
            value="1"
            className="mt-1.5 h-4 w-4 shrink-0 accent-[#0783c7]"
          />
          <span>Je souhaite recevoir les conseils et actualités TALENTIQUES (facultatif).</span>
        </label>
      </div>

      {error && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="space-y-3">
        <button
          disabled={busy}
          type="submit"
          className="group flex min-h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-[#087fc2] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_22px_-10px_rgba(8,127,194,.65)] transition-colors hover:bg-[#056ca7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0783c7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Enregistrement en cours…" : "Demander mon diagnostic"}
          {!busy && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />}
        </button>
        <p className="text-center text-xs leading-5 text-[#7890a5]">
          {promise
            ? `Analyse humaine · Retour sous ${promise} heures ouvrées`
            : "Analyse humaine · Recommandations personnalisées"}
        </p>
      </div>
    </form>
    </>
  );
}


/**
 * The same selector can be used by an English intake page with locale="en".
 * Values sent to the CRM are stable French labels for catalogue entries;
 * a custom entry is kept verbatim as requested by the candidate.
 */
export function MarketPicker({ locale = "fr" }: { locale?: "fr" | "en" }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [africaExpanded, setAfricaExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEn = locale === "en";
  const normalize = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const query = normalize(search);
  const visible = MARKET_OPTIONS.filter(
    (option) =>
      !selected.some((item) => normalize(item) === normalize(option.value)) &&
      (!query || normalize(`${option.fr} ${option.en} ${option.keywords}`).includes(query)),
  );
  const primary = visible.filter((option) => option.group === "primary");
  const african = visible.filter((option) => option.group === "africa");
  const regional = visible.filter((option) => option.group === "regional");
  const groupQuery =
    (query.length >= 3 && ["afrique", "africa"].some((term) =>
      normalize(term).startsWith(query) || query.startsWith(normalize(term)),
    )) || ["marches africains", "african markets"].includes(query);
  const showAfrica = !query || groupQuery || african.length > 0;
  const africanResults = groupQuery ? MARKET_OPTIONS.filter((option) =>
    option.group === "africa" && !selected.some((item) => normalize(item) === normalize(option.value)),
  ) : african;
  const cleanCustom = search.trim().replace(/\s+/g, " ");
  const customValid =
    cleanCustom.length >= 2 &&
    cleanCustom.length <= 80 &&
    /\p{L}/u.test(cleanCustom) &&
    !/[<>{}\u0000-\u001f\u007f]/.test(cleanCustom);
  const customIsNew =
    customValid &&
    !selected.some((item) => normalize(item) === normalize(cleanCustom)) &&
    !MARKET_OPTIONS.some((option) =>
      [option.value, option.fr, option.en].some((label) => normalize(label) === query),
    ) &&
    !groupQuery;

  function add(value: string) {
    if (selected.length >= 8 || selected.some((item) => normalize(item) === normalize(value))) return;
    setSelected((current) => [...current, value]);
    setSearch("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleEnter(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    const exact = MARKET_OPTIONS.find((option) =>
      [option.value, option.fr, option.en].some((label) => normalize(label) === query),
    );
    if (exact) add(exact.value);
    else if (groupQuery) setAfricaExpanded(true);
    else if (visible.length) add(visible[0].value);
    else if (customIsNew) add(cleanCustom);
  }

  function label(value: string) {
    const option = MARKET_OPTIONS.find((item) => item.value === value);
    return option ? option[locale] : value;
  }

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-[13px] font-semibold text-[#304d68]">
        {isEn ? "Target job market(s) *" : "Marché(s) professionnel(s) ciblé(s) *"}
      </legend>
      <p className="mb-3 text-xs leading-5 text-[#7890a5]">
        {isEn
          ? "Choose up to 8 markets. You can enter any other country or region."
          : "Choisissez jusqu’à 8 marchés. Vous pouvez aussi saisir librement un pays ou une région."}
      </p>
      {selected.map((market) => (
        <input type="hidden" name="markets" value={market} key={`market-${market}`} />
      ))}
      <div
        className="relative"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        <div className="rounded-xl border border-[#dbe5ee] bg-white p-2 transition-colors focus-within:border-[#0783c7] focus-within:ring-[3px] focus-within:ring-[#0783c7]/10">
          {selected.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-1 pt-1" aria-label={isEn ? "Selected markets" : "Marchés sélectionnés"}>
              {selected.map((market) => (
                <span
                  key={market}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#eaf6ff] px-2.5 py-1.5 text-xs font-medium text-[#076fa9]"
                >
                  <span className="break-words">{label(market)}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5 hover:bg-[#d1eafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#087fc2]"
                    aria-label={isEn ? `Remove ${label(market)}` : `Retirer ${label(market)}`}
                    onClick={() => setSelected((current) => current.filter((item) => item !== market))}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex min-h-10 items-center gap-2 px-2">
            <Search size={17} className="shrink-0 text-[#7890a5]" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              maxLength={80}
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#153752] outline-none placeholder:text-[#94a7b8]"
              placeholder={
                selected.length >= 8
                  ? isEn ? "Maximum 8 markets" : "8 marchés maximum"
                  : isEn ? "Search or enter a market..." : "Rechercher ou saisir un marché..."
              }
              value={search}
              disabled={selected.length >= 8}
              onChange={(event) => { setSearch(event.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleEnter}
              aria-expanded={open && selected.length < 8}
              aria-controls="diagnostic-market-suggestions"
              aria-label={isEn ? "Search target markets" : "Rechercher les marchés ciblés"}
              autoComplete="off"
            />
            <span className="shrink-0 text-[11px] text-[#94a7b8]">{selected.length}/8</span>
          </div>
        </div>
        {open && selected.length < 8 && (
          <div
            id="diagnostic-market-suggestions"
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-y-auto rounded-xl border border-[#dbe5ee] bg-white p-1.5 shadow-[0_14px_30px_-16px_rgba(19,57,96,0.35)]"
          >
            {primary.length > 0 && (
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#8ca0b2]">
                {isEn ? "Main markets" : "Marchés principaux"}
              </p>
            )}
            {primary.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => add(option.value)}
                className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#304d68] hover:bg-[#f0f8fd] focus-visible:bg-[#f0f8fd] focus-visible:outline-none"
              >
                {option[locale]}
                <Plus size={14} className="text-[#087fc2]" aria-hidden="true" />
              </button>
            ))}
            {showAfrica && africanResults.length > 0 && (
              <div className="mt-1 border-t border-[#edf1f6] pt-1">
                <button
                  type="button"
                  aria-expanded={africaExpanded || !!query}
                  aria-controls="diagnostic-africa-markets"
                  onClick={() => setAfricaExpanded((expanded) => !expanded)}
                  className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#304d68] hover:bg-[#f0f8fd] focus-visible:bg-[#f0f8fd] focus-visible:outline-none"
                >
                  {isEn ? "African markets" : "Marchés africains"}
                  <ChevronDown size={15} className={`text-[#087fc2] transition-transform ${(africaExpanded || !!query) ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {(africaExpanded || !!query) && (
                  <div id="diagnostic-africa-markets" className="border-l-2 border-[#e8f3fb] pl-2">
                    {africanResults.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => add(option.value)}
                        className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#304d68] hover:bg-[#f0f8fd] focus-visible:bg-[#f0f8fd] focus-visible:outline-none"
                      >
                        {option[locale]}
                        <Plus size={14} className="text-[#087fc2]" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {regional.length > 0 && (
              <div className="mt-1 border-t border-[#edf1f6] pt-1">
                <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#8ca0b2]">
                  {isEn ? "Other regions" : "Autres régions"}
                </p>
                {regional.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => add(option.value)}
                    className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#304d68] hover:bg-[#f0f8fd] focus-visible:bg-[#f0f8fd] focus-visible:outline-none"
                  >
                    {option[locale]}
                    <Plus size={14} className="text-[#087fc2]" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
            {!query && (
              <p className="border-t border-[#edf1f6] px-3 py-2 text-xs text-[#7890a5]">
                {isEn
                  ? "Other market? Type its name above, then choose Add."
                  : "Autre marché ? Saisissez son nom ci-dessus, puis choisissez Ajouter."}
              </p>
            )}
            {customIsNew && (
              <button
                type="button"
                onClick={() => add(cleanCustom)}
                className="mt-1 flex min-h-10 w-full items-center rounded-lg border-t border-[#edf1f6] px-3 py-2 text-left text-sm font-semibold text-[#087fc2] hover:bg-[#f0f8fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#087fc2]"
              >
                {isEn ? `Add “${cleanCustom}”` : `Ajouter « ${cleanCustom} »`}
              </button>
            )}
            {!primary.length && !africanResults.length && !regional.length && !customIsNew && (
              <p className="px-3 py-3 text-xs text-[#7890a5]">
                {isEn ? "Enter a market name (2–80 characters)." : "Saisissez un marché (2 à 80 caractères)."}
              </p>
            )}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-[#7890a5]" aria-live="polite">
        {selected.length === 0
          ? isEn ? "Select at least one market." : "Sélectionnez au moins un marché."
          : isEn ? `${selected.length} market(s) selected` : `${selected.length} marché(s) sélectionné(s)`}
      </p>
    </fieldset>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[#304d68]">
        {label}
        {optional && <span className="text-xs font-normal text-[#95a5b5]">Facultatif</span>}
      </span>
      {children}
    </label>
  );
}
