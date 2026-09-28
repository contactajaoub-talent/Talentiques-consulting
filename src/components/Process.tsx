'use client';

import { motion } from 'framer-motion';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Process({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).process;
  return <section id="process" className="overflow-hidden bg-slate-50 py-24 lg:py-28">
    <div className="container mx-auto px-5 md:px-8">
      <motion.header initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-[.2em] text-[#0683C9]">{copy.eyebrow}</span>
        <h2 className="mt-5 font-heading text-4xl font-bold text-slate-950 md:text-5xl">{copy.title}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">{copy.description}</p>
      </motion.header>
      <div className="relative mx-auto mt-16 max-w-7xl">
        <div className="absolute bottom-8 left-[1.5rem] top-8 w-px bg-sky-200 md:bottom-auto md:left-[10%] md:right-[10%] md:top-6 md:h-px md:w-auto" aria-hidden="true"/>
        <div className="relative grid gap-8 md:grid-cols-5 md:gap-5">
          {copy.steps.map(([step, title, description], index) => <motion.article key={step} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="grid grid-cols-[3rem_1fr] gap-4 md:block md:text-center">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-50 bg-[#0683C9] font-heading text-xs font-bold text-white shadow-sm md:mx-auto">{step}</div>
            <div className="pt-1 md:pt-6"><h3 className="font-heading text-lg font-bold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
          </motion.article>)}
        </div>
      </div>
    </div>
  </section>;
}
