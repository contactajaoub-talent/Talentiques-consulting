'use client';

import { motion } from 'framer-motion';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Credibility({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).credibility;

  return (
    <section className="relative overflow-hidden border-y border-slate-100 bg-slate-50/70 py-24 lg:py-28">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[52rem] -translate-x-1/2 rounded-full bg-sky-100/55 blur-[110px]"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-5 md:px-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[.22em] text-[#0683C9]">
            {copy.eyebrow}
          </span>
          <h2 className="mt-5 font-heading text-4xl font-bold leading-[1.12] tracking-[-.03em] text-slate-950 md:text-5xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            {copy.description}
          </p>
        </motion.header>

        <div className="mx-auto mt-14 max-w-6xl border-y border-slate-200 lg:mt-16">
          <div className="grid md:grid-cols-3">
            {copy.items.map(([title, description], index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative px-0 py-8 md:px-8 md:py-10"
              >
                {index > 0 && (
                  <div className="absolute inset-y-8 left-0 hidden w-px bg-slate-200 md:block" aria-hidden="true" />
                )}

                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#0683C9]" aria-hidden="true" />
                  <span className="font-heading text-xs font-bold tracking-[.18em] text-[#0683C9]">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold tracking-[-.02em] text-slate-950">
                  {title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
