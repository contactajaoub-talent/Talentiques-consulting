'use client';

import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, LoaderCircle, Plus, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { type countryOptions, EXPERIENCE, MAX_CV_SIZE, MOBILITY, OPPORTUNITIES, SITUATIONS, toggleMobility, validateCareerQuote } from '@/lib/services/career-quote';
import { submitCareerQuote, type QuoteAttempt } from '@/lib/services/career-quote-client';
import { quoteButton } from './CareerAccompanimentIntro';
import styles from './CareerAccompaniment.module.css';

const steps = ['Informations personnelles', 'Votre besoin', 'Documents & validation'];
const secondaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-[#0F3452] transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0683C9]';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block min-w-0"><span className="mb-2 block text-sm font-semibold text-[#0F3452]">{label}</span>{children}</label>;
}
function SelectField({ name, label, options }: { name: string; label: string; options: string[] }) {
  return <Field label={label}><select name={name} required className="input" defaultValue=""><option value="">Sélectionner</option>{options.map(option => <option key={option}>{option}</option>)}</select></Field>;
}
const searchable = (text: string) => text.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function AccompanimentLeadForm({ countries, enabled = false }: { countries: ReturnType<typeof countryOptions>; enabled?: boolean }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [roles, setRoles] = useState([{ id: 0, value: '' }]);
  const nextId = useRef(1);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedMobilities, setSelectedMobilities] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submitLock = useRef(false);
  const attempt = useRef<QuoteAttempt | null>(null);

  function fail(message: string) {
    setError(message);
    requestAnimationFrame(() => feedback.current?.focus());
  }
  function changeStep(next: number) {
    setError(''); setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    const form = event.currentTarget;
    const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[data-step="${step}"] input, [data-step="${step}"] select, [data-step="${step}"] textarea`);
    for (const field of fields) if (!field.reportValidity()) return;
    const data = new FormData(form);
    if (step === 1) {
      if (!data.getAll('opportunites').length) return fail('Sélectionnez au moins un type d’opportunité.');
      if (!selectedCountries.length) return fail('Sélectionnez au moins un pays ciblé.');
      if (!data.getAll('mobilite').length) return fail('Sélectionnez au moins une option de mobilité.');
    }
    if (step < 2) return changeStep(step + 1);
    if (!enabled) return fail('L’envoi des demandes de devis est temporairement indisponible.');
    try { validateCareerQuote(data); }
    catch (reason) { return fail(reason instanceof Error ? reason.message : 'Vérifiez les informations du formulaire.'); }
    submitLock.current = true; setLoading(true); setError('');
    data.set('pageOrigine', window.location.pathname);
    const params = new URLSearchParams(window.location.search);
    for (const [field, param] of [['utmSource', 'utm_source'], ['utmMedium', 'utm_medium'], ['utmCampaign', 'utm_campaign'], ['utmContent', 'utm_content'], ['utmTerm', 'utm_term']]) data.set(field, (params.get(param) || '').slice(0, 150));
    try {
      await submitCareerQuote(data, attempt);
      attempt.current = null;
      setSuccess(true); form.reset(); setRoles([{ id: nextId.current++, value: '' }]); setSelectedCountries([]); setSelectedMobilities([]);
      requestAnimationFrame(() => heading.current?.focus());
    } catch (reason) { fail(reason instanceof Error ? reason.message : 'Une erreur est survenue. Veuillez réessayer.'); }
    finally { submitLock.current = false; setLoading(false); }
  }
  const filteredCountries = countries.filter(country => searchable(country.name).includes(searchable(countrySearch)));

  return <motion.section id="demande-accompagnement" aria-labelledby="quote-title" className={styles.formSection} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: reduced ? 0 : .4 }}>
    <div className={`${styles.formContainer} container mx-auto max-w-5xl px-5 md:px-8`}>
      {success ? <div className={styles.successCard} role="status">
        <CheckCircle2 className="mx-auto mb-5 text-[#0683C9]" size={44} aria-hidden="true" />
        <h2 ref={heading} tabIndex={-1} id="quote-title" className="font-heading text-3xl font-bold text-[#0F3452]">Merci pour votre demande !</h2>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">Votre demande d’accompagnement a bien été reçue. Notre équipe étudiera votre profil et vous contactera dans les plus brefs délais sur WhatsApp ou par email afin de vous proposer un devis personnalisé.</p>
      </div> : <>
        <h2 id="quote-title" className="font-heading font-bold tracking-tight text-[#0F3452]">Demander mon devis</h2>
        <p className={styles.formIntro}>Remplissez ce formulaire pour nous permettre d’étudier votre besoin et de vous proposer l’accompagnement le plus adapté.</p>
        {!enabled && <p role="status" className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">Les demandes de devis en ligne sont temporairement indisponibles.</p>}
        <div className={styles.formProgress}>
          <div aria-hidden="true" className={styles.progressTrack}><motion.span className={styles.progressFill} initial={false} animate={{ scaleX: step / 2 }} transition={{ duration: reduced ? 0 : .25 }} /></div>
          <ol aria-label="Étapes du formulaire" className={styles.progressList}>{steps.map((label, i) => <li key={label} aria-current={step === i ? 'step' : undefined} data-completed={step > i} className={styles.progressItem}><span aria-hidden="true" className={styles.progressNumber}>{step > i ? <Check size={16} /> : i + 1}</span><span className="sr-only">Étape {i + 1} : </span><span className={styles.progressLabel}>{label}</span><span className="sr-only sm:hidden">{label}</span></li>)}</ol>
        </div>
        <form ref={formRef} onSubmit={submit} noValidate aria-busy={loading} className={styles.formCard}>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div className={styles.stepHeading}><motion.h3 key={step} ref={heading} tabIndex={-1} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .18 }}>{steps[step]}</motion.h3><span aria-hidden="true" className={styles.stepPosition}>0{step + 1} / 03</span></div>
          <p className="mb-5 text-xs leading-6 text-slate-500 sm:text-sm">Les champs marqués d’un astérisque (*) sont obligatoires.</p>
          <fieldset data-step="0" hidden={step !== 0} disabled={loading} className={styles.formStep}>
            <legend className="sr-only">Informations personnelles</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nom complet *"><input name="fullName" autoComplete="name" required maxLength={120} className="input" /></Field>
              <Field label="Email *"><input name="email" type="email" autoComplete="email" required maxLength={254} className="input" /></Field>
              <Field label="Numéro WhatsApp *"><input name="phone" type="tel" autoComplete="tel" required maxLength={40} pattern="\+?[0-9\s.\(\)\-]{6,40}" placeholder="Ex. +33 6 12 34 56 78" className="input" /></Field>
              <Field label="Pays de résidence *"><input name="country" autoComplete="country-name" required maxLength={100} list="residence-countries" className="input" /><datalist id="residence-countries">{countries.map(c => <option key={c.code} value={c.name} />)}</datalist></Field>
              <Field label="Profil LinkedIn (facultatif)"><input name="profilLinkedIn" type="url" maxLength={300} placeholder="https://linkedin.com/in/…" className="input" /></Field>
              <SelectField name="ancienClient" label="Ancien client Talentiques ? *" options={['Oui', 'Non']} />
            </div>
          </fieldset>
          <fieldset data-step="1" hidden={step !== 1} disabled={loading} className={`${styles.formStep} space-y-6`}>
            <legend className="sr-only">Votre besoin</legend>
            <fieldset><legend className="mb-3 text-sm font-semibold text-[#0F3452]">Type d’opportunité recherchée * — plusieurs choix possibles</legend><div className="flex flex-wrap gap-3">{OPPORTUNITIES.map(option => <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 has-[:checked]:border-[#0683C9] has-[:checked]:bg-sky-50"><input type="checkbox" name="opportunites" value={option} className="h-4 w-4" />{option}</label>)}</div></fieldset>
            <div className="grid gap-5 sm:grid-cols-2"><SelectField name="situation" label="Situation actuelle *" options={SITUATIONS} /><SelectField name="experience" label="Niveau d’expérience *" options={EXPERIENCE} /></div>
            <fieldset><legend className="mb-3 text-sm font-semibold text-[#0F3452]">Postes ou fonctions recherchés * — 10 maximum</legend><div className="space-y-3">{roles.map((role, i) => <div key={role.id} className="flex items-center gap-2"><label className="min-w-0 flex-1"><span className="sr-only">Poste recherché {i + 1}</span><input name="postes" value={role.value} onChange={e => setRoles(current => current.map(r => r.id === role.id ? { ...r, value: e.target.value } : r))} maxLength={100} required className="input" placeholder="Ex. Chef de projet" /></label>{roles.length > 1 && <button type="button" aria-label={`Supprimer le poste ${i + 1}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0683C9]" onClick={() => { setRoles(current => current.filter(r => r.id !== role.id)); requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('[name="postes"]')?.focus()); }}><X size={18} /></button>}</div>)}</div>{roles.length < 10 && <button type="button" className={`${secondaryButton} mt-3`} onClick={() => { setRoles(current => [...current, { id: nextId.current++, value: '' }]); requestAnimationFrame(() => { const inputs = formRef.current?.querySelectorAll<HTMLInputElement>('[name="postes"]'); inputs?.[inputs.length - 1]?.focus(); }); }}><Plus size={16} aria-hidden="true" />Ajouter un poste</button>}</fieldset>
            <Field label="Secteurs ciblés (facultatif)"><input name="secteurActivite" maxLength={200} className="input" placeholder="Ex. Industrie, conseil, finance" /></Field>
            <Field label="Objectif professionnel *"><textarea name="objectifProfessionnel" required maxLength={2000} rows={3} className="input" placeholder="Précisez ce que vous souhaitez atteindre." /></Field>
            <fieldset aria-describedby="mobility-help"><legend className="mb-3 text-sm font-semibold text-[#0F3452]">Mobilité * — plusieurs choix possibles</legend>
              <div className="flex flex-wrap gap-3">{MOBILITY.map(option => <label key={option} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors has-[:checked]:border-[#0683C9] has-[:checked]:bg-sky-50 has-[:checked]:text-[#0369a1]"><input type="checkbox" name="mobilite" value={option} checked={selectedMobilities.includes(option)} onChange={() => setSelectedMobilities(current => toggleMobility(current, option))} className="h-4 w-4" />{option}</label>)}</div>
              <p id="mobility-help" className="mt-3 text-sm text-slate-500">« Selon les opportunités » remplace les autres choix pour une flexibilité totale.</p>
            </fieldset>
            <fieldset><legend className="mb-3 text-sm font-semibold text-[#0F3452]">Pays ciblés * — plusieurs choix possibles (20 maximum)</legend>
              <label className="block"><span className="sr-only">Rechercher un pays</span><input type="search" value={countrySearch} onChange={e => setCountrySearch(e.target.value)} placeholder="Rechercher un pays…" className="input" /></label>
              <p className="my-3 text-sm text-slate-600" role="status">{selectedCountries.length ? `Sélection : ${selectedCountries.map(code => countries.find(c => c.code === code)?.name).join(', ')}` : 'Aucun pays sélectionné'}</p>
              {selectedCountries.map(code => <input key={code} type="hidden" name="paysCibles" value={code} />)}
              <div className="grid max-h-52 grid-cols-1 gap-x-4 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-2">{filteredCountries.map(c => <label key={c.code} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-700"><input type="checkbox" checked={selectedCountries.includes(c.code)} disabled={selectedCountries.length >= 20 && !selectedCountries.includes(c.code)} onChange={e => setSelectedCountries(current => e.target.checked ? [...current, c.code] : current.filter(code => code !== c.code))} className="h-4 w-4" />{c.name}</label>)}{!filteredCountries.length && <p className="py-3 text-sm text-slate-500">Aucun pays trouvé.</p>}</div>
            </fieldset>
          </fieldset>
          <fieldset data-step="2" hidden={step !== 2} disabled={loading} className={`${styles.formStep} space-y-6`}>
            <legend className="sr-only">Documents et validation</legend>
            <Field label="CV actuel * — PDF ou DOCX, 5 Mo maximum"><input name="cv" type="file" required accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="block w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-sky-50 file:px-4 file:py-3 file:font-semibold file:text-[#0369a1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0683C9]" onChange={e => { const file = e.target.files?.[0]; e.target.setCustomValidity(file && file.size > MAX_CV_SIZE ? 'Le CV doit faire 5 Mo maximum.' : ''); }} /></Field>
            <Field label="Commentaires complémentaires (facultatif)"><textarea name="commentaires" maxLength={2000} rows={3} className="input" /></Field>
            <label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input name="privacy" type="checkbox" required className="mt-1 h-4 w-4 shrink-0" /><span>J’accepte que Talentiques utilise mes informations et mon CV pour étudier ma demande et me recontacter, conformément à la <Link className="text-[#0369a1] underline underline-offset-2" href="/politique-de-confidentialite" target="_blank" rel="noopener noreferrer">politique de confidentialité</Link>. *</span></label>
            <p className="text-sm text-slate-500">Devis personnalisé après étude de votre besoin.</p>
          </fieldset>
          {error && <div ref={feedback} tabIndex={-1} role="alert" className={styles.errorNotice}>{error}</div>}
          <div className={styles.formActions}>
            {step > 0 ? <button type="button" disabled={loading} onClick={() => changeStep(step - 1)} className={secondaryButton}><ArrowLeft size={16} aria-hidden="true" />Précédent</button> : <span className="text-sm text-slate-500">Étape 1 sur 3</span>}
            <button type="submit" disabled={loading || (step === 2 && !enabled)} className={`${quoteButton} disabled:cursor-not-allowed disabled:opacity-60`}>{loading ? <><LoaderCircle size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Envoi en cours…</> : <>{step < 2 ? 'Continuer' : 'Demander mon devis'}<ArrowRight size={17} aria-hidden="true" /></>}</button>
          </div>
        </form>
      </>}
    </div>
  </motion.section>;
}
