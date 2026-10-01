'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle, ArrowRight, CheckCircle, ShieldCheck,
  Sparkles, Target, TrendingUp, Upload,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { buildCvDiagnosisLeadForm, submitCvDiagnosisLead, type CvLeadContact } from '@/lib/cv-analysis/crm';
import { DIFFICULTY_OPTIONS, recommendOffer } from '@/lib/cv-analysis/recommendation';
import type { CvAnalysisResult } from '@/lib/cv-analysis/types';
import { STATUS_OPTIONS } from '@/lib/salesforce';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedExtensions = new Set(['pdf', 'doc', 'docx', 'txt']);
const fieldClass = 'w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-brand-500';

export default function CVDiagnosisPage() {
  const [uploadMethod, setUploadMethod] = useState<'paste' | 'file'>('file');
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [jobOffer, setJobOffer] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [analysis, setAnalysis] = useState<CvAnalysisResult | null>(null);
  const [difficulty, setDifficulty] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const crmSent = useRef(false);

  const recommendation = useMemo(() => analysis
    ? recommendOffer({
        atsScore: analysis.atsReadiness.total,
        experienceLevel: analysis.profile.experienceLevel,
        currentStatus: analysis.profile.currentStatus,
        difficulty,
      })
    : null, [analysis, difficulty]);

  function selectFile(file: File | undefined) {
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExtensions.has(extension)) {
      setCvFile(null);
      setError('Format non supporté. Utilisez PDF, DOC, DOCX ou TXT.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setCvFile(null);
      setError('Le fichier dépasse la limite de 5 Mo.');
      return;
    }
    setError(null);
    setCvFile(file);
  }

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const contact = contactFromForm(new FormData(formElement));

    if (uploadMethod === 'paste' && cvText.trim().length < 100) {
      setError('Veuillez fournir un CV d’au moins 100 caractères.');
      return;
    }
    if (uploadMethod === 'file' && !cvFile) {
      setError('Veuillez sélectionner un fichier CV.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setDifficulty('');
    crmSent.current = false;

    try {
      const body = new FormData();
      body.set('locale', 'fr');
      body.set('targetRole', targetRole);
      body.set('jobOffer', jobOffer);
      body.set('currentStatus', currentStatus);
      body.set('website', String(new FormData(formElement).get('website') || ''));
      if (uploadMethod === 'file' && cvFile) body.set('cvFile', cvFile);
      else body.set('cvText', cvText);

      const response = await fetch('/api/analyze-cv', { method: 'POST', body });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Le diagnostic n’a pas pu être généré.');
      }

      const result = payload.analysis as CvAnalysisResult;
      setAnalysis(result);

      if (!crmSent.current) {
        crmSent.current = true;
        const params = new URLSearchParams(window.location.search);
        const crmContact: CvLeadContact = {
          ...contact,
          targetRole,
          currentStatus,
          utmSource: params.get('utm_source') || '',
          utmMedium: params.get('utm_medium') || '',
          utmCampaign: params.get('utm_campaign') || '',
        };
        void submitCvDiagnosisLead(buildCvDiagnosisLeadForm(crmContact, result));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-20 pt-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-blue-500/5" />
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="container relative z-10 mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
            <p className="mb-6 text-sm font-semibold text-brand-700">Diagnostic CV ATS gratuit</p>
            <h1 className="mb-6 bg-gradient-to-r from-brand-700 via-brand-600 to-blue-600 bg-clip-text font-heading text-5xl font-bold text-transparent md:text-6xl">
              Analyse CV & compatibilité ATS
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-slate-600">
              Analysez la structure, la lisibilité et plusieurs éléments clés de votre CV. Obtenez immédiatement des recommandations pour identifier vos priorités d’amélioration.
            </p>
          </motion.div>

          <form onSubmit={handleAnalyze} className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />

            <div className="mb-7 grid gap-4 sm:grid-cols-2">
              <Field label="Prénom *"><input required name="firstName" autoComplete="given-name" className={fieldClass} /></Field>
              <Field label="Nom *"><input required name="lastName" autoComplete="family-name" className={fieldClass} /></Field>
              <Field label="E-mail *"><input required name="email" type="email" autoComplete="email" className={fieldClass} /></Field>
              <Field label="Téléphone — facultatif"><input name="phone" type="tel" autoComplete="tel" className={fieldClass} /></Field>
              <Field label="Pays *"><input required name="country" type="text" autoComplete="country-name" maxLength={100} placeholder="Ex. Canada" className={fieldClass} /></Field>
              <Field label="Statut actuel *">
                <select required name="currentStatus" value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value)} className={fieldClass}>
                  <option value="" disabled>Sélectionnez votre statut</option>
                  {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
                </select>
              </Field>
              <Field label="LinkedIn — facultatif"><input name="linkedin" type="url" placeholder="https://linkedin.com/in/..." className={fieldClass} /></Field>
              <Field label="Métier ou poste recherché — facultatif">
                <input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} maxLength={160} placeholder="Business Developer, Infirmier, Data Analyst..." className={fieldClass} />
              </Field>
            </div>

            <Field label="Offre d’emploi — facultatif">
              <textarea value={jobOffer} onChange={(event) => setJobOffer(event.target.value)} maxLength={20000} rows={5} placeholder="Collez ici l’offre d’emploi si vous souhaitez obtenir également un Job Match." className={`${fieldClass} resize-y`} />
            </Field>

            <div className="mb-7 mt-7 flex justify-center gap-3">
              <MethodButton active={uploadMethod === 'file'} onClick={() => setUploadMethod('file')} icon={<Upload size={18} />} label="Importer votre CV" />
            </div>

            {uploadMethod === 'paste' ? (
              <Field label="Collez le contenu de votre CV ici">
                <textarea value={cvText} onChange={(event) => setCvText(event.target.value)} maxLength={50000} rows={12} placeholder="Copiez et collez le texte de votre CV ici..." className={`${fieldClass} resize-y font-mono text-sm`} />
              </Field>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-300 p-10 text-center transition hover:border-brand-400">
                <Upload className="mx-auto mb-4 text-slate-400" size={44} />
                <label className="cursor-pointer font-semibold text-brand-600 hover:text-brand-700">
                  Cliquez pour importer
                  <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={(event) => selectFile(event.target.files?.[0])} className="hidden" />
                </label>
                <p className="mt-2 text-sm text-slate-500">TXT, PDF, DOC ou DOCX — 5 Mo maximum</p>
                {cvFile && <p className="mt-4 font-semibold text-emerald-600">✓ {cvFile.name}</p>}
              </div>
            )}

            <p className="mt-4 flex items-start gap-2 rounded-xl bg-sky-50 p-4 text-sm leading-6 text-slate-600">
              <ShieldCheck className="mt-0.5 shrink-0 text-brand-600" size={18} />
              Votre CV est utilisé uniquement pour générer ce diagnostic. Il n’est pas ajouté automatiquement à votre espace commercial et n’est pas stocké après le traitement.
            </p>

            <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-slate-600">
              <input required name="privacy" value="1" type="checkbox" className="mt-1" />
              <span>J’accepte le traitement de mes informations conformément à la politique de confidentialité. *</span>
            </label>
            <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-slate-600">
              <input name="marketing" value="1" type="checkbox" className="mt-1" />
              <span>J’accepte de recevoir occasionnellement des conseils, offres et nouveautés Talentiques.</span>
            </label>

            <button disabled={isAnalyzing} className="group mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-4 text-lg font-bold text-white transition-all hover:shadow-xl hover:shadow-brand-500/25 disabled:cursor-not-allowed disabled:opacity-50">
              {isAnalyzing ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Analyse de votre CV en cours...</> : <><Sparkles size={20} /> Analyser mon CV <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" /></>}
            </button>
          </form>

          <AnimatePresence>
            {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700"><AlertCircle size={20} className="mt-0.5 shrink-0" /><p>{error}</p></motion.div>}
          </AnimatePresence>

          {analysis && recommendation && <AnalysisReport analysis={analysis} difficulty={difficulty} onDifficulty={setDifficulty} recommendation={recommendation} />}
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Pourquoi faire analyser votre CV ?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: TrendingUp, title: 'Identifiez vos priorités', description: 'Identifiez les éléments qui peuvent réduire la lisibilité, la clarté ou la pertinence de votre candidature.' },
              { icon: Target, title: 'Évaluez la compatibilité ATS', description: 'Vérifiez la structure de votre CV selon des critères explicables et reproductibles.' },
              { icon: Sparkles, title: 'Renforcez votre contenu', description: 'Repérez les formulations à préciser sans inventer de résultats ni de chiffres.' },
            ].map((benefit) => <article key={benefit.title} className="p-6 text-center"><div className="mb-4 inline-flex rounded-2xl bg-brand-100 p-4"><benefit.icon className="text-brand-600" size={32} /></div><h3 className="mb-3 text-xl font-bold">{benefit.title}</h3><p className="text-slate-600">{benefit.description}</p></article>)}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function AnalysisReport({ analysis, difficulty, onDifficulty, recommendation }: { analysis: CvAnalysisResult; difficulty: string; onDifficulty: (value: string) => void; recommendation: CvAnalysisResult['recommendation'] }) {
  const labels: Record<string, [string, number]> = {
    parseability: ['Parseabilité', 20], structure: ['Structure', 15], experience: ['Expériences', 20],
    impact: ['Impact', 15], skills: ['Compétences', 15], contact: ['Coordonnées', 5],
    consistency: ['Cohérence', 5], readability: ['Lisibilité', 5],
  };
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 rounded-2xl border border-brand-200 bg-gradient-to-br from-white to-brand-50/30 p-6 shadow-2xl sm:p-8">
    <div className="flex items-center gap-3"><div className="rounded-xl bg-brand-100 p-3"><CheckCircle className="text-brand-600" /></div><div><h2 className="text-2xl font-bold">Votre diagnostic</h2><p className="text-sm text-slate-600">Résultat immédiat • Indicateur Talentiques</p></div></div>
    <section className="rounded-2xl bg-slate-950 p-6 text-white sm:flex sm:items-center sm:gap-8"><div className="text-center"><p className="text-sm font-bold uppercase tracking-wider text-brand-200">Talentiques ATS Readiness</p><p className="mt-2 text-5xl font-black">{analysis.atsReadiness.total}<span className="text-2xl text-slate-400">/100</span></p></div><div className="mt-5 flex-1 sm:mt-0"><div className="h-3 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${analysis.atsReadiness.total}%` }} /></div><p className="mt-3 text-sm leading-6 text-slate-300">Indicateur Talentiques basé sur la structure, la lisibilité, la complétude et plusieurs critères de compatibilité. Il ne représente pas le score interne d’un ATS spécifique.</p>{!analysis.layoutAssessed && <p className="mt-2 text-sm text-amber-200">La mise en page du document n’a pas pu être évaluée complètement.</p>}</div></section>
    <Section title="Détail du score"><div className="grid gap-3 sm:grid-cols-2">{Object.entries(analysis.atsReadiness.breakdown).map(([key, value]) => <div key={key} className="flex justify-between rounded-xl bg-slate-50 px-4 py-3"><span>{labels[key][0]}</span><strong>{value}/{labels[key][1]}</strong></div>)}</div></Section>
    {analysis.jobMatch && <Section title="Job Match"><p className="text-4xl font-black text-brand-700">{analysis.jobMatch.total}/100</p><p className="mt-2 text-sm text-slate-600">Correspondance entre votre CV et le contenu de l’offre fournie. Ce score ne représente pas une probabilité de recrutement.</p></Section>}
    <Section title="3 priorités absolues"><Numbered items={analysis.priorities.map((item) => item.explanation)} /></Section>
    <Section title="Points forts"><Bullets items={analysis.strengths} /></Section>
    <div className="grid gap-6 md:grid-cols-2"><Section title="À supprimer ou réduire"><Bullets items={analysis.removeOrReduce} /></Section><Section title="À ajouter ou renforcer"><Bullets items={analysis.addOrStrengthen} /></Section></div>
    <Section title="Phrases à améliorer"><div className="space-y-4">{analysis.rewrites.map((item, index) => <article key={`${item.evidence}-${index}`} className="rounded-xl border border-slate-200 p-5"><Mini title="Actuel" text={item.evidence} /><Mini title="Pourquoi l’améliorer" text={item.explanation} /><Mini title="Structure recommandée" text={item.example_rewrite} /></article>)}</div></Section>
    {analysis.esco.used && <Section title={`Métier cible ESCO${analysis.esco.occupation ? ` · ${analysis.esco.occupation}` : ''}`}><p className="mb-3 text-sm text-slate-600">Compétences pertinentes non détectées dans votre CV :</p><Bullets items={analysis.esco.skills} /></Section>}
    <Section title="Quelle est aujourd’hui votre principale difficulté ?"><select value={difficulty} onChange={(event) => onDifficulty(event.target.value)} className={fieldClass}><option value="">Sélectionnez une réponse — facultatif</option>{DIFFICULTY_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select><p className="mt-2 text-xs text-slate-500">Votre réponse ajuste la recommandation sans relancer l’analyse IA.</p></Section>
    <section className="rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-6 text-white"><p className="text-sm font-bold uppercase tracking-wider text-brand-100">Recommandation Talentiques</p><h3 className="mt-2 text-2xl font-bold">{recommendation.offerName}</h3><p className="mt-3 leading-7 text-brand-50">{recommendation.reason}</p><Link href={recommendation.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-bold text-brand-700">{recommendation.cta}<ArrowRight size={18} /></Link></section>
  </motion.div>;
}

function contactFromForm(data: FormData): Omit<CvLeadContact, 'targetRole' | 'currentStatus'> {
  const value = (name: string) => String(data.get(name) || '');
  return { firstName: value('firstName'), lastName: value('lastName'), email: value('email'), phone: value('phone'), country: value('country'), linkedin: value('linkedin'), privacy: value('privacy') === '1', marketing: value('marketing') === '1' };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }
function MethodButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) { return <button type="button" onClick={onClick} className={`flex items-center rounded-xl px-5 py-3 font-semibold transition ${active ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25' : 'border border-slate-200 bg-white text-slate-600'}`}>{icon}<span className="ml-2">{label}</span></button>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h3 className="mb-4 text-xl font-bold text-slate-900">{title}</h3>{children}</section>; }
function Bullets({ items }: { items: string[] }) { return items.length ? <ul className="space-y-2 text-slate-700">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><span className="text-brand-600">•</span><span>{item}</span></li>)}</ul> : <p className="text-sm text-slate-500">Aucun élément notable détecté.</p>; }
function Numbered({ items }: { items: string[] }) { return <ol className="space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{index + 1}</span><span className="pt-0.5 text-slate-700">{item}</span></li>)}</ol>; }
function Mini({ title, text }: { title: string; text: string }) { return <div className="mb-3 last:mb-0"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p><p className="mt-1 leading-7 text-slate-700">{text}</p></div>; }
