'use client';

import { motion } from 'framer-motion';
import { Palette, Target, TrendingUp, Users } from 'lucide-react';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

const icons = [Target, Palette, Users, TrendingUp];

export function WhyUs({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).approach;
  return <section id="why-us" className="relative overflow-hidden bg-white py-24">
    <div className="container mx-auto px-4 md:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-16 max-w-3xl text-center"><h2 className="mb-6 font-heading text-3xl font-bold text-slate-900 md:text-5xl">{copy.title}</h2><p className="text-lg text-slate-600">{copy.description}</p></motion.div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">{copy.items.map(([title, description], index) => { const Icon = icons[index]; return <motion.article key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08, duration: .5 }} className="group rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"><div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white"><Icon size={28}/></div><h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-brand-700">{title}</h3><p className="text-sm leading-relaxed text-slate-600">{description}</p></motion.article>; })}</div>
    </div>
  </section>;
}
