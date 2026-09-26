'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Check, LoaderCircle } from 'lucide-react';

const CHANNELS = ['instagram', 'tiktok', 'youtube', 'linkedin', 'website', 'newsletter', 'student_community', 'other'];
const AUDIENCES = ['under_1k', '1k_5k', '5k_10k', '10k_50k', '50k_100k', '100k_plus'];
const FOCUS = ['jobs', 'internships', 'apprenticeships', 'career', 'resumes', 'linkedin', 'students', 'international_mobility', 'education', 'professional_development', 'other'];

const copy = {
  fr: {
    title: 'Candidatez au programme', intro: 'Quelques informations suffisent. La taille de votre audience n’est pas un critère obligatoire.',
    name: 'Nom complet', email: 'E-mail', country: 'Pays', channel: 'Canal principal', profile: 'Lien vers votre profil ou site',
    audience: 'Taille de l’audience', focus: 'Thématiques de contenu', motivation: 'Pourquoi souhaitez-vous rejoindre le programme ?',
    payout: 'Préférence de paiement', terms: 'J’accepte les conditions du programme d’affiliation.', submit: 'Envoyer ma candidature',
    successTitle: 'Candidature reçue', success: 'Merci. Votre demande pour rejoindre le programme d’affiliation Talentiques a bien été enregistrée. Notre équipe va examiner votre profil. Vous recevrez un e-mail après validation.',
    error: 'Impossible d’envoyer la candidature. Vérifiez les informations et réessayez.', select: 'Sélectionner', termsLink: '/affiliation/conditions',
  },
  en: {
    title: 'Apply to the program', intro: 'A few details are enough. Audience size is not a mandatory eligibility requirement.',
    name: 'Full name', email: 'Email', country: 'Country', channel: 'Primary channel', profile: 'Profile or website URL',
    audience: 'Audience size', focus: 'Content focus', motivation: 'Why would you like to join the program?', payout: 'Payout preference',
    terms: 'I accept the Affiliate Program terms.', submit: 'Submit application', successTitle: 'Application received',
    success: 'Thanks for applying to the Talentiques Affiliate Program. Your application is now under review. You’ll receive an email once it has been approved.',
    error: 'We could not submit your application. Check your information and try again.', select: 'Select', termsLink: '/en/affiliate/terms',
  },
};

const labels: Record<string, { fr: string; en: string }> = {
  instagram: { fr: 'Instagram', en: 'Instagram' }, tiktok: { fr: 'TikTok', en: 'TikTok' }, youtube: { fr: 'YouTube', en: 'YouTube' },
  linkedin: { fr: 'LinkedIn', en: 'LinkedIn' }, website: { fr: 'Site web', en: 'Website' }, newsletter: { fr: 'Newsletter', en: 'Newsletter' },
  student_community: { fr: 'Communauté étudiante', en: 'Student community' }, other: { fr: 'Autre', en: 'Other' },
  under_1k: { fr: 'Moins de 1 000', en: 'Under 1,000' }, '1k_5k': { fr: '1 000 – 5 000', en: '1,000 – 5,000' },
  '5k_10k': { fr: '5 000 – 10 000', en: '5,000 – 10,000' }, '10k_50k': { fr: '10 000 – 50 000', en: '10,000 – 50,000' },
  '50k_100k': { fr: '50 000 – 100 000', en: '50,000 – 100,000' }, '100k_plus': { fr: '100 000+', en: '100,000+' },
  jobs: { fr: 'Emploi', en: 'Jobs' }, internships: { fr: 'Stages', en: 'Internships' }, apprenticeships: { fr: 'Alternance', en: 'Apprenticeships' },
  career: { fr: 'Carrière', en: 'Career' }, resumes: { fr: 'CV', en: 'Resumes' }, students: { fr: 'Étudiants', en: 'Students' },
  international_mobility: { fr: 'Mobilité internationale', en: 'International mobility' }, education: { fr: 'Éducation', en: 'Education' },
  professional_development: { fr: 'Développement professionnel', en: 'Professional development' },
};

export default function AffiliateApplicationForm({ locale }: { locale: 'fr' | 'en' }) {
  const t = copy[locale];
  const [focus, setFocus] = useState<string[]>([]);
  const [state, setState] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending'); setError('');
    const data = new FormData(event.currentTarget);
    const body = Object.fromEntries(data.entries());
    const response = await fetch('/api/affiliate/apply', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, content_focus: focus, terms_accepted: data.get('terms_accepted') === 'on', application_language: locale }),
    }).catch(() => null);
    const result = response ? await response.json().catch(() => ({})) : {};
    if (response?.ok) { setState('success'); return; }
    setError(typeof result.error === 'string' ? result.error : t.error); setState('idle');
  }

  if (state === 'success') return (
    <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-8 text-center md:p-12" role="status">
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white"><Check /></span>
      <h3 className="font-heading text-3xl font-bold text-slate-950">{t.successTitle}</h3>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">{t.success}</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10 sm:p-8 lg:p-10">
      <h3 className="font-heading text-3xl font-bold text-slate-950">{t.title}</h3><p className="mt-3 text-slate-600">{t.intro}</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label={t.name}><input className="input" name="full_name" required maxLength={150} autoComplete="name" /></Field>
        <Field label={t.email}><input className="input" name="email" type="email" required maxLength={254} autoComplete="email" /></Field>
        <Field label={t.country}><input className="input" name="country" required maxLength={100} autoComplete="country-name" /></Field>
        <Field label={t.channel}><Select name="primary_channel" values={CHANNELS} locale={locale} placeholder={t.select} /></Field>
        <div className="sm:col-span-2"><Field label={t.profile}><input className="input" name="profile_url" type="url" required maxLength={500} placeholder="https://" /></Field></div>
        <Field label={t.audience}><Select name="audience_size" values={AUDIENCES} locale={locale} placeholder={t.select} /></Field>
        <Field label={t.payout}><select className="input" name="payout_preference" required defaultValue=""><option value="" disabled>{t.select}</option><option value="paypal">PayPal</option><option value="bank_transfer">{locale === 'fr' ? 'Virement bancaire' : 'Bank transfer'}</option><option value="other">{labels.other[locale]}</option></select></Field>
        <fieldset className="sm:col-span-2"><legend className="mb-3 text-sm font-bold text-slate-800">{t.focus}</legend><div className="flex flex-wrap gap-2">{FOCUS.map((item) => <label key={item} className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm font-semibold transition ${focus.includes(item) ? 'border-[#0683C9] bg-sky-50 text-[#0572b0]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}><input className="sr-only" type="checkbox" checked={focus.includes(item)} onChange={() => setFocus((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} />{labels[item][locale]}</label>)}</div></fieldset>
        <div className="sm:col-span-2"><Field label={t.motivation}><textarea className="input" name="motivation" required minLength={10} maxLength={1000} /></Field></div>
      </div>
      <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-slate-600"><input className="mt-1 h-4 w-4" type="checkbox" name="terms_accepted" required /><span>{t.terms} <Link className="font-bold text-[#0683C9] underline" href={t.termsLink}>{locale === 'fr' ? 'Lire les conditions' : 'Read the terms'}</Link></span></label>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}
      <button disabled={state === 'sending' || focus.length === 0} className="mt-7 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#0683C9] px-6 font-bold text-white shadow-lg shadow-sky-600/20 transition hover:bg-[#0572b0] disabled:cursor-not-allowed disabled:opacity-60">{state === 'sending' && <LoaderCircle className="animate-spin" size={19} />}{t.submit}</button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-bold text-slate-800">{label}</span>{children}</label>; }
function Select({ name, values, locale, placeholder }: { name: string; values: string[]; locale: 'fr' | 'en'; placeholder: string }) { return <select className="input" name={name} required defaultValue=""><option value="" disabled>{placeholder}</option>{values.map((value) => <option value={value} key={value}>{labels[value][locale]}</option>)}</select>; }

