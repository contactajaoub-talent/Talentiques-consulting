'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ClipboardCheck, ExternalLink, FileText, LayoutDashboard, Layers3, Table2 } from 'lucide-react';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

const paidIcons = [FileText, LayoutDashboard, Layers3];
const freeIcons = [FileText, ClipboardCheck, BookOpen, Table2];

export function Resources({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).resources;
  return <section id="resources" className="bg-slate-50 py-24">
    <div className="container mx-auto px-4 md:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-14 max-w-3xl text-center"><span className="text-sm font-bold uppercase tracking-widest text-brand-600">{copy.eyebrow}</span><h2 className="mb-5 mt-4 font-heading text-4xl font-bold text-slate-900 md:text-5xl">{copy.title}</h2><p className="text-lg text-slate-600">{copy.description}</p></motion.div>

      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {copy.paid.map((resource, index) => { const Icon = paidIcons[index]; return <motion.article key={resource.id} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }} className="group flex min-h-[280px] flex-col rounded-3xl border border-brand-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><Icon size={22}/></div><h3 className="mt-6 font-heading text-2xl font-bold text-slate-900">{resource.name}</h3><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{resource.description}</p><Link href={resource.href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-700">{copy.discover}<ArrowRight size={16}/></Link></motion.article>; })}
        {copy.freeItems.map(([title, description], index) => { const Icon = freeIcons[index]; return <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index + 3) * .06 }} className="flex min-h-[250px] flex-col rounded-3xl border border-slate-200 bg-white p-7"><div className="flex items-center justify-between gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon size={22}/></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{copy.free}</span></div><h3 className="mt-6 font-heading text-xl font-bold text-slate-900">{title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{description}</p><span className="mt-5 text-sm font-bold text-brand-700">{copy.soon}</span></motion.article>; })}
      </div>

      <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mt-10 flex max-w-6xl flex-col items-start justify-between gap-6 rounded-3xl border border-brand-200 bg-white p-7 shadow-sm sm:p-9 lg:flex-row lg:items-center"><div><h3 className="font-heading text-3xl font-bold text-slate-900">Alternance Talentiques</h3><p className="mt-3 max-w-3xl leading-7 text-slate-600">{getHomeContent(locale).alternance.description}</p></div><a href="https://alternance.talentiques.com/" target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-600 px-6 py-4 font-bold text-white transition hover:bg-brand-700">{getHomeContent(locale).alternance.cta}<ExternalLink size={17}/></a></motion.article>
    </div>
  </section>;
}
