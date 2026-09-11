'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Globe2 } from 'lucide-react';
import { content } from '@/lib/content';

export const Accompaniment = () => (
  <section id="accompagnement" className="py-24 bg-slate-950 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,131,201,.18),transparent_38%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,.12),transparent_38%)]" />
    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="inline-flex items-center gap-2 text-brand-300 font-bold text-sm uppercase tracking-widest"><Globe2 size={17}/>Accompagnement personnalisé</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-5 mb-6 font-heading">{content.accompaniment.title}</h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">{content.accompaniment.description}</p>
          <div className="flex flex-wrap gap-2 mb-8">{content.accompaniment.markets.map((market) => <span key={market} className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-slate-200">{market}</span>)}</div>
          <Link href="/accompagnement" className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-950 px-6 py-3.5 font-bold hover:bg-brand-50 transition-colors">Découvrir l’accompagnement <ArrowRight size={18}/></Link>
        </motion.div>
        <div className="space-y-4">
          {content.accompaniment.tracks.map((track, index) => <motion.div key={track.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"><div className="flex items-start gap-4"><CheckCircle2 className="text-brand-300 mt-1 shrink-0" size={20}/><div><h3 className="font-bold text-xl mb-2">{track.title}</h3><p className="text-slate-300 text-sm leading-relaxed">{track.description}</p></div></div></motion.div>)}
        </div>
      </div>
    </div>
  </section>
);
