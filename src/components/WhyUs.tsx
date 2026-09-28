'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, Compass, ListChecks, Route } from 'lucide-react';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

const icons = [Compass, ListChecks, Route];

export function WhyUs({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).approach;
  return <section id="why-us" className="overflow-hidden bg-white py-24 lg:py-32">
    <div className="container mx-auto px-5 md:px-8">
      <div className="grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:items-start lg:gap-20">
        <motion.header initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:sticky lg:top-32">
          <span className="text-xs font-bold uppercase tracking-[.2em] text-[#0683C9]">{copy.eyebrow}</span>
          <h2 className="mt-5 max-w-xl font-heading text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">{copy.title}</h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">{copy.description}</p>
        </motion.header>
        <div className="grid gap-5 md:grid-cols-2">
          {copy.items.map(([title, description], index) => { const Icon = icons[index]; return <motion.article key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .07 }} className={`relative overflow-hidden rounded-[1.75rem] border p-7 sm:p-8 ${index === 0 ? 'border-[#0683C9] bg-[#0683C9] text-white md:row-span-2 md:flex md:min-h-[420px] md:flex-col md:justify-between' : 'border-slate-200 bg-slate-50 text-slate-950'}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index === 0 ? 'bg-white/15 text-white' : 'bg-white text-[#0683C9] shadow-sm'}`}><Icon size={23}/></div>
            <div className={index === 0 ? 'mt-20 md:mt-28' : 'mt-10'}><div className="flex items-center justify-between gap-4"><span className={`text-xs font-bold tracking-[.18em] ${index === 0 ? 'text-sky-100' : 'text-slate-400'}`}>0{index + 1}</span><ArrowDownRight size={18} className={index === 0 ? 'text-sky-100' : 'text-[#0683C9]'}/></div><h3 className="mt-4 font-heading text-2xl font-bold">{title}</h3><p className={`mt-3 leading-7 ${index === 0 ? 'text-sky-50' : 'text-slate-600'}`}>{description}</p></div>
          </motion.article>; })}
        </div>
      </div>
    </div>
  </section>;
}
