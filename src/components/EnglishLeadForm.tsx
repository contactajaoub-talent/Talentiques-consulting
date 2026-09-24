'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

export default function EnglishLeadForm({ kind = 'contact' }: { kind?: 'contact' | 'coaching' | 'career' }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const input = 'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-sky-600';
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'sending') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('typeDemande', kind === 'career' ? 'Recrutement' : 'Accompagnement');
    data.set('offreRessource', 'Accompagnement Total');
    data.set('statutPaiement', 'Non applicable');
    data.set('pageOrigine', window.location.pathname);
    if (kind === 'career') data.set('nomRessource', 'Client Acquisition & Development | Lead Generation');
    const params = new URLSearchParams(window.location.search);
    for (const [query, field] of [['utm_source', 'utmSource'], ['utm_medium', 'utmMedium'], ['utm_campaign', 'utmCampaign']]) {
      const value = params.get(query);
      if (value) data.set(field, value.slice(0, 500));
    }
    setState('sending');
    try {
      const response = await fetch('/api/salesforce-lead', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error('Submission failed');
      setState('sent');
      form.reset();
    } catch { setState('error'); }
  }
  return <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8" data-clarity-mask="true">
    <h2 className="text-2xl font-bold">{kind === 'career' ? 'Apply for this role' : 'Tell us what you want to achieve'}</h2>
    <p className="mt-3 text-sm leading-6 text-slate-600">{kind === 'career' ? 'Share your background and a link to your resume or LinkedIn profile. French fluency is required for this role.' : 'Share your priorities. We will contact you to discuss the support that fits your situation.'}</p>
    <div className="mt-6 grid gap-5 sm:grid-cols-2">{[['firstName', 'First name', 'given-name', 'text'], ['lastName', 'Last name', 'family-name', 'text'], ['email', 'Email', 'email', 'email'], ['phone', 'Phone / WhatsApp (optional)', 'tel', 'tel'], ['country', 'Country (optional)', 'country-name', 'text']].map(([name, label, autoComplete, type]) => <label key={name} className="text-sm font-semibold">{label}<input name={name} type={type} autoComplete={autoComplete} required={['firstName', 'lastName', 'email'].includes(name)} maxLength={200} className={input} /></label>)}<label className="text-sm font-semibold">LinkedIn profile (optional)<input name="profilLinkedIn" type="url" maxLength={500} placeholder="https://www.linkedin.com/in/…" className={input} /></label></div>
    <label className="mt-5 block text-sm font-semibold">{kind === 'career' ? 'Your experience and motivation' : 'Your goals and current challenges'}<textarea name="objectifProfessionnel" required rows={5} minLength={20} maxLength={4000} className={input} /></label>
    <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" name="privacy" required className="mt-1" /> <span>I agree to the <Link href="/en/privacy" className="text-[#0683C9] underline">privacy policy</Link> and to being contacted about my request.</span></label>
    <button disabled={state === 'sending' || state === 'sent'} className="mt-6 rounded-full bg-[#0683C9] px-6 py-3 font-bold text-white disabled:opacity-60">{state === 'sending' ? 'Sending…' : state === 'sent' ? 'Request sent' : kind === 'career' ? 'Send application' : 'Send my request'}</button>
    <p role="status" aria-live="polite" className="mt-4 text-sm">{state === 'sent' ? 'Thank you. Your request has been submitted.' : state === 'error' ? 'We could not submit your request. Please try again or email talentiques@gmail.com.' : ''}</p>
  </form>;
}
