'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { content } from '@/lib/content';

export const Resources = () => (
  <section id="resources" className="py-24 bg-white">
    <div className="container mx-auto px-4 md:px-6">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <span className="text-brand-600 font-bold text-sm uppercase tracking-widest">Ressources</span>
        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-5 text-slate-900 font-heading">Apprendre gratuitement. Aller plus loin quand vous êtes prêt.</h2>
        <p className="text-lg text-slate-600">La bibliothèque est en cours de construction. La structure est prête pour accueillir progressivement des modèles, guides, checklists et kits.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl border border-slate-200 p-8 bg-slate-50/70">
          <div className="flex items-center gap-3 mb-7"><div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center"><Sparkles size={20}/></div><div><h3 className="text-2xl font-bold text-slate-900">Ressources gratuites</h3><p className="text-sm text-slate-500">Accès libre ou téléchargement gratuit</p></div></div>
          <div className="grid sm:grid-cols-2 gap-4">
            {content.resources.free.map((item) => { const Icon = item.icon; return <div key={item.title} className="bg-white border border-slate-200 rounded-2xl p-5"><Icon className="text-brand-600 mb-4" size={23}/><h4 className="font-bold text-slate-900 mb-2">{item.title}</h4><p className="text-sm text-slate-600 mb-4">{item.description}</p><span className="text-xs font-semibold text-brand-700">{item.status}</span></div>; })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .1 }} className="rounded-3xl border border-brand-200 p-8 bg-gradient-to-br from-white to-brand-50/50">
          <div className="flex items-center gap-3 mb-7"><div className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center"><LockKeyhole size={20}/></div><div><h3 className="text-2xl font-bold text-slate-900">Ressources payantes</h3><p className="text-sm text-slate-500">Kits et guides premium — détails à venir</p></div></div>
          <div className="space-y-4">
            {content.resources.paid.map((item) => <div key={item.title} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start justify-between gap-4"><div><h4 className="font-bold text-slate-900 mb-1">{item.title}</h4><p className="text-sm text-slate-600">{item.description}</p></div><span className="shrink-0 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{item.status}</span></div>)}
          </div>
        </motion.div>
      </div>
      <div className="text-center mt-10"><Link href="/ressources" className="inline-flex items-center gap-2 text-brand-700 font-bold hover:gap-3 transition-all">Voir l’espace ressources <ArrowRight size={18}/></Link></div>
    </div>
  </section>
);
