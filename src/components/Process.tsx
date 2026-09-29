'use client';

import { motion } from 'framer-motion';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Process({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).process;

  return (
    <section id="process" className="relative overflow-hidden bg-slate-50/80 py-16 lg:py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[54rem] -translate-x-1/2 rounded-full bg-white blur-[110px]"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid gap-7 border-b border-slate-200 pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16 lg:pb-12"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-[.22em] text-[#0683C9]">
                {copy.eyebrow}
              </span>
              <h2 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-[1.12] tracking-[-.03em] text-[#0F3452] md:text-5xl">
              {locale === 'fr' ? (
                <>Une méthode claire pour passer <span className="text-[#0683C9]">de l’objectif à l’action.</span></>
              ) : (
                <>A clear method to move <span className="text-[#0683C9]">from objective to action.</span></>
              )}
            </h2>
            </div>

            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:justify-self-end">
              {copy.description}
            </p>
          </motion.header>

          <div className="relative mt-12 lg:mt-14">
            <div
              className="absolute bottom-0 left-[0.43rem] top-0 w-px bg-slate-200 sm:left-[0.47rem]"
              aria-hidden="true"
            />
            <motion.div
              className="absolute left-[0.43rem] top-0 h-full w-px origin-top bg-[#0683C9] sm:left-[0.47rem]"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              aria-hidden="true"
            />

            <div className="divide-y divide-slate-200">
              {copy.steps.map(([step, title, description], index) => (
                <motion.article
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="group relative grid gap-5 py-8 pl-8 sm:pl-10 md:grid-cols-[5rem_minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-start md:gap-8 lg:py-9"
                >
                  <span
                    className="absolute left-0 top-[2.45rem] h-3.5 w-3.5 rounded-full border-[3px] border-slate-50 bg-[#0683C9] shadow-[0_0_0_1px_rgba(6,131,201,.22)] transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  />

                  <div className="flex items-center gap-3 md:block">
                    <span className="font-heading text-xs font-bold tracking-[.18em] text-[#0683C9]">
                      {step}
                    </span>
                    <span className="h-px w-7 bg-sky-200 md:mt-4 md:block md:w-8" aria-hidden="true" />
                  </div>

                  <h3 className="font-heading text-2xl font-bold tracking-[-.02em] text-slate-950 md:text-[1.7rem]">
                    {title}
                  </h3>

                  <p className="max-w-2xl text-base leading-7 text-slate-600">
                    {description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
