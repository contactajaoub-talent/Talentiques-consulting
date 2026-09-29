'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  ServiceInquiryModal,
  type ServiceInquiryOffer,
} from '@/components/ServiceInquiryModal';
import { getServiceOffer, type ServiceId } from '@/lib/services/catalog';
import type { HomeLocale } from '@/lib/home-content';

const FEATURES: Record<HomeLocale, string[]> = {
  fr: [
    'CV optimisé ATS — Word modifiable + PDF',
    'Lettre de motivation personnalisée — 1 cible',
    'Optimisation complète du profil LinkedIn',
    'Tableau de suivi des candidatures',
    'Corrections jusqu’à finalisation',
  ],
  en: [
    'ATS-optimized resume — editable Word + PDF',
    'Personalized cover letter — one target',
    'Complete LinkedIn profile optimization',
    'Application tracking table',
    'Revisions through finalization',
  ],
};

export function ServicesOffersPage({ locale }: { locale: HomeLocale }) {
  const [selected, setSelected] = useState<ServiceInquiryOffer | null>(null);
  const fr = locale === 'fr';

  const offers: Array<{
    id: ServiceId;
    audience: string;
    intro: string;
    cta: string;
    eligibility?: string;
  }> = fr
    ? [
        {
          id: 'professional-profile',
          audience: 'PROFESSIONNELS · +3 ANS D’EXPÉRIENCE · ÉVOLUTION · TRANSITION',
          intro:
            'Pour les professionnels disposant de plus de 3 ans d’expérience, en évolution, transition ou repositionnement.',
          cta: 'Démarrer mon accompagnement',
        },
        {
          id: 'student-jobseeker',
          audience: 'ÉTUDIANTS · ALTERNANTS · DEMANDEURS D’EMPLOI',
          intro:
            'Pour les étudiants, alternants et personnes actuellement en recherche d’emploi.',
          cta: 'Renforcer ma candidature',
          eligibility: 'Tarif réservé aux profils éligibles — justificatif requis.',
        },
      ]
    : [
        {
          id: 'professional-profile',
          audience: 'PROFESSIONALS · 3+ YEARS EXPERIENCE · GROWTH · TRANSITION',
          intro:
            'For professionals with more than three years of experience who are growing, transitioning or repositioning.',
          cta: 'Start my support',
        },
        {
          id: 'student-jobseeker',
          audience: 'STUDENTS · WORK-STUDY CANDIDATES · JOB SEEKERS',
          intro:
            'For students, work-study candidates and people currently looking for a job.',
          cta: 'Strengthen my application',
          eligibility: 'Reserved rate for eligible profiles — supporting evidence required.',
        },
      ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar locale={locale} />

      <main className="pb-20 pt-32 sm:pt-36 lg:pb-28">
        <section className="container mx-auto px-5 md:px-8">
          <div className="mx-auto max-w-7xl">
            <Link
              href={fr ? '/#services' : '/en#services'}
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0683C9] transition hover:text-[#056da8]"
            >
              <ArrowLeft size={16} />
              {fr ? 'Retour aux services' : 'Back to services'}
            </Link>

            <motion.header
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 max-w-4xl"
            >
              <span className="text-xs font-bold uppercase tracking-[.22em] text-[#C96A08]">
                {fr ? 'SERVICES TALENTIQUES' : 'TALENTIQUES SERVICES'}
              </span>

              <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.06] tracking-[-.04em] text-[#0F3452] sm:text-5xl lg:text-6xl">
                {fr ? (
                  <>
                    Un accompagnement adapté à{' '}
                    <span className="text-[#D97706]">votre situation.</span>
                  </>
                ) : (
                  <>
                    Support tailored to{' '}
                    <span className="text-[#D97706]">your situation.</span>
                  </>
                )}
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                {fr
                  ? 'Deux niveaux d’accompagnement, avec la même exigence de qualité. Choisissez celui qui correspond à votre situation professionnelle.'
                  : 'Two levels of support with the same standard of quality. Choose the option that best matches your professional situation.'}
              </p>
            </motion.header>

            <div className="mt-14 grid border-y border-slate-200 lg:grid-cols-2">
              {offers.map((offer, index) => {
                const service = getServiceOffer(offer.id, locale);

                return (
                  <motion.article
                    key={offer.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className={`relative py-10 lg:px-10 lg:py-12 ${
                      index === 1
                        ? 'border-t border-slate-200 lg:border-l lg:border-t-0'
                        : ''
                    }`}
                  >
                    {index === 0 && (
                      <div
                        className="absolute left-0 top-0 h-1 w-20 bg-[#D97706]"
                        aria-hidden="true"
                      />
                    )}

                    <span className="text-[11px] font-bold uppercase leading-5 tracking-[.15em] text-slate-500">
                      {offer.audience}
                    </span>

                    <h2 className="mt-5 font-heading text-3xl font-bold leading-tight tracking-[-.03em] text-slate-950">
                      {service.name}
                    </h2>

                    <p className="mt-4 max-w-xl leading-7 text-slate-600">
                      {offer.intro}
                    </p>

                    <div className="mt-7 flex items-end gap-3">
                      <span className="font-heading text-5xl font-bold tracking-[-.04em] text-[#0F3452]">
                        {service.displayPrice}
                      </span>
                      <span className="mb-1.5 text-sm text-slate-500">
                        {fr ? 'paiement unique' : 'one-time payment'}
                      </span>
                    </div>

                    <div className="mt-8 border-y border-slate-200">
                      {FEATURES[locale].map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-3 border-b border-slate-100 py-3.5 last:border-b-0"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#0683C9]">
                            <Check size={12} strokeWidth={3} />
                          </span>
                          <span className="text-sm leading-6 text-slate-700">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-6 text-sm font-semibold text-[#0683C9]">
                      {fr ? 'Livraison sous 48–72h ouvrées' : 'Delivery within 48–72 business hours'}
                    </p>

                    {offer.eligibility && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {offer.eligibility}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setSelected({
                          title: service.name,
                          audience: offer.audience,
                          market: locale,
                        })
                      }
                      className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0683C9] px-7 py-3.5 font-bold text-white shadow-[0_12px_28px_-16px_rgba(6,131,201,.85)] transition-all hover:-translate-y-0.5 hover:bg-[#056da8]"
                    >
                      {offer.cta}
                      <ArrowRight size={17} />
                    </button>

                    <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck size={14} className="text-[#0683C9]" />
                      {fr
                        ? 'Paiement sécurisé via PayPal après l’envoi du formulaire.'
                        : 'Secure PayPal payment after submitting the form.'}
                    </p>
                  </motion.article>
                );
              })}
            </div>

            <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-7 text-slate-500">
              {fr
                ? 'Le formulaire nous permet de comprendre votre situation avant le démarrage de l’accompagnement. Les mêmes informations sont demandées quel que soit le service choisi.'
                : 'The form helps us understand your situation before support begins. The same information is requested whichever service you choose.'}
            </p>
          </div>
        </section>
      </main>

      <Footer locale={locale} />

      <ServiceInquiryModal offer={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
