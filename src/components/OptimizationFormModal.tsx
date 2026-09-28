'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileText, ShieldCheck, Upload, X } from 'lucide-react';
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
    return () => {
      document.body.style.overflow = '';
    };
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

      const response = await fetch('/api/salesforce-lead', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Impossible d’envoyer le formulaire.');
      }

      window.location.href = offer.paypal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {offer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <motion.button
            aria-label="Fermer"
            className="fixed inset-0 bg-slate-900/55 backdrop-blur-[3px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.22 }}
            className="relative z-10 w-full max-w-[760px] overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
          >
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
            >
              <X size={21} />
            </button>

            <div className="max-h-[88vh] overflow-y-auto px-6 py-7 sm:px-9 sm:py-9 md:px-12">
              <div className="pr-14">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-brand-700 sm:text-sm">
                  <Check size={15} strokeWidth={3} />
                  {offer.offerLabel}
                </div>

                <h2 className="mt-7 font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-[34px]">
                  Finalisez votre demande
                </h2>

                <p className="mt-3 max-w-2xl text-[16px] leading-7 text-slate-600">
                  Renseignez vos coordonnées ci-dessous. Votre demande sera enregistrée,
                  puis vous serez redirigé vers la page de paiement sécurisée.
                </p>
              </div>

              <div className="my-8 h-px bg-sky-100" />

              <form onSubmit={submit} className="space-y-6">
                <input
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Prénom *">
                    <input
                      required
                      name="firstName"
                      className="input"
                      placeholder="Ex : Marie"
                      autoComplete="given-name"
                    />
                  </Field>

                  <Field label="Nom *">
                    <input
                      required
                      name="lastName"
                      className="input"
                      placeholder="Ex : Dupont"
                      autoComplete="family-name"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="E-mail *">
                    <input
                      required
                      type="email"
                      name="email"
                      className="input"
                      placeholder="vous@email.com"
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="Téléphone">
                    <input
                      type="tel"
                      name="phone"
                      className="input"
                      placeholder="+33 6 00 00 00 00"
                      autoComplete="tel"
                    />
                  </Field>
                </div>

                <Field label="Pays de résidence *">
                  <select
                    required
                    name="country"
                    className="input"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Sélectionnez votre pays
                    </option>
                    {COUNTRY_OPTIONS.map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Statut actuel *">
                  <select
                    required
                    name="statutActuel"
                    className="input"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Sélectionnez votre statut
                    </option>
                    {STATUS_OPTIONS.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Objectif professionnel *">
                  <textarea
                    required
                    name="objectifProfessionnel"
                    rows={4}
                    className="input"
                    placeholder="Poste visé, secteur, marché, évolution recherchée…"
                  />
                </Field>

                <Field label="Difficulté principale">
                  <select
                    name="difficultePrincipale"
                    className="input"
                    defaultValue=""
                  >
                    <option value="">
                      Sélectionnez votre difficulté
                    </option>
                    {difficulties.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Profil LinkedIn">
                  <input
                    type="url"
                    name="profilLinkedIn"
                    className="input"
                    placeholder="https://linkedin.com/in/votre-profil"
                  />
                </Field>

                <Field label="Télécharger votre CV (PDF ou Word) *">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group w-full rounded-[14px] border border-dashed border-sky-200 bg-[#F3F7FD] px-5 py-5 text-left transition hover:border-brand-400 hover:bg-sky-50"
                  >
                    <input
                      ref={fileRef}
                      required
                      type="file"
                      name="cv"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(event) =>
                        setFileName(event.target.files?.[0]?.name || '')
                      }
                    />

                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm ring-1 ring-sky-100">
                        {fileName ? <FileText size={20} /> : <Upload size={20} />}
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-slate-700">
                          {fileName || 'Cliquez pour sélectionner votre CV'}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          PDF, DOC ou DOCX · 4 Mo maximum
                        </span>
                      </span>
                    </span>
                  </button>
                </Field>

                <Field label="Informations complémentaires">
                  <textarea
                    name="informationsComplementaires"
                    rows={4}
                    className="input"
                    placeholder="Partagez toute information utile : expériences, contraintes particulières…"
                  />
                </Field>

                <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
                    <input
                      required
                      name="privacy"
                      value="1"
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <span>
                      J’accepte que Talentiques traite mes informations afin de répondre
                      à ma demande, conformément à la politique de confidentialité. *
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
                    <input
                      name="marketing"
                      value="1"
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <span>
                      J’accepte de recevoir occasionnellement des conseils et actualités
                      Talentiques.
                    </span>
                  </label>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <button
                  disabled={loading}
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-brand-600 px-6 py-4 text-[16px] font-bold text-white shadow-[0_12px_30px_rgba(6,131,201,0.22)] transition hover:bg-brand-700 hover:shadow-[0_16px_34px_rgba(6,131,201,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    'Enregistrement en cours…'
                  ) : (
                    <>
                      Continuer vers le paiement — {offer.amount} €
                      <span aria-hidden="true">↗</span>
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500 sm:text-sm">
                  <ShieldCheck size={15} className="shrink-0" />
                  Paiement sécurisé via PayPal — carte bancaire acceptée sans compte PayPal.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="block space-y-2">
    <span className="block text-[15px] font-semibold text-slate-700">
      {label}
    </span>
    {children}
  </label>
);
