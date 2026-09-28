'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, FileSignature, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';
import { getServiceOffer, type ServiceId } from '@/lib/services/catalog';
import { OptimizationFormModal, type OptimizationOffer } from '@/components/OptimizationFormModal';

export function Services({ locale = 'fr' }: { locale?: HomeLocale }) {
  const [selected, setSelected] = useState<OptimizationOffer | null>(null);
  const copy = getHomeContent(locale).services;
  const fr = locale === 'fr';
  const ids: ServiceId[] = ['professional-profile', 'student-jobseeker'];
  const features = fr
    ? ['CV optimisé ATS — Word modifiable + PDF', 'Lettre de motivation personnalisée — 1 cible', 'Optimisation complète du profil LinkedIn', 'Tableau de suivi des candidatures offert', 'Corrections illimitées jusqu’à satisfaction']
    : ['ATS-optimized resume — editable Word + PDF', 'Personalized cover letter — one target', 'Complete LinkedIn profile optimization', 'Application tracking table included', 'Revisions until satisfaction'];

  return <>
    <section id="services" className="relative overflow-hidden bg-white py-24">
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-200/20 blur-[128px]" />
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-16 max-w-3xl text-center"><span className="mb-4 block text-sm font-bold uppercase tracking-widest text-brand-600">{copy.eyebrow}</span><h2 className="mb-6 font-heading text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">{copy.title}</h2><p className="text-lg leading-relaxed text-slate-600">{copy.description}</p></motion.div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-7 lg:grid-cols-2">{ids.map((id, index) => { const service = getServiceOffer(id, locale); const professional = id === 'professional-profile'; const Icon = professional ? FileSignature : GraduationCap; return <motion.article key={id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className={cn('relative flex flex-col rounded-3xl border bg-white p-8 shadow-sm md:p-10', professional ? 'border-brand-300 ring-4 ring-brand-50 shadow-xl shadow-brand-900/5' : 'border-slate-200')}>
          {professional && <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700"><Sparkles size={12}/>{copy.recommended}</span>}
          <div className={cn('mb-6 flex h-14 w-14 items-center justify-center rounded-2xl', professional ? 'bg-brand-600 text-white' : 'bg-slate-100 text-brand-700')}><Icon size={26}/></div>
          <h3 className="mb-2 font-heading text-2xl font-bold text-slate-900 md:text-3xl">{service.name}</h3>
          <p className="mb-6 text-sm text-slate-500">{professional ? (fr ? 'Professionnels · évolution · transition · repositionnement' : 'Professionals · growth · transition · repositioning') : (fr ? 'Étudiant · alternant · demandeur d’emploi · profil sans emploi' : 'Student · work-study candidate · job seeker · unemployed')}</p>
          <div className="mb-5 flex items-end gap-3"><span className="text-5xl font-bold text-slate-900">{service.displayPrice}</span><span className="mb-2 text-sm text-slate-500">{copy.payment}</span></div>
          <p className="mb-6 leading-relaxed text-slate-600">{professional ? (fr ? 'Refonte complète de votre candidature pour construire une image professionnelle plus claire, cohérente et crédible.' : 'A complete application overhaul to build a clearer, more consistent and credible professional profile.') : (fr ? 'Le même niveau de qualité et les mêmes livrables, avec un tarif réservé aux profils éligibles sur justificatif.' : 'The same quality and deliverables at a rate reserved for eligible profiles with supporting evidence.')}</p>
          <p className="mb-6 text-sm font-semibold text-brand-700">{fr ? 'Livraison sous 48–72h ouvrées' : 'Delivery within 48–72 business hours'}{!professional && (fr ? ' · justificatif requis' : ' · proof required')}</p>
          <ul className="mb-8 flex-1 space-y-3">{features.map(feature => <li key={feature} className="flex items-start gap-3 text-sm text-slate-700"><span className="mt-0.5 rounded-full bg-brand-50 p-1 text-brand-600"><Check size={13} strokeWidth={3}/></span>{feature}</li>)}</ul>
          <button type="button" onClick={() => setSelected({ id, market: locale })} className={cn('flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-center font-bold transition-all', professional ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700' : 'border border-brand-200 text-brand-700 hover:bg-brand-50')}>{professional ? (fr ? 'Valoriser mon profil' : 'Optimize my profile') : (fr ? 'Renforcer ma candidature' : 'Strengthen my application')}<ArrowUpRight size={18}/></button>
          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck size={14}/>{copy.paymentNote}</p>
        </motion.article>; })}</div>
      </div>
    </section>
    <OptimizationFormModal offer={selected} onClose={() => setSelected(null)} />
  </>;
}
