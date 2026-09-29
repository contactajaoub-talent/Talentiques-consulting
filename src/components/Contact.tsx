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
    event.preventDefault();
    const formElement = event.currentTarget;
    setLoading(true);
    setError('');

    try {
      const data = new FormData(formElement);
      data.set('typeDemande', 'Contact');
      data.set('offreRessource', 'Contact général');
      data.set('statutPaiement', 'Non applicable');
      data.set('pageOrigine', window.location.pathname || '/');

      const params = new URLSearchParams(window.location.search);
      data.set('utmSource', params.get('utm_source') || '');
      data.set('utmMedium', params.get('utm_medium') || '');
      data.set('utmCampaign', params.get('utm_campaign') || '');

      const response = await fetch('/api/salesforce-lead', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || (fr ? 'Impossible d’envoyer votre message.' : 'Unable to send your message.'),
        );
      }

      setSuccess(true);
      formElement.reset();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : fr
            ? 'Une erreur est survenue.'
            : 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-sky-50 blur-[105px]"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl"
          >
            <span className="text-xs font-bold uppercase tracking-[.22em] text-[#0683C9]">
              {copy.badge}
            </span>
            <h2 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-[1.08] tracking-[-.035em] text-[#0F3452] md:text-5xl lg:text-6xl">
              {copy.title}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {copy.description}
            </p>
          </motion.header>

          <div className="mt-12 grid overflow-hidden border-y border-slate-200 lg:grid-cols-[0.82fr_1.18fr]">
            <motion.aside
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative overflow-hidden bg-[#0F3452] px-6 py-9 text-white sm:px-9 lg:px-10 lg:py-11"
            >
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border-[36px] border-white/[0.035]"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-[#0683C9]/20 blur-[90px]"
                aria-hidden="true"
              />

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-sky-200">
                  {fr ? 'CONTACT TALENTIQUES' : 'CONTACT TALENTIQUES'}
                </p>
                <p className="mt-4 max-w-sm font-heading text-2xl font-bold leading-snug">
                  {fr
                    ? 'Un premier échange pour identifier le bon point de départ.'
                    : 'A first conversation to identify the right starting point.'}
                </p>

                <div className="mt-9 divide-y divide-white/10 border-y border-white/10">
                  <a
                    href={`mailto:${content.contact.email}`}
                    className="group flex items-start gap-4 py-5"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-sky-200 transition group-hover:bg-white/12">
                      <Mail size={17} />
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-[.15em] text-slate-400">
                        Email
                      </span>
                      <span className="mt-1 block break-all text-sm font-semibold text-white">
                        {content.contact.email}
                      </span>
                    </span>
                  </a>

                  <div className="flex items-start gap-4 py-5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-sky-200">
                      <Phone size={17} />
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-[.15em] text-slate-400">
                        WhatsApp
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white">
                        {content.contact.phone}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-start gap-4 py-5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/8 text-sky-200">
                      <MapPin size={17} />
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-[.15em] text-slate-400">
                        {fr ? 'Marchés' : 'Markets'}
                      </span>
                      <span className="mt-1 block text-sm font-semibold leading-6 text-white">
                        {content.contact.address}
                      </span>
                    </span>
                  </div>
                </div>

                <Link
                  href="/diagnostic-cv-ats"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-sky-200"
                >
                  {fr ? 'Diagnostic CV ATS gratuit' : 'Free ATS Resume Check'}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.aside>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="bg-white px-0 py-9 sm:px-9 lg:px-12 lg:py-11"
            >
              {success ? (
                <div className="flex min-h-[430px] flex-col items-start justify-center">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-950">
                    {fr ? 'Message envoyé' : 'Message sent'}
                  </h3>
                  <p className="mt-3 max-w-lg leading-7 text-slate-600">
                    {fr
                      ? 'Votre demande a bien été enregistrée. Nous revenons vers vous rapidement.'
                      : 'Your request has been registered. We will get back to you shortly.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-8 flex items-end justify-between gap-6 border-b border-slate-200 pb-5">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-[.16em] text-[#0683C9]">
                        {fr ? 'VOTRE DEMANDE' : 'YOUR REQUEST'}
                      </span>
                      <h3 className="mt-2 font-heading text-2xl font-bold tracking-[-.02em] text-slate-950">
                        {fr ? 'Parlez-nous de votre situation.' : 'Tell us about your situation.'}
                      </h3>
                    </div>
                  </div>

                  <form onSubmit={submit} className="space-y-5">
                    <input
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label={fr ? 'Prénom' : 'First name'}>
                        <input required name="firstName" className="input" />
                      </Field>
                      <Field label={fr ? 'Nom' : 'Last name'}>
                        <input required name="lastName" className="input" />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field label="Email">
                        <input required name="email" type="email" className="input" />
                      </Field>
                      <Field label={fr ? 'Téléphone' : 'Phone'}>
                        <input name="phone" type="tel" className="input" />
                      </Field>
                    </div>

                    <Field label={fr ? 'Votre situation' : 'Your situation'}>
                      <textarea
                        required
                        name="informationsComplementaires"
                        rows={4}
                        className="input resize-none"
                      />
                    </Field>

                    <label className="flex items-start gap-3 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-600">
                      <input
                        required
                        name="privacy"
                        value="1"
                        type="checkbox"
                        className="mt-0.5"
                      />
                      <span>
                        {fr
                          ? 'J’accepte que Talentiques traite mes informations afin de répondre à ma demande. *'
                          : 'I agree that Talentiques may process my information to respond to my request. *'}
                      </span>
                    </label>

                    {error && (
                      <div className="border-l-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <button
                      disabled={loading}
                      className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0683C9] px-7 py-3.5 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#056da8] disabled:opacity-60 sm:w-auto"
                    >
                      {loading ? (
                        fr ? 'Envoi en cours…' : 'Sending…'
                      ) : (
                        <>
                          {fr ? 'Envoyer ma demande' : 'Send my request'}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[.08em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
