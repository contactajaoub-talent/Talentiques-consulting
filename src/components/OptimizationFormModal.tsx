'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, FileText, ShieldCheck, Upload, X } from 'lucide-react';
import { COUNTRY_OPTIONS, STATUS_OPTIONS } from '@/lib/salesforce';

type Offer = {
  title: string;
  offerLabel: 'Professionnel — 60 €' | 'Étudiant / Demandeur — 30 €';
  amount: '60' | '30';
  paypal: string;
};

interface Props {
  offer: Offer | null;
  onClose: () => void;
}

const difficulties = [
  'Je postule sans réponses',
  'Je débute et je suis perdu',
  'CV / LinkedIn peu valorisant',
  'Reconversion en cours',
  'Optimisation de positionnement',
  'Autre raison',
];

function addTracking(formData: FormData) {
  formData.set('pageOrigine', window.location.pathname || '/');
  const params = new URLSearchParams(window.location.search);
  formData.set('utmSource', params.get('utm_source') || '');
  formData.set('utmMedium', params.get('utm_medium') || '');
  formData.set('utmCampaign', params.get('utm_campaign') || '');
}

export const OptimizationFormModal = ({ offer, onClose }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = offer ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [offer]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!offer) return;
    setLoading(true);
    setError('');
    try {
      const data = new FormData(event.currentTarget);
      data.set('typeDemande', 'Optimisation');
      data.set('offreRessource', offer.offerLabel);
      data.set('montantPrevu', offer.amount);
      data.set('statutPaiement', 'Paiement en attente');
      addTracking(data);

      const response = await fetch('/api/salesforce-lead', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Impossible d’envoyer le formulaire.');
      window.location.href = offer.paypal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {offer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.button aria-label="Fermer" className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div initial={{ opacity: 0, y: 24, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .98 }} className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="h-2 bg-gradient-to-r from-brand-600 to-blue-500" />
            <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"><X size={20}/></button>
            <div className="p-6 md:p-9 max-h-[88vh] overflow-y-auto">
              <div className="mb-7 pr-10">
                <p className="text-sm font-bold text-brand-700 uppercase tracking-wider">Optimisation Talentiques</p>
                <h2 className="text-3xl font-bold text-slate-900 mt-2">{offer.title}</h2>
                <p className="text-slate-600 mt-2">Vos informations sont d’abord enregistrées dans notre CRM, puis vous êtes redirigé vers PayPal pour finaliser le paiement de {offer.amount} €.</p>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Prénom *"><input required name="firstName" className="input" /></Field>
                  <Field label="Nom *"><input required name="lastName" className="input" /></Field>
                  <Field label="E-mail *"><input required type="email" name="email" className="input" /></Field>
                  <Field label="Téléphone"><input type="tel" name="phone" className="input" /></Field>
                  <Field label="Pays de résidence *"><select required name="country" className="input"><option value="">Sélectionner</option>{COUNTRY_OPTIONS.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></Field>
                  <Field label="Statut actuel *"><select required name="statutActuel" className="input"><option value="">Sélectionner</option>{STATUS_OPTIONS.map(v => <option key={v}>{v}</option>)}</select></Field>
                </div>

                <Field label="Décrivez votre objectif professionnel *"><textarea required name="objectifProfessionnel" rows={3} className="input resize-none" placeholder="Poste visé, secteur, marché, évolution recherchée…" /></Field>

                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Difficulté principale"><select name="difficultePrincipale" className="input"><option value="">Sélectionner</option>{difficulties.map(v => <option key={v}>{v}</option>)}</select></Field>
                  <Field label="Profil LinkedIn"><input type="url" name="profilLinkedIn" className="input" placeholder="https://linkedin.com/in/..." /></Field>
                </div>

                <Field label="CV (PDF, DOC ou DOCX) * — 4 Mo maximum">
                  <div onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 hover:border-brand-400 transition-colors">
                    <input ref={fileRef} required type="file" name="cv" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}/>
                    <div className="flex items-center gap-3 text-sm text-slate-600"><div className="p-2 rounded-lg bg-brand-50 text-brand-700">{fileName ? <FileText size={20}/> : <Upload size={20}/>}</div><span>{fileName || 'Cliquer pour sélectionner votre CV'}</span></div>
                  </div>
                </Field>

                <Field label="Informations complémentaires"><textarea name="informationsComplementaires" rows={3} className="input resize-none" /></Field>

                <label className="flex items-start gap-3 text-sm text-slate-600"><input required name="privacy" value="1" type="checkbox" className="mt-1"/><span>J’accepte que Talentiques traite mes informations afin de répondre à ma demande, conformément à la politique de confidentialité. *</span></label>
                <label className="flex items-start gap-3 text-sm text-slate-600"><input name="marketing" value="1" type="checkbox" className="mt-1"/><span>J’accepte de recevoir occasionnellement des conseils et actualités Talentiques.</span></label>

                {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

                <button disabled={loading} type="submit" className="w-full rounded-xl bg-brand-600 text-white px-6 py-4 font-bold hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? 'Enregistrement en cours…' : <>Continuer vers le paiement sécurisé <ShieldCheck size={18}/></>}
                </button>
                <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5"><CheckCircle2 size={14}/>Le paiement est effectué sur PayPal après l’enregistrement de votre demande.</p>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">{label}</span>{children}</label>
);
