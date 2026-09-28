'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, FileSignature, GraduationCap, MessagesSquare } from 'lucide-react';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

const icons = [FileSignature, GraduationCap, MessagesSquare];

export function Services({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale).services;
  const contactHref = locale === 'fr' ? '/#contact' : '/en#contact';

  return <section id="services" className="overflow-hidden bg-white py-24 lg:py-32">
    <div className="container mx-auto px-5 md:px-8">
      <motion.header initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-[.2em] text-[#0683C9]">{copy.eyebrow}</span>
        <h2 className="mt-5 font-heading text-4xl font-bold leading-tight text-slate-950 md:text-5xl">{copy.title}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">{copy.description}</p>
      </motion.header>
      <div className="mx-auto mt-14 grid max-w-7xl gap-6 lg:grid-cols-3">
        {copy.cards.map((service, index) => { const Icon = icons[index]; return <motion.article key={service.title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className={`flex flex-col rounded-[1.75rem] border p-7 sm:p-8 ${index === 0 ? 'border-sky-200 bg-sky-50/60 shadow-[0_24px_55px_-38px_rgba(6,131,201,.55)]' : 'border-slate-200 bg-white shadow-sm'}`}>
          <div className="flex items-start justify-between gap-4"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index === 0 ? 'bg-[#0683C9] text-white' : 'bg-slate-100 text-[#0683C9]'}`}><Icon size={23}/></div><span className="max-w-[70%] text-right text-[11px] font-bold uppercase leading-5 tracking-[.12em] text-slate-500">{service.audience}</span></div>
          <h3 className="mt-8 font-heading text-2xl font-bold leading-tight text-slate-950">{service.title}</h3>
          <p className="mt-4 leading-7 text-slate-600">{service.description}</p>
          <ul className="mt-7 flex-1 space-y-3">{service.points.map(point => <li key={point} className="flex items-start gap-3 text-sm text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[#0683C9]"><Check size={12} strokeWidth={3}/></span>{point}</li>)}</ul>
          <Link href={contactHref} className="mt-8 inline-flex items-center gap-2 border-t border-slate-200 pt-5 text-sm font-bold text-[#0683C9] transition hover:text-[#056da8]">{service.cta}<ArrowRight size={16}/></Link>
        </motion.article>; })}
      </div>
    </div>
  </section>;
}
