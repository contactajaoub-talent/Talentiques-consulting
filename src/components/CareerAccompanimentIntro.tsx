'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const CAREER_SERVICE_PATH = '/services/accompagnement-carriere-a-a-z';
export const quoteButton = 'inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#0683C9] px-7 py-3.5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#056da8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0683C9] motion-reduce:transform-none';
const stages = ['Positionnement & stratégie', 'Optimisation du dossier & du profil LinkedIn', 'Candidatures, prospection & relances', 'Suivi jusqu’aux entretiens'];

export function CareerAccompanimentIntro() {
  return <section className="border-y border-slate-200 bg-[#f8fbfe] py-14 lg:py-16" aria-labelledby="career-intro-title">
    <div className="container mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: .5 }}>
        <div className="mb-6 h-1 w-12 bg-[#D97706]" aria-hidden="true" />
        <h2 id="career-intro-title" className="font-heading text-3xl font-bold leading-tight tracking-tight text-[#0F3452] sm:text-4xl">Accompagnement carrière <span className="text-[#C96A08]">de A à Z</span></h2>
        <p className="mt-5 max-w-xl leading-7 text-slate-600">Nous prenons en charge l’exécution de votre recherche d’opportunités : positionnement, optimisation de votre image professionnelle, candidatures, prospection ciblée et suivi.</p>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">Vous restez concentré sur l’essentiel : vos entretiens et votre objectif professionnel.</p>
        <Link href={CAREER_SERVICE_PATH} className={`${quoteButton} mt-7`}>Demander mon devis <ArrowRight size={17} aria-hidden="true" /></Link>
      </motion.div>
      <ol className="self-center border-t border-slate-200">
        {stages.map((stage, i) => <motion.li key={stage} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: .4, delay: i * .06 }} className="flex items-center gap-5 border-b border-slate-200 py-5">
          <span className="font-heading text-2xl text-[#C96A08]" aria-hidden="true">0{i + 1}</span><span className="font-semibold leading-6 text-[#0F3452]">{stage}</span>
        </motion.li>)}
      </ol>
    </div>
  </section>;
}
