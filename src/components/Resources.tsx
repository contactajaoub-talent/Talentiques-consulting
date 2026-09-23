'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { content } from '@/lib/content';

export const Resources = () => (
  <section id="resources" className="bg-white py-24">
    <div className="container mx-auto px-4 md:px-6">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <span className="text-sm font-bold uppercase tracking-widest text-brand-600">
          Ressources
        </span>

        <h2 className="mt-4 mb-5 font-heading text-4xl font-bold text-slate-900 md:text-5xl">
          Apprendre gratuitement. Aller plus loin quand vous êtes prêt.
        </h2>

        <p className="text-lg text-slate-600">
          Découvrez nos ressources gratuites et nos outils premium pour
          structurer votre recherche, améliorer votre candidature et passer à
          l’action.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-slate-200 bg-slate-50/70 p-8"
        >
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Sparkles size={20} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Ressources gratuites
              </h3>
              <p className="text-sm text-slate-500">
                Accès libre ou téléchargement gratuit
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {content.resources.free.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <Icon className="mb-4 text-brand-600" size={23} />
                  <h4 className="mb-2 font-bold text-slate-900">{item.title}</h4>
                  <p className="mb-4 text-sm text-slate-600">
                    {item.description}
                  </p>
                  <span className="text-xs font-semibold text-brand-700">
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-brand-200 bg-gradient-to-br from-white to-brand-50/50 p-8"
        >
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Outils premium
              </h3>
              <p className="text-sm text-slate-500">
                Paiement unique · accès immédiat
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {content.resources.paid.map((item) => (
              <div
                key={item.title}
                className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-md"
              >
                <div>
                  <h4 className="mb-1 font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-600">{item.description}</p>
                  <div className="mt-3 text-sm font-black text-brand-700">
                    {item.status}
                  </div>
                </div>

                <Link
                  href={item.href}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-700 hover:shadow-md"
                >
                  Découvrir
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/outils"
          className="inline-flex items-center gap-2 font-bold text-brand-700 transition-all hover:gap-3"
        >
          Voir tous les outils TalentiQues
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  </section>
);
