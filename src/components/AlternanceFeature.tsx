'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function AlternanceFeature({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).alternance;
  return <section id="alternance" className="bg-white py-24 lg:py-28">
    <div className="container mx-auto px-5 md:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] border border-sky-200 bg-gradient-to-br from-[#eef9ff] via-white to-[#fff8ef] px-6 py-10 shadow-[0_30px_80px_-50px_rgba(6,131,201,.45)] sm:px-10 lg:px-14 lg:py-14">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[#F59E0B]" aria-hidden="true"/>
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[44px] border-orange-100/70" aria-hidden="true"/>
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-[.2em] text-[#C56A08]">{copy.eyebrow}</span>
            <h2 className="mt-4 font-heading text-4xl font-bold text-slate-950 sm:text-5xl">{copy.title}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{copy.description}</p>
            <a href="https://alternance.talentiques.com/" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0683C9] px-6 py-3.5 font-bold text-white transition hover:bg-[#056da8]">{copy.cta}<ArrowUpRight size={18}/></a>
          </div>
          <div className="relative rounded-[1.75rem] border border-white bg-white/90 p-6 shadow-xl shadow-sky-950/5 sm:p-8">
            <div className="mb-6 flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]"/><span className="text-xs font-bold uppercase tracking-[.17em] text-slate-500">Alternance Talentiques</span></div>
            <div className="space-y-4">{copy.items.map((item, index) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#C56A08]"><Check size={15} strokeWidth={3}/></span><span className="font-semibold text-slate-800">{item}</span><span className="ml-auto font-heading text-xs font-bold text-slate-300">0{index + 1}</span></div>)}</div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>;
}
