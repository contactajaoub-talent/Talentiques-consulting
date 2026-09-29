'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HeroAnimation } from '@/components/HeroAnimation';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Hero({ locale = 'fr' }: { locale?: HomeLocale }) {
  const copy = getHomeContent(locale);
  const prefix = locale === 'fr' ? '' : '/en';

  return (
    <section className="relative flex min-h-[84vh] items-center overflow-hidden bg-white pb-20 pt-32 sm:pt-36 lg:min-h-[820px] lg:pb-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0683c90a_1px,transparent_1px),linear-gradient(to_bottom,#0683c90a_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_72%_62%_at_50%_5%,#000_62%,transparent_100%)]" />
        <HeroAnimation />
        <motion.div
          className="absolute left-1/2 top-4 h-[360px] w-[820px] -translate-x-1/2 rounded-[50%] bg-[#0683C9]/[0.055] blur-[115px]"
          animate={{ scale: [1, 1.04, 1], opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -left-24 bottom-8 h-72 w-72 rounded-full bg-sky-100/45 blur-[105px]"
          animate={{ x: [0, 22, 0], y: [0, -12, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-20 top-32 h-80 w-80 rounded-full bg-blue-100/40 blur-[115px]"
          animate={{ x: [0, -18, 0], y: [0, 14, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-5 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 block text-xs font-bold uppercase tracking-[.22em] text-[#0683C9] sm:text-sm"
          >
            {copy.hero.eyebrow}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-heading text-[2.85rem] font-bold leading-[1.04] tracking-[-.04em] text-slate-950 sm:text-6xl lg:text-[4.7rem] xl:text-[5.35rem]"
          >
            {copy.hero.titleStart}{' '}
            <span className="bg-gradient-to-r from-[#0683C9] via-[#0A9DDB] to-[#2457C5] bg-clip-text text-transparent">
              {copy.hero.titleHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-7 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg"
          >
            {copy.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap"
          >
            <Link
              href={`${prefix}/#services`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#0683C9] px-7 py-3.5 font-bold text-white shadow-[0_12px_30px_-16px_rgba(6,131,201,.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#056da8]"
            >
              {copy.hero.servicesCta}
              <ArrowRight size={18} />
            </Link>

            <Link
              href={locale === 'fr' ? '/outils' : '/en/tools'}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/90 px-7 py-3.5 font-bold text-slate-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0683C9] hover:text-[#0683C9]"
            >
              {copy.hero.toolsCta}
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/diagnostic-cv-ats"
              className="inline-flex min-h-12 items-center justify-center px-4 py-3.5 text-sm font-bold text-[#0683C9] underline decoration-sky-200 underline-offset-4 transition hover:decoration-[#0683C9]"
            >
              {copy.diagnosticCta}
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
