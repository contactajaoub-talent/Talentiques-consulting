'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Hero({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale);
  return <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden bg-white pt-24">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
      <div className="absolute left-1/2 top-0 h-[380px] w-[900px] -translate-x-1/2 rounded-[50%] bg-brand-500/5 blur-[100px]" />
    </div>
    <div className="container relative z-20 mx-auto flex max-w-5xl flex-col items-center px-4 text-center md:px-6">
      <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6 block text-sm font-bold uppercase tracking-widest text-brand-600">{copy.hero.eyebrow}</motion.span>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="mb-8 max-w-4xl font-heading text-5xl font-bold leading-[1.08] tracking-tight text-slate-900 md:text-7xl lg:text-8xl">{copy.hero.title}</motion.h1>
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mb-10 max-w-3xl text-lg font-light leading-relaxed text-slate-600 md:text-xl">{copy.hero.description}</motion.p>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="flex flex-col items-center gap-4 sm:flex-row">
        <Link href={locale === 'fr' ? '/#resources' : '/en#resources'} className="group flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-brand-600/20 transition-all hover:bg-brand-700 md:text-lg">{copy.resourcesCta}<ArrowRight size={20} className="transition-transform group-hover:translate-x-1"/></Link>
        <Link href={locale === 'fr' ? '/#why-us' : '/en#why-us'} className="rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-700 hover:shadow-lg md:text-lg">{copy.hero.secondary}</Link>
      </motion.div>
    </div>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
  </section>;
}
