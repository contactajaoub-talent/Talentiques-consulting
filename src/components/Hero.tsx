'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { HeroAnimation } from '@/components/HeroAnimation';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Hero({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale);
  const prefix = locale === 'fr' ? '' : '/en';

  return <section className="relative overflow-hidden bg-white pb-20 pt-32 sm:pt-36 lg:flex lg:min-h-[790px] lg:items-center lg:pb-24">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0683c90a_1px,transparent_1px),linear-gradient(to_bottom,#0683c90a_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_75%_68%_at_62%_16%,#000_60%,transparent_100%)]"/>
      <HeroAnimation/>
      <motion.div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-[#0683C9]/10 blur-[100px]" animate={{ x: [0, -24, 0], y: [0, 18, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}/>
      <motion.div className="absolute bottom-10 left-[38%] h-64 w-64 rounded-full bg-blue-200/20 blur-[110px]" animate={{ x: [0, 20, 0], y: [0, -16, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}/>
    </div>

    <div className="container relative z-10 mx-auto px-5 md:px-8">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(380px,.88fr)] lg:gap-16 xl:gap-24">
        <div className="max-w-3xl">
          <motion.span initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-6 block text-xs font-bold uppercase tracking-[.2em] text-[#0683C9] sm:text-sm">{copy.hero.eyebrow}</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="font-heading text-[2.65rem] font-bold leading-[1.04] tracking-[-.035em] text-slate-950 sm:text-6xl lg:text-[4.4rem] xl:text-[5rem]">
            {copy.hero.titleStart}{' '}<span className="bg-gradient-to-r from-[#0683C9] to-[#1d4ed8] bg-clip-text text-transparent">{copy.hero.titleHighlight}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{copy.hero.description}</motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={`${prefix}/#services`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0683C9] px-6 py-3.5 font-bold text-white shadow-lg shadow-sky-900/10 transition hover:bg-[#056da8]">{copy.hero.servicesCta}<ArrowRight size={18}/></Link>
            <Link href={locale === 'fr' ? '/outils' : '/en/tools'} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-800 transition hover:border-[#0683C9] hover:text-[#0683C9]">{copy.hero.toolsCta}<ArrowRight size={18}/></Link>
            <Link href="/diagnostic-cv-ats" className="inline-flex min-h-12 items-center justify-center px-3 py-3.5 text-sm font-bold text-[#0683C9] underline decoration-sky-200 underline-offset-4 transition hover:decoration-[#0683C9]">{copy.diagnosticCta}</Link>
          </motion.div>
        </div>

        <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .18, duration: .65 }} className="relative mx-auto w-full max-w-xl" aria-label={copy.hero.visualLabel}>
          <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-sky-100/70 via-white to-blue-100/60 blur-2xl"/>
          <div className="relative overflow-hidden rounded-[2rem] border border-sky-100 bg-white/95 p-5 shadow-[0_28px_70px_-36px_rgba(15,52,82,.35)] sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <p className="text-xs font-bold tracking-[.18em] text-[#0683C9]">{copy.hero.visualLabel}</p>
              <span className="h-2.5 w-2.5 rounded-full bg-[#0683C9]"/>
            </div>
            <div className="space-y-3 pt-5">
              {copy.hero.visualItems.map(([title, description], index) => <div key={title} className={`group flex items-start gap-4 rounded-2xl border p-4 sm:p-5 ${index === 1 ? 'ml-0 border-sky-200 bg-sky-50/70 sm:ml-7' : index === 2 ? 'mr-0 border-slate-200 bg-white sm:mr-7' : 'border-slate-200 bg-white'}`}>
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0683C9] text-white"><Check size={15} strokeWidth={3}/></span>
                <div><p className="font-heading text-lg font-bold text-slate-900">{title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div>
              </div>)}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  </section>;
}
