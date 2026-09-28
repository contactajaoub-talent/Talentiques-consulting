'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { content } from '@/lib/content';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Contact({ locale = 'fr' }: { locale?: HomeLocale }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const copy = getHomeContent(locale).contact;
  const fr = locale === 'fr';

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget;
    setLoading(true); setError('');
    try {
      const data = new FormData(formElement);
      data.set('typeDemande', 'Contact'); data.set('offreRessource', 'Contact général'); data.set('statutPaiement', 'Non applicable');
      data.set('pageOrigine', window.location.pathname || '/');
      const params = new URLSearchParams(window.location.search);
      data.set('utmSource', params.get('utm_source') || ''); data.set('utmMedium', params.get('utm_medium') || ''); data.set('utmCampaign', params.get('utm_campaign') || '');
      const response = await fetch('/api/salesforce-lead', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || (fr ? 'Impossible d’envoyer votre message.' : 'Unable to send your message.'));
      setSuccess(true); formElement.reset();
    } catch (reason) { setError(reason instanceof Error ? reason.message : (fr ? 'Une erreur est survenue.' : 'Something went wrong.')); }
    finally { setLoading(false); }
  }

  return <section id="contact" className="relative overflow-hidden bg-white py-24 lg:py-32">
    <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-72 max-w-5xl rounded-full bg-sky-50 blur-[100px]"/>
    <div className="container relative z-10 mx-auto px-5 md:px-8"><div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
      <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .6 }}>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-sm font-medium text-[#0683C9]">{copy.badge}</div>
        <h2 className="mb-6 font-heading text-4xl font-bold leading-tight text-slate-900 md:text-5xl">{copy.title}</h2><p className="mb-10 max-w-lg text-lg leading-relaxed text-slate-600">{copy.description}</p>
        <div className="divide-y divide-slate-200 border-y border-slate-200"><a href={`mailto:${content.contact.email}`} className="group flex items-center gap-4 py-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-[#0683C9]"><Mail size={19}/></span><span><span className="block text-xs font-medium uppercase tracking-wider text-slate-400">Email</span><span className="mt-1 block font-semibold text-slate-900">{content.contact.email}</span></span></a><div className="flex items-center gap-4 py-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-[#0683C9]"><Phone size={19}/></span><span><span className="block text-xs font-medium uppercase tracking-wider text-slate-400">WhatsApp</span><span className="mt-1 block font-semibold text-slate-900">{content.contact.phone}</span></span></div><div className="flex items-center gap-4 py-5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-[#0683C9]"><MapPin size={19}/></span><span><span className="block text-xs font-medium uppercase tracking-wider text-slate-400">{fr ? 'Marchés' : 'Markets'}</span><span className="mt-1 block font-semibold leading-6 text-slate-900">{content.contact.address}</span></span></div></div>
        <Link href="/diagnostic-cv-ats" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0683C9] underline decoration-sky-200 underline-offset-4">{fr ? 'Diagnostic CV ATS gratuit' : 'Free ATS Resume Check'}<ArrowRight size={16}/></Link>
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .6 }} className="relative"><div className="absolute inset-0 -z-10 translate-y-5 rounded-[2rem] bg-sky-100/70 blur-2xl"/><div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_28px_70px_-45px_rgba(15,52,82,.45)] sm:p-9">{success ? <div className="py-12 text-center"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600"><CheckCircle2 size={32}/></div><h3 className="text-2xl font-bold text-slate-900">{fr ? 'Message envoyé' : 'Message sent'}</h3><p className="mt-2 text-slate-600">{fr ? 'Votre demande a bien été enregistrée. Nous revenons vers vous rapidement.' : 'Your request has been registered. We will get back to you shortly.'}</p></div> : <form onSubmit={submit} className="relative z-10 space-y-5"><input name="website" tabIndex={-1} autoComplete="off" className="hidden"/><div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><Field label={fr ? 'Prénom' : 'First name'}><input required name="firstName" className="input"/></Field><Field label={fr ? 'Nom' : 'Last name'}><input required name="lastName" className="input"/></Field></div><Field label="Email"><input required name="email" type="email" className="input"/></Field><Field label={fr ? 'Téléphone' : 'Phone'}><input name="phone" type="tel" className="input"/></Field><Field label={fr ? 'Message' : 'Message'}><textarea required name="informationsComplementaires" rows={4} className="input resize-none"/></Field><label className="flex items-start gap-3 text-xs text-slate-600"><input required name="privacy" value="1" type="checkbox" className="mt-0.5"/><span>{fr ? 'J’accepte que Talentiques traite mes informations afin de répondre à ma demande. *' : 'I agree that Talentiques may process my information to respond to my request. *'}</span></label>{error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}<button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#0683C9] py-4 font-bold text-white transition-all hover:bg-[#056da8] hover:shadow-lg disabled:opacity-60">{loading ? (fr ? 'Envoi en cours…' : 'Sending…') : <>{fr ? 'Envoyer ma demande' : 'Send my request'}<ArrowRight size={18}/></>}</button></form>}</div></motion.div>
    </div></div>
  </section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="ml-1 text-sm font-medium text-slate-600">{label}</span>{children}</label>;
}
