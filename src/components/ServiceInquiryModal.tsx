'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  FileText,
  LoaderCircle,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { STATUS_OPTIONS } from '@/lib/salesforce';
import {
  getServiceOffer,
  type ServiceId,
  type ServiceMarket,
} from '@/lib/services/catalog';
import type { HomeLocale } from '@/lib/home-content';

export type ServiceInquiryOffer = {
  title: string;
  audience?: string;
  market: HomeLocale;
};

type Props = {
  offer: ServiceInquiryOffer | null;
  onClose: () => void;
};

type Customer = {
  name: string;
  email: string;
  phone: string;
  country: string;
};

function addTracking(data: FormData) {
  const params = new URLSearchParams(window.location.search);
  data.set('pageOrigine', window.location.pathname || '/');
  data.set('utmSource', params.get('utm_source') || '');
  data.set('utmMedium', params.get('utm_medium') || '');
  data.set('utmCampaign', params.get('utm_campaign') || '');
}

function resolveServiceId(offer: ServiceInquiryOffer): ServiceId {
  const market: ServiceMarket = offer.market;
  const professional = getServiceOffer('professional-profile', market);

  return offer.title === professional.name
    ? 'professional-profile'
    : 'student-jobseeker';
}

export function ServiceInquiryModal({ offer, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const rendered = useRef(false);
  const customerRef = useRef<Customer | null>(null);

  const [stage, setStage] = useState<'form' | 'payment' | 'confirmed'>('form');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFr = offer?.market !== 'en';
  const market: ServiceMarket = offer?.market === 'en' ? 'en' : 'fr';
  const serviceId = offer ? resolveServiceId(offer) : null;
  const service = serviceId ? getServiceOffer(serviceId, market) : null;
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  const difficulties = isFr
    ? [
        'Je postule sans réponses',
        'Je débute et je suis perdu',
        'CV / LinkedIn peu valorisant',
        'Reconversion en cours',
        'Optimisation de positionnement',
        'Autre raison',
      ]
    : [
        'I apply without getting responses',
        'I am starting and need direction',
        'My resume / LinkedIn undersells me',
        'I am changing careers',
        'I need stronger positioning',
        'Other',
      ];

  useEffect(() => {
    if (!offer) return;

    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [offer, onClose]);

  useEffect(() => {
    setStage('form');
    setFileName('');
    setLoading(false);
    setError('');
    rendered.current = false;
    customerRef.current = null;
  }, [offer]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!offer || !service) return;

    setLoading(true);
    setError('');

    try {
      const data = new FormData(event.currentTarget);

      const fullName = String(data.get('fullName') || '').trim();
      const cv = data.get('cv');

      if (!fullName) {
        throw new Error(isFr ? 'Le nom complet est obligatoire.' : 'Full name is required.');
      }

      if (!(cv instanceof File) || cv.size === 0) {
        throw new Error(isFr ? 'Veuillez ajouter votre CV.' : 'Please upload your resume.');
      }

      const parts = fullName.split(/\s+/).filter(Boolean);
      const firstName = parts[0] || fullName;
      const lastName = parts.slice(1).join(' ') || firstName;

      data.set('firstName', firstName);
      data.set('lastName', lastName);
      data.delete('fullName');

      data.set('typeDemande', 'Optimisation');
      data.delete('offreRessource');
      data.set('nomRessource', service.name);
      data.set('montantPrevu', service.amount);
      data.set('statutPaiement', 'Paiement en attente');

      addTracking(data);

      const response = await fetch('/api/salesforce-lead', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            (isFr
              ? 'Impossible d’envoyer votre demande.'
              : 'Unable to submit your request.'),
        );
      }

      customerRef.current = {
        name: fullName,
        email: String(data.get('email') || ''),
        phone: String(data.get('phone') || ''),
        country: String(data.get('country') || ''),
      };

      setStage('payment');
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : isFr
            ? 'Une erreur est survenue.'
            : 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function renderPayPal() {
    if (!window.paypal || rendered.current || !service || stage !== 'payment') return;

    rendered.current = true;

    try {
      await window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            shape: 'pill',
            label: 'paypal',
            height: 48,
          },

          createOrder: async () => {
            setLoading(true);
            setError('');

            const response = await fetch('/api/services/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                serviceId: service.id,
                market: service.market,
                customer: customerRef.current,
              }),
            });

            const result = await response.json();

            if (!response.ok || !result.id) {
              throw new Error(
                result.error ||
                  (isFr
                    ? 'Le paiement ne peut pas être démarré.'
                    : 'Payment could not be started.'),
              );
            }

            setLoading(false);
            return result.id;
          },

          onApprove: async ({ orderID }) => {
            if (!orderID) {
              throw new Error(isFr ? 'Référence PayPal manquante.' : 'Missing PayPal reference.');
            }

            setLoading(true);
            setError('');

            const response = await fetch('/api/services/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: orderID }),
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
              throw new Error(
                result.error ||
                  (isFr
                    ? 'Le paiement n’a pas pu être confirmé.'
                    : 'Payment could not be confirmed.'),
              );
            }

            setLoading(false);
            setStage('confirmed');
          },

          onCancel: () => {
            setLoading(false);
            setError(
              isFr
                ? 'Le paiement a été annulé. Votre demande reste enregistrée.'
                : 'Payment was cancelled. Your request remains registered.',
            );
          },

          onError: (reason) => {
            console.error('Service PayPal error', reason);
            setLoading(false);
            setError(
              isFr
                ? 'Le paiement n’a pas pu être finalisé. Vous pouvez réessayer.'
                : 'Payment could not be completed. Please try again.',
            );
          },
        })
        .render('#talentiques-service-paypal');
    } catch (reason) {
      console.error('Service PayPal render error', reason);
      rendered.current = false;
      setLoading(false);
      setError(
        reason instanceof Error
          ? reason.message
          : isFr
            ? 'Le module PayPal est momentanément indisponible.'
            : 'PayPal checkout is temporarily unavailable.',
      );
    }
  }

  if (!offer || !service) return null;

  const stepIndex = stage === 'form' ? 1 : stage === 'payment' ? 2 : 3;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-inquiry-title"
      >
        <motion.button
          aria-label={isFr ? 'Fermer' : 'Close'}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-[4px]"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12 }}
          className="relative z-10 w-full max-w-[820px] overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_32px_100px_rgba(15,23,42,.32)]"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label={isFr ? 'Fermer' : 'Close'}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900 sm:right-5 sm:top-5"
          >
            <X size={20} />
          </button>

          <div className="max-h-[91vh] overflow-y-auto">
            <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-orange-50/50 px-5 py-6 sm:px-9 md:px-11">
              <div className="pr-12">
                <span className="inline-flex rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[.08em] text-[#0683C9]">
                  {service.name} · {service.displayPrice}
                </span>

                <h2
                  id="service-inquiry-title"
                  className="mt-4 font-heading text-3xl font-bold tracking-tight text-[#0F3452]"
                >
                  {stage === 'form'
                    ? isFr
                      ? 'Finalisez votre demande'
                      : 'Complete your request'
                    : stage === 'payment'
                      ? isFr
                        ? 'Finalisez votre paiement'
                        : 'Complete your payment'
                      : isFr
                        ? 'Merci pour votre confiance.'
                        : 'Thank you for your trust.'}
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-[11px] font-bold uppercase tracking-[.08em]">
                {[
                  isFr ? 'Demande' : 'Request',
                  isFr ? 'Paiement' : 'Payment',
                  isFr ? 'Confirmation' : 'Confirmation',
                ].map((label, index) => {
                  const active = index + 1 <= stepIndex;

                  return (
                    <div key={label}>
                      <div
                        className={`h-1.5 rounded-full ${
                          active ? 'bg-[#0683C9]' : 'bg-slate-200'
                        }`}
                      />
                      <span className={`mt-2 block ${active ? 'text-[#0683C9]' : 'text-slate-400'}`}>
                        0{index + 1} · {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-7 sm:px-9 sm:py-8 md:px-11">
              {stage === 'form' && (
                <form onSubmit={submit} className="space-y-5">
                  <input
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                  />

                  <Field label={isFr ? 'Nom complet *' : 'Full name *'}>
                    <input required name="fullName" className="input" autoComplete="name" />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="E-mail *">
                      <input
                        required
                        type="email"
                        name="email"
                        className="input"
                        autoComplete="email"
                      />
                    </Field>

                    <Field label={isFr ? 'Téléphone *' : 'Phone *'}>
                      <input
                        required
                        type="tel"
                        name="phone"
                        className="input"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={isFr ? 'Pays *' : 'Country *'}><input required name="country" type="text" autoComplete="country-name" maxLength={100} placeholder={isFr ? 'Ex. Maroc' : 'e.g. Morocco'} className="input" /></Field>

                    <Field label={isFr ? 'Statut actuel *' : 'Current status *'}>
                      <select required name="statutActuel" className="input" defaultValue="">
                        <option value="" disabled>
                          {isFr ? 'Sélectionnez votre statut' : 'Select your status'}
                        </option>
                        {STATUS_OPTIONS.map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label={isFr ? 'Objectif professionnel *' : 'Professional goal *'}>
                    <textarea
                      required
                      name="objectifProfessionnel"
                      rows={3}
                      className="input resize-none"
                    />
                  </Field>

                  <Field label={isFr ? 'Difficulté principale *' : 'Main challenge *'}>
                    <select
                      required
                      name="difficultePrincipale"
                      className="input"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {isFr
                          ? 'Sélectionnez votre difficulté principale'
                          : 'Select your main challenge'}
                      </option>
                      {difficulties.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="LinkedIn">
                    <input
                      type="url"
                      name="profilLinkedIn"
                      className="input"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </Field>

                  <Field label={isFr ? 'Votre CV (PDF ou Word) *' : 'Your resume (PDF or Word) *'}>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full rounded-[14px] border border-dashed border-sky-200 bg-[#F3F7FD] p-5 text-left transition hover:border-[#0683C9]"
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        name="cv"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={(event) => setFileName(event.target.files?.[0]?.name || '')}
                      />

                      <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                        {fileName ? <FileText size={20} /> : <Upload size={20} />}
                        {fileName ||
                          (isFr
                            ? 'Sélectionner un fichier · 4 Mo max.'
                            : 'Choose a file · 4 MB max.')}
                      </span>
                    </button>
                  </Field>

                  <Field label={isFr ? 'Informations complémentaires' : 'Additional information'}>
                    <textarea
                      name="informationsComplementaires"
                      rows={3}
                      className="input resize-none"
                    />
                  </Field>

                  <label className="flex items-start gap-3 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">
                    <input
                      required
                      name="privacy"
                      value="1"
                      type="checkbox"
                      className="mt-1"
                    />
                    <span>
                      {isFr
                        ? 'J’accepte le traitement de mes informations conformément à la politique de confidentialité. *'
                        : 'I agree to the processing of my information under the privacy policy. *'}
                    </span>
                  </label>

                  {error && (
                    <p
                      role="alert"
                      className="border-l-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </p>
                  )}

                  <button
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-full bg-[#0683C9] px-6 py-4 font-bold text-white transition hover:bg-[#056da8] disabled:opacity-60"
                  >
                    {loading
                      ? isFr
                        ? 'Enregistrement…'
                        : 'Saving…'
                      : isFr
                        ? `Continuer vers le paiement — ${service.displayPrice}`
                        : `Continue to payment — ${service.displayPrice}`}
                  </button>
                </form>
              )}

              {stage === 'payment' && (
                <div>
                  <p className="max-w-2xl leading-7 text-slate-600">
                    {isFr
                      ? 'Vos informations ont bien été transmises à Talentiques. Finalisez maintenant le paiement sécurisé pour confirmer votre accompagnement.'
                      : 'Your information has been sent to Talentiques. Complete secure payment now to confirm your support.'}
                  </p>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                    <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                          {isFr ? 'À régler' : 'Amount due'}
                        </p>
                        <p className="mt-1 font-heading text-3xl font-bold text-[#0F3452]">
                          {service.displayPrice}
                        </p>
                      </div>

                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <ShieldCheck size={17} className="text-[#0683C9]" />
                        {isFr ? 'Paiement sécurisé via PayPal' : 'Secure payment via PayPal'}
                      </p>
                    </div>

                    {clientId ? (
                      <>
                        <div id="talentiques-service-paypal" />
                        <Script
                          src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
                            clientId,
                          )}&currency=${service.currency}&intent=capture&components=buttons`}
                          strategy="afterInteractive"
                          onLoad={renderPayPal}
                          onError={() =>
                            setError(
                              isFr
                                ? 'Impossible de charger PayPal.'
                                : 'Unable to load PayPal.',
                            )
                          }
                        />
                      </>
                    ) : (
                      <p className="text-sm text-amber-700">
                        {isFr
                          ? 'PayPal n’est pas configuré dans cet environnement.'
                          : 'PayPal is not configured in this environment.'}
                      </p>
                    )}
                  </div>

                  {loading && (
                    <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                      <LoaderCircle className="animate-spin" size={17} />
                      {isFr ? 'Confirmation en cours…' : 'Confirming…'}
                    </p>
                  )}

                  {error && (
                    <p
                      role="alert"
                      className="mt-4 border-l-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                      {error}
                    </p>
                  )}
                </div>
              )}

              {stage === 'confirmed' && (
                <div className="py-8 text-center sm:py-12">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={34} />
                  </div>

                  <h3 className="mt-5 font-heading text-3xl font-bold tracking-tight text-[#0F3452]">
                    {isFr ? 'Merci pour votre confiance.' : 'Thank you for your trust.'}
                  </h3>

                  <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
                    {isFr
                      ? 'Votre paiement est confirmé. Votre demande et vos informations ont bien été reçues. L’équipe Talentiques vous contactera prochainement pour démarrer votre accompagnement.'
                      : 'Your payment is confirmed. Your request and information have been received. The Talentiques team will contact you shortly to begin your support.'}
                  </p>

                  <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-emerald-700">
                      {isFr ? 'Paiement confirmé' : 'Payment confirmed'}
                    </p>
                    <p className="mt-1 font-heading text-2xl font-bold text-[#0F3452]">
                      {service.displayPrice}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-7 rounded-full bg-[#0683C9] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#056da8]"
                  >
                    {isFr ? 'Fermer' : 'Close'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-[14px] font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
