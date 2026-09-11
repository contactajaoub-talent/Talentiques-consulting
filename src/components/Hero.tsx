'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { content } from '@/lib/content';
import { HeroAnimation } from './HeroAnimation';

export const Hero = () => {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-24 bg-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
        <HeroAnimation />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-brand-500/5 blur-[100px] rounded-[50%]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-20 flex flex-col items-center text-center max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
  <span className="text-brand-600 font-bold text-sm uppercase tracking-widest mb-6 block">
    {content.hero.badge}
  </span>
</motion.div>

        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 text-slate-900 leading-[1.08] font-heading">
          {content.hero.title.part1}<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-blue-600 to-brand-700">{content.hero.title.highlight}</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl leading-relaxed font-light">
          {content.hero.description}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="flex flex-col sm:flex-row items-center gap-4 mb-10">
          <Link href="/diagnostic-cv-ats" className="group px-8 py-4 rounded-full bg-brand-600 text-white font-bold text-base md:text-lg shadow-xl shadow-brand-600/20 hover:bg-brand-700 transition-all flex items-center gap-2">
            {content.hero.cta}<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/#services" className="px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-base md:text-lg hover:border-brand-300 hover:text-brand-700 hover:shadow-lg transition-all">
            Découvrir nos offres
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .32 }} className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-600">
          {['Diagnostic CV ATS gratuit', 'Ressources pratiques', 'Services personnalisés', 'Marchés francophones'].map((item) => (
            <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-brand-600" />{item}</span>
          ))}
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
};
