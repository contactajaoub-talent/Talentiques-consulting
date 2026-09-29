'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Services({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).services;
  const href = locale === 'fr' ? '/services' : '/en/services';

  const showcaseItems: Array<[string, string]> =
    locale === 'fr'
      ? [
          [
            'CV & candidature',
            'Renforcer la structure, le contenu et la présentation de vos supports.',
          ],
          [
            'LinkedIn & positionnement',
            'Construire une présence professionnelle cohérente avec votre objectif.',
          ],
          [
            'Cohérence de votre image professionnelle',
            'Aligner votre CV, LinkedIn et votre positionnement dans une même direction.',
          ],
        ]
      : [
          [
            'Resume & applications',
            'Strengthen the structure, content and presentation of your application materials.',
          ],
          [
            'LinkedIn & positioning',
            'Build a professional presence aligned with your goal.',
          ],
          [
            'Professional brand consistency',
            'Align your resume, LinkedIn and positioning in one coherent direction.',
          ],
        ];

  return (
    <section id="services" className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div
        className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-sky-100/45 blur-[110px]"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden border-y border-l-2 border-sky-200 border-l-[#E7A33A] bg-sky-50/55 px-0 py-10 sm:px-8 lg:px-10 lg:py-12"
          >
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/75 to-transparent"
              aria-hidden="true"
            />

            <div className="relative grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-16">
              <div>
                <span className="text-xs font-bold uppercase tracking-[.22em] text-[#C96A08]">
                  {copy.eyebrow}
                </span>

                <h2 className="mt-5 max-w-3xl font-heading text-4xl font-bold leading-[1.08] tracking-[-.035em] text-[#0F3452] md:text-5xl">
                  {locale === 'fr' ? (
                    <>
                      Optimisation complète de votre{' '}
                      <span className="text-[#D97706]">image professionnelle.</span>
                    </>
                  ) : (
                    <>
                      Complete optimization of your{' '}
                      <span className="text-[#D97706]">professional image.</span>
                    </>
                  )}
                </h2>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  {locale === 'fr'
                    ? 'CV, LinkedIn, positionnement et cohérence de candidature : Talentiques vous aide à construire une image professionnelle plus claire, crédible et adaptée à votre objectif.'
                    : 'Resume, LinkedIn, positioning and application consistency: Talentiques helps you build a clearer, stronger professional image aligned with your goals.'}
                </p>

                <Link
                  href={href}
                  className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#0683C9] transition hover:text-[#056da8]"
                >
                  {locale === 'fr' ? 'Découvrir nos offres' : 'Explore our services'}
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="border-t border-sky-200/80 lg:border-l lg:border-t-0 lg:pl-10">
                {showcaseItems.map(([title, description], index) => (
                  <div
                    key={title}
                    className="grid grid-cols-[2.8rem_1fr] gap-4 border-b border-sky-200/80 py-5 last:border-b-0"
                  >
                    <span className="font-heading text-xs font-bold tracking-[.16em] text-[#D97706]">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-slate-950">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
