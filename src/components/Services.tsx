'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { content } from '@/lib/content';
import { cn } from '@/lib/utils';

export const Services = () => (
  <section id="services" className="py-24 bg-slate-50 relative overflow-hidden">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/30 rounded-full blur-[128px] pointer-events-none" />
    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
        <span className="block text-brand-600 font-bold text-sm uppercase tracking-widest mb-4">Services d’optimisation</span>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 font-heading tracking-tight">Deux offres simples. <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">La même exigence de qualité.</span></h2>
        <p className="text-lg text-slate-600 leading-relaxed">CV ATS, lettre de motivation, LinkedIn et tableau de suivi. Choisissez uniquement le tarif correspondant à votre situation.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 max-w-5xl mx-auto">
        {content.services.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.article key={service.title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .1 }} className={cn('relative bg-white border rounded-3xl p-8 md:p-10 shadow-sm flex flex-col', service.popular ? 'border-brand-300 ring-4 ring-brand-50 shadow-xl shadow-brand-900/5' : 'border-slate-200')}>
              {service.popular && <span className="absolute top-6 right-6 inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-100 px-3 py-1 text-xs font-bold text-brand-700"><Sparkles size={12}/>Recommandé</span>}
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6', service.popular ? 'bg-brand-600 text-white' : 'bg-slate-100 text-brand-700')}><Icon size={26}/></div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 font-heading">{service.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{service.audience}</p>
              <div className="flex items-end gap-3 mb-5"><span className="text-5xl font-bold text-slate-900">{service.price}</span><span className="text-sm text-slate-500 mb-2">paiement unique</span></div>
              <p className="text-slate-600 leading-relaxed mb-6">{service.description}</p>
              <p className="text-sm font-semibold text-brand-700 mb-6">{service.delay}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {service.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm text-slate-700"><span className="mt-0.5 p-1 rounded-full bg-brand-50 text-brand-600"><Check size={13} strokeWidth={3}/></span>{feature}</li>)}
              </ul>
              <a href={service.paypal} target="_blank" rel="noopener noreferrer" className={cn('w-full rounded-xl px-6 py-4 font-bold text-center flex items-center justify-center gap-2 transition-all', service.popular ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20' : 'border border-brand-200 text-brand-700 hover:bg-brand-50')}>
                {service.cta}<ArrowUpRight size={18}/>
              </a>
              <p className="mt-4 text-xs text-slate-500 flex items-center justify-center gap-2"><ShieldCheck size={14}/>Paiement sécurisé via PayPal</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  </section>
);
