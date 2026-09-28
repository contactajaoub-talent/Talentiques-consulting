'use client';

import { motion } from 'framer-motion';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Credibility({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).credibility;
  return <section className="bg-slate-50 py-24 lg:py-28">
    <div className="container mx-auto px-5 md:px-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white px-6 py-10 shadow-sm sm:px-10 lg:px-14 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold uppercase tracking-[.2em] text-[#0683C9]">{copy.eyebrow}</span>
            <h2 className="mt-5 font-heading text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">{copy.title}</h2>
            <p className="mt-6 max-w-xl leading-7 text-slate-600">{copy.description}</p>
          </motion.div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {copy.items.map(([title, description], index) => <motion.article key={title} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="grid grid-cols-[2.5rem_1fr] gap-4 py-6">
              <span className="font-heading text-sm font-bold text-[#0683C9]">0{index + 1}</span>
              <div><h3 className="font-heading text-lg font-bold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>
            </motion.article>)}
          </div>
        </div>
      </div>
    </div>
  </section>;
}
