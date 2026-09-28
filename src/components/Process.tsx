'use client';

import { motion } from 'framer-motion';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Process({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).process;
  return <section id="process" className="relative overflow-hidden bg-white py-28">
    <div className="container relative z-10 mx-auto px-4 md:px-6">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-20 max-w-3xl text-center"><span className="mb-4 inline-block rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-600">{copy.eyebrow}</span><h2 className="mb-6 font-heading text-4xl font-bold text-slate-900 md:text-5xl">{copy.title}</h2><p className="mx-auto max-w-2xl text-lg font-light text-slate-600">{copy.description}</p></motion.div>
      <div className="relative"><div className="absolute left-0 top-12 hidden h-1.5 w-full rounded-full bg-gradient-to-r from-brand-100 via-brand-400 to-brand-100 opacity-30 md:block"/><div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-5">{copy.steps.map(([step, title, description], index) => <motion.article key={step} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08, duration: .5 }} className="group flex flex-col items-center text-center"><div className="relative mb-8"><div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-slate-100 bg-white font-heading text-2xl font-bold shadow-xl shadow-brand-900/5 transition-transform duration-300 group-hover:-translate-y-1"><span className="bg-gradient-to-br from-brand-500 to-blue-700 bg-clip-text text-transparent">{step}</span></div></div><h3 className="mb-4 font-heading text-xl font-bold text-slate-900">{title}</h3><p className="text-sm font-light leading-relaxed text-slate-500">{description}</p></motion.article>)}</div></div>
    </div>
  </section>;
}
