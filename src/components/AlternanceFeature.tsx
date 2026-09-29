'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function AlternanceFeature({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).alternance;

  return (
    <section id="alternance" className="relative overflow-hidden bg-white py-14 lg:py-20">
      <div
        className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-orange-100/45 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-sky-100/55 blur-[110px]"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-7xl border-y border-slate-200 py-9 sm:py-11 lg:py-12"
        >
          <div className="grid items-center gap-12 lg:grid-cols-[1.06fr_.94fr] lg:gap-20">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-[.22em] text-[#C96A08]">
                  {copy.eyebrow}
                </span>
              </div>

              <h2 className="font-heading text-4xl font-bold tracking-[-.03em] text-[#D97706] sm:text-5xl">
                {copy.title}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                {copy.description}
              </p>

              <a
                href="https://alternance.talentiques.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0683C9] px-6 py-3.5 font-bold text-white shadow-[0_12px_28px_-16px_rgba(6,131,201,.85)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#056da8]"
              >
                {copy.cta}
                <ArrowUpRight size={18} />
              </a>
            </div>

            <div className="relative pl-7 sm:pl-9">
              <div className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-[#F59E0B] via-orange-200 to-sky-200" aria-hidden="true" />

              <div className="space-y-8">
                {copy.items.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="relative"
                  >
                    <span
                      className="absolute -left-7 top-1.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#F59E0B] shadow-[0_0_0_1px_rgba(245,158,11,.28)] sm:-left-9"
                      aria-hidden="true"
                    />
                    <span className="font-heading text-xs font-bold tracking-[.18em] text-[#B86307]">
                      0{index + 1}
                    </span>
                    <p className="mt-2 font-heading text-xl font-bold tracking-[-.02em] text-slate-900">
                      {item}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
