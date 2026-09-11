'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, FileText, ShieldCheck, Upload, X } from 'lucide-react';
import { COUNTRY_OPTIONS, STATUS_OPTIONS } from '@/lib/salesforce';

interface DiagnosticFormProps {
  isOpen: boolean;
  onClose: () => void;
}

function addTracking(data: FormData) {
  data.set('pageOrigine', window.location.pathname || '/diagnostic-cv-ats');
  const params = new URLSearchParams(window.location.search);
  data.set('utmSource', params.get('utm_source') || '');
  data.set('utmMedium', params.get('utm_medium') || '');
  data.set('utmCampaign', params.get('utm_campaign') || '');
}

export const DiagnosticForm = ({ isOpen, onClose }: DiagnosticFormProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSuccess(false);
      setError('');
      setFileName('');
    }
  }, [isOpen]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setLoading(true);
    setError('');

    try {
      const data = new FormData(formElement);
      data.set('typeDemande', 'Diagnostic CV');
      data.set('offreRessource', 'Diagnostic CV');
      data.set('statutPaiement', 'Non applicable');
      addTracking(data);

      const response = await fetch('/api/salesforce-lead', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Impossible d’envoyer votre demande.');

      formElement.reset();
      setFileName('');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.button
            aria-label="Fermer"
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: .98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: .98 }}
            className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8"
          >
            <div className="h-2 bg-gradient-to-r from-brand-600 to-blue-500" />
            <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900" aria-label="Fermer">
              <X size={20} />
            </button>

            <div className="p-6 md:p-9 max-h-[88vh] overflow-y-auto">
              {success ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5"><CheckCircle2 size={32}/></div>
                  <h2 className="text-3xl font-bold text-slate-900">Diagnostic demandé</h2>
                  <p className="text-slate-600 mt-3 max-w-xl mx-auto">Votre demande et votre CV ont bien été enregistrés. Notre équipe vous recontactera après analyse.</p>
                  <button onClick={onClose} className="mt-7 px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800">Fermer</button>
                </div>
              ) : (
                <>
                  <div className="mb-7 pr-10">
                    <p className="text-sm font-bold text-brand-700 uppercase tracking-wider">Diagnostic CV ATS offert</p>
                    <h2 className="text-3xl font-bold text-slate-900 mt-2">Recevez un premier regard professionnel sur votre CV</h2>
                    <p className="text-slate-600 mt-2">Quelques informations suffisent pour contextualiser votre dossier et vous répondre de manière utile.</p>
                  </div>

                  <form onSubmit={submit} className="space-y-5">
                    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-6">
                      <h3 className="font-bold text-slate-900 mb-4">Vos coordonnées</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Prénom *"><input required name="firstName" className="input" /></Field>
                        <Field label="Nom *"><input required name="lastName" className="input" /></Field>
                        <Field label="E-mail *"><input required type="email" name="email" className="input" /></Field>
                        <Field label="Téléphone"><input type="tel" name="phone" className="input" /></Field>
                        <Field label="Pays de résidence *"><select required name="country" className="input"><option value="">Sélectionner</option>{COUNTRY_OPTIONS.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></Field>
                        <Field label="Statut actuel *"><select required name="statutActuel" className="input"><option value="">Sélectionner</option>{STATUS_OPTIONS.map(v => <option key={v}>{v}</option>)}</select></Field>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
                      <h3 className="font-bold text-slate-900 mb-4">Votre projet</h3>
                      <div className="space-y-4">
                        <Field label="Objectif professionnel *"><textarea required name="objectifProfessionnel" rows={3} className="input resize-none" placeholder="Poste visé, secteur, type d’opportunité…" /></Field>
                        <Field label="CV * — PDF, DOC ou DOCX, 4 Mo maximum">
                          <div onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 hover:border-brand-400 hover:bg-brand-50/40 transition-colors">
                            <input ref={fileRef} required type="file" name="cv" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}/>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <div className="p-2 rounded-lg bg-brand-50 text-brand-700">{fileName ? <FileText size={20}/> : <Upload size={20}/>}</div>
                              <div><div className="font-semibold text-slate-800">{fileName || 'Ajouter mon CV'}</div><div className="text-xs text-slate-500 mt-0.5">Document stocké de manière privée.</div></div>
                            </div>
                          </div>
                        </Field>
                        <Field label="Informations complémentaires"><textarea name="informationsComplementaires" rows={3} className="input resize-none" placeholder="Ajoutez un contexte utile si nécessaire." /></Field>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 text-sm text-slate-600"><input required name="privacy" value="1" type="checkbox" className="mt-1"/><span>J’accepte que Talentiques traite mes informations et mon CV afin de répondre à ma demande. *</span></label>
                    <label className="flex items-start gap-3 text-sm text-slate-600"><input name="marketing" value="1" type="checkbox" className="mt-1"/><span>J’accepte de recevoir occasionnellement des conseils et actualités Talentiques.</span></label>

                    {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

                    <button disabled={loading} type="submit" className="w-full rounded-xl bg-brand-600 text-white px-6 py-4 font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/15 disabled:opacity-60">
                      {loading ? 'Envoi en cours…' : 'Demander mon diagnostic CV'}
                    </button>
                    <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-2"><ShieldCheck size={14}/>Vos informations sont transmises de façon sécurisée.</p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
