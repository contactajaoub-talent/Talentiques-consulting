'use client';

import React, { useRef, useState } from 'react';
import { CheckCircle2, FileText, Upload } from 'lucide-react';
import { COUNTRY_OPTIONS, STATUS_OPTIONS } from '@/lib/salesforce';

const experienceOptions = ['Moins de 2 ans', '2 à 5 ans', '5 à 10 ans', 'Plus de 10 ans'];
const marketOptions = ['France', 'Belgique', 'Suisse', 'Canada', 'Luxembourg', 'France + International', 'Europe (plusieurs pays)', 'International', 'Autre'];
const durationOptions = ['3 mois', '6 mois', "Jusqu'au résultat, peu importe la durée", "À définir ensemble lors de l'appel"];
const budgetOptions = ['200 – 350 € · Accessible', 'Moins de 200 € · Si possible', 'Budget flexible · À discuter', "Je préfère en discuter lors de l'appel découverte"];
const obstacleOptions = ['Manque de réponses aux candidatures', 'CV et profil peu valorisants', 'Manque de réseau et de visibilité', 'Reconversion difficile à articuler', 'Manque de confiance et de méthode', 'Objectif professionnel pas encore clair', 'Autre'];

function addTracking(data: FormData) {
  data.set('pageOrigine', window.location.pathname || '/accompagnement');
  const params = new URLSearchParams(window.location.search);
  data.set('utmSource', params.get('utm_source') || '');
  data.set('utmMedium', params.get('utm_medium') || '');
  data.set('utmCampaign', params.get('utm_campaign') || '');
}

export const AccompanimentLeadForm = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setLoading(true);
    setError('');
    try {
      const data = new FormData(event.currentTarget);
      data.set('typeDemande', 'Accompagnement');
      data.set('offreRessource', 'Accompagnement Total');
      data.set('statutPaiement', 'Non applicable');
      addTracking(data);
      const response = await fetch('/api/salesforce-lead', { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Impossible d’envoyer votre demande.');
      setSuccess(true);
      formElement.reset();
      setFileName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-slate-50" id="demande-accompagnement">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-6 md:p-10">
          {success ? (
            <div className="py-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5"><CheckCircle2 size={32}/></div>
              <h2 className="text-3xl font-bold text-slate-900">Votre demande est enregistrée.</h2>
              <p className="text-slate-600 mt-3 max-w-xl mx-auto">Nous vous recontactons sous 24 h pour organiser un appel découverte gratuit et clarifier votre besoin.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm uppercase tracking-widest font-bold text-brand-700">Appel découverte gratuit</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Parlez-nous de votre projet</h2>
                <p className="text-slate-600 mt-3">Quelques informations nous permettent de préparer un échange utile et personnalisé.</p>
              </div>
              <form onSubmit={submit} className="space-y-5">
                <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Prénom *"><input required name="firstName" className="input" /></Field>
                  <Field label="Nom *"><input required name="lastName" className="input" /></Field>
                  <Field label="E-mail *"><input required type="email" name="email" className="input" /></Field>
                  <Field label="Téléphone"><input type="tel" name="phone" className="input" /></Field>
                  <Field label="Pays de résidence *"><select required name="country" className="input"><option value="">Sélectionner</option>{COUNTRY_OPTIONS.map(([code,label]) => <option key={code} value={code}>{label}</option>)}</select></Field>
                  <Field label="Profil LinkedIn"><input type="url" name="profilLinkedIn" className="input" placeholder="https://linkedin.com/in/..." /></Field>
                  <Field label="Statut actuel *"><select required name="statutActuel" className="input"><option value="">Sélectionner</option>{STATUS_OPTIONS.map(v => <option key={v}>{v}</option>)}</select></Field>
                  <Field label="Années d’expérience"><select name="anneesExperience" className="input"><option value="">Sélectionner</option>{experienceOptions.map(v => <option key={v}>{v}</option>)}</select></Field>
                  <Field label="Secteur d’activité actuel / cible"><input name="secteurActivite" className="input" /></Field>
                  <Field label="Marché géographique ciblé *"><select required name="marcheGeographique" className="input"><option value="">Sélectionner</option>{marketOptions.map(v => <option key={v}>{v}</option>)}</select></Field>
                  <Field label="Poste / fonction visé(e) *"><input required name="posteVise" className="input" /></Field>
                  <Field label="Canal de contact préféré"><select name="canalContact" className="input"><option value="">Sélectionner</option><option>WhatsApp</option><option>Téléphone</option><option>E-mail</option></select></Field>
                </div>
                <Field label="Objectif professionnel *"><textarea required name="objectifProfessionnel" rows={4} className="input resize-none" placeholder="Expliquez le résultat que vous souhaitez atteindre…" /></Field>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Durée d’accompagnement souhaitée"><select name="dureeAccompagnement" className="input"><option value="">Sélectionner</option>{durationOptions.map(v => <option key={v}>{v}</option>)}</select></Field>
                  <Field label="Budget envisagé"><select name="budgetEnvisage" className="input"><option value="">Sélectionner</option>{budgetOptions.map(v => <option key={v}>{v}</option>)}</select></Field>
                  <Field label="Frein principal"><select name="freinPrincipal" className="input"><option value="">Sélectionner</option>{obstacleOptions.map(v => <option key={v}>{v}</option>)}</select></Field>
                </div>
                <Field label="CV (optionnel) — PDF, DOC ou DOCX, 4 Mo maximum">
                  <div onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 hover:border-brand-400 transition-colors">
                    <input ref={fileRef} type="file" name="cv" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}/>
                    <div className="flex items-center gap-3 text-sm text-slate-600"><div className="p-2 rounded-lg bg-brand-50 text-brand-700">{fileName ? <FileText size={20}/> : <Upload size={20}/>}</div><span>{fileName || 'Ajouter votre CV si vous le souhaitez'}</span></div>
                  </div>
                </Field>
                <Field label="Informations complémentaires"><textarea name="informationsComplementaires" rows={3} className="input resize-none" /></Field>
                <label className="flex items-start gap-3 text-sm text-slate-600"><input required name="privacy" value="1" type="checkbox" className="mt-1"/><span>J’accepte que Talentiques traite mes informations afin de répondre à ma demande. *</span></label>
                <label className="flex items-start gap-3 text-sm text-slate-600"><input name="marketing" value="1" type="checkbox" className="mt-1"/><span>J’accepte de recevoir occasionnellement des conseils et actualités Talentiques.</span></label>
                {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}
                <button disabled={loading} type="submit" className="w-full rounded-xl bg-brand-600 text-white px-6 py-4 font-bold hover:bg-brand-700 disabled:opacity-60">{loading ? 'Envoi en cours…' : 'Demander mon appel découverte gratuit'}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block space-y-1.5"><span className="text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
