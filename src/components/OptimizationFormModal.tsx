'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, FileText, LoaderCircle, ShieldCheck, Upload, X } from 'lucide-react';
import { COUNTRY_OPTIONS, STATUS_OPTIONS } from '@/lib/salesforce';
import type { ServiceId, ServiceMarket } from '@/lib/services/catalog';
import { getServiceOffer } from '@/lib/services/catalog';

export type OptimizationOffer = { id: ServiceId; market: ServiceMarket };
type Props = { offer: OptimizationOffer | null; onClose: () => void };
type Customer = { name: string; email: string; phone: string; country: string };

const difficulties = ['Je postule sans réponses', 'Je débute et je suis perdu', 'CV / LinkedIn peu valorisant', 'Reconversion en cours', 'Optimisation de positionnement', 'Autre raison'];

function addTracking(data: FormData) {
  const params = new URLSearchParams(window.location.search);
  data.set('pageOrigine', window.location.pathname || '/');
  data.set('utmSource', params.get('utm_source') || '');
  data.set('utmMedium', params.get('utm_medium') || '');
  data.set('utmCampaign', params.get('utm_campaign') || '');
}

export function OptimizationFormModal({ offer, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const rendered = useRef(false);
  const customerRef = useRef<Customer | null>(null);
  const [stage, setStage] = useState<'form' | 'payment' | 'confirmed'>('form');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isFr = offer?.market !== 'en';
  const service = offer ? getServiceOffer(offer.id, offer.market) : null;
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  useEffect(() => {
    if (!offer) return;
    document.body.style.overflow = 'hidden';
    const key = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', key); };
  }, [offer, onClose]);

  useEffect(() => {
    setStage('form'); setError(''); setFileName(''); rendered.current = false; customerRef.current = null;
  }, [offer]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!service) return;
    setLoading(true); setError('');
    try {
      const data = new FormData(event.currentTarget);
      data.set('typeDemande', 'Optimisation');
      data.set('offreRessource', service.name);
      data.set('montantPrevu', service.amount);
      data.set('statutPaiement', 'Paiement en attente');
      addTracking(data);
      const response = await fetch('/api/salesforce-lead', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || (isFr ? 'Impossible d’envoyer le formulaire.' : 'Unable to submit your request.'));
      customerRef.current = {
        name: `${data.get('firstName')} ${data.get('lastName')}`.trim(),
        email: String(data.get('email') || ''), phone: String(data.get('phone') || ''), country: String(data.get('country') || ''),
      };
      setStage('payment');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : (isFr ? 'Une erreur est survenue.' : 'Something went wrong.'));
    } finally { setLoading(false); }
  }

  async function renderPayPal() {
    if (!window.paypal || rendered.current || !service || stage !== 'payment') return;
    rendered.current = true;
    try {
      await window.paypal.Buttons({
        style: { layout: 'vertical', shape: 'pill', label: 'paypal', height: 48 },
        createOrder: async () => {
          setLoading(true); setError('');
          const response = await fetch('/api/services/paypal/create-order', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceId: service.id, market: service.market, customer: customerRef.current }),
          });
          const result = await response.json();
          if (!response.ok || !result.id) throw new Error(result.error || 'Payment unavailable');
          setLoading(false); return result.id;
        },
        onApprove: async ({ orderID }) => {
          if (!orderID) throw new Error('Missing PayPal reference');
          setLoading(true);
          const response = await fetch('/api/services/paypal/capture-order', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: orderID }),
          });
          const result = await response.json();
          if (!response.ok || !result.ok) throw new Error(result.error || 'Payment confirmation failed');
          setLoading(false); setStage('confirmed');
        },
        onCancel: () => setLoading(false),
        onError: (reason) => { console.error('Service PayPal error', reason); setLoading(false); setError(isFr ? 'Le paiement n’a pas pu être finalisé. Vous pouvez réessayer.' : 'Payment could not be completed. Please try again.'); },
      }).render('#talentiques-service-paypal');
    } catch (reason) {
      console.error('Service PayPal render error', reason);
      setError(isFr ? 'Le module PayPal est momentanément indisponible.' : 'PayPal checkout is temporarily unavailable.');
    }
  }

  return <AnimatePresence>{offer && service && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
      <motion.button aria-label={isFr ? 'Fermer' : 'Close'} className="fixed inset-0 bg-[#020b1f]/80 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div initial={{ opacity: 0, y: 22, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15 }} className="relative z-10 w-full max-w-[760px] overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-2xl">
        <button onClick={onClose} aria-label={isFr ? 'Fermer' : 'Close'} className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-950"><X size={20}/></button>
        <div className="max-h-[90vh] overflow-y-auto px-5 py-7 sm:px-10 sm:py-10">
          <div className="pr-12"><span className="inline-flex rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-700">{service.name} · {service.displayPrice}</span>
            <h2 id="service-modal-title" className="mt-5 font-heading text-3xl font-bold text-[#020b1f]">{stage === 'form' ? (isFr ? 'Finalisez votre demande' : 'Complete your request') : stage === 'payment' ? (isFr ? 'Votre demande est enregistrée' : 'Your request is registered') : (isFr ? 'Paiement confirmé.' : 'Payment confirmed.')}</h2>
          </div>
          {stage === 'form' && <form onSubmit={submit} className="mt-8 space-y-5">
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
            <div className="grid gap-4 sm:grid-cols-2"><Field label={isFr ? 'Prénom *' : 'First name *'}><input required name="firstName" className="input" autoComplete="given-name" /></Field><Field label={isFr ? 'Nom *' : 'Last name *'}><input required name="lastName" className="input" autoComplete="family-name" /></Field></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="E-mail *"><input required type="email" name="email" className="input" autoComplete="email" /></Field><Field label={isFr ? 'Téléphone *' : 'Phone *'}><input required type="tel" name="phone" className="input" autoComplete="tel" /></Field></div>
            <Field label={isFr ? 'Pays de résidence *' : 'Country of residence *'}><select required name="country" className="input" defaultValue=""><option value="" disabled>{isFr ? 'Sélectionnez votre pays' : 'Select your country'}</option>{COUNTRY_OPTIONS.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></Field>
            <Field label={isFr ? 'Statut actuel *' : 'Current status *'}><select required name="statutActuel" className="input" defaultValue=""><option value="" disabled>{isFr ? 'Sélectionnez votre statut' : 'Select your status'}</option>{STATUS_OPTIONS.map(v => <option key={v}>{v}</option>)}</select></Field>
            <Field label={isFr ? 'Objectif professionnel *' : 'Professional goal *'}><textarea required name="objectifProfessionnel" rows={3} className="input" /></Field>
            <Field label={isFr ? 'Difficulté principale' : 'Main challenge'}><select name="difficultePrincipale" className="input" defaultValue=""><option value="">—</option>{difficulties.map(v => <option key={v}>{v}</option>)}</select></Field>
            <Field label="LinkedIn"><input type="url" name="profilLinkedIn" className="input" placeholder="https://linkedin.com/in/..." /></Field>
            <Field label={isFr ? 'Votre CV (PDF ou Word) *' : 'Your resume (PDF or Word) *'}><button type="button" onClick={() => fileRef.current?.click()} className="w-full rounded-[14px] border border-dashed border-sky-200 bg-sky-50/60 p-5 text-left"><input ref={fileRef} required type="file" name="cv" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setFileName(e.target.files?.[0]?.name || '')}/><span className="flex items-center gap-3 text-sm font-semibold text-slate-700">{fileName ? <FileText size={20}/> : <Upload size={20}/>} {fileName || (isFr ? 'Sélectionner un fichier · 4 Mo max.' : 'Choose a file · 4 MB max.')}</span></button></Field>
            <Field label={isFr ? 'Informations complémentaires' : 'Additional information'}><textarea name="informationsComplementaires" rows={3} className="input" /></Field>
            <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600"><input required name="privacy" value="1" type="checkbox" className="mt-1"/><span>{isFr ? 'J’accepte le traitement de mes informations conformément à la politique de confidentialité. *' : 'I agree to the processing of my information under the privacy policy. *'}</span></label>
            <label className="flex items-start gap-3 text-sm text-slate-600"><input name="marketing" value="1" type="checkbox"/><span>{isFr ? 'Recevoir occasionnellement les actualités Talentiques.' : 'Occasionally receive Talentiques updates.'}</span></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-[#0683c9] px-6 py-4 font-bold text-white hover:bg-sky-700 disabled:opacity-60">{loading ? (isFr ? 'Enregistrement…' : 'Saving…') : (isFr ? `Enregistrer et payer — ${service.displayPrice}` : `Save and pay — ${service.displayPrice}`)}</button>
          </form>}
          {stage === 'payment' && <div className="mt-8"><p className="leading-7 text-slate-600">{isFr ? 'Vos informations ont bien été transmises. Finalisez maintenant le paiement sécurisé pour que notre équipe puisse démarrer le traitement.' : 'Your information has been submitted. Complete secure payment so our team can begin processing your request.'}</p><div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700"><ShieldCheck size={18} className="text-sky-600"/>{isFr ? 'Paiement sécurisé via PayPal' : 'Secure payment via PayPal'}</p>{clientId ? <><div id="talentiques-service-paypal"/><Script src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${service.currency}&intent=capture&components=buttons`} strategy="afterInteractive" onLoad={renderPayPal} onError={() => setError(isFr ? 'Impossible de charger PayPal.' : 'Unable to load PayPal.')}/></> : <p className="text-sm text-amber-700">{isFr ? 'PayPal n’est pas configuré dans cet environnement.' : 'PayPal is not configured in this environment.'}</p>}</div>{loading && <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={17}/>{isFr ? 'Confirmation en cours…' : 'Confirming…'}</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}</div>}
          {stage === 'confirmed' && <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50 p-7 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={42}/><p className="mt-4 leading-7 text-slate-700">{isFr ? 'Votre demande est enregistrée et notre équipe peut maintenant démarrer le traitement.' : 'Your request has been registered and our team can now begin processing it.'}</p><button onClick={onClose} className="mt-6 rounded-full bg-[#020b1f] px-6 py-3 text-sm font-bold text-white">{isFr ? 'Fermer' : 'Close'}</button></div>}
        </div>
      </motion.div>
    </div>
  )}</AnimatePresence>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}
