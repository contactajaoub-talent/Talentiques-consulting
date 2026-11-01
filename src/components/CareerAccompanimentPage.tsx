'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { MotionConfig, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Compass, FileCheck2, Search, Send, Users, ChartNoAxesCombined } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { EmployerLogoMarquee } from './EmployerLogoMarquee';
import { AccompanimentLeadForm } from './AccompanimentLeadForm';
import { quoteButton } from './CareerAccompanimentIntro';
import laptop from './PublicLaptop.module.css';
import type { countryOptions } from '@/lib/services/career-quote';

const services = [
  { icon: Compass, title: 'Positionnement & stratégie', text: 'Clarification de votre objectif, de vos priorités, des postes ciblés et du plan d’action.' },
  { icon: FileCheck2, title: 'Optimisation de l’image professionnelle', text: 'Refonte ou ajustement du CV, optimisation du profil LinkedIn et amélioration de la cohérence de votre positionnement.' },
  { icon: Search, title: 'Recherche ciblée d’opportunités', text: 'Identification d’offres, d’entreprises, d’institutions et d’organisations en lien avec votre objectif.' },
  { icon: Send, title: 'Adaptation des candidatures', text: 'Personnalisation des candidatures en fonction du poste, du secteur et du type d’organisation.' },
  { icon: Users, title: 'Prospection & relances', text: 'Identification des bons interlocuteurs, préparation des prises de contact et suivi des relances.' },
  { icon: ChartNoAxesCombined, title: 'Pilotage & suivi', text: 'Organisation du suivi, visibilité sur les actions menées et accompagnement jusqu’à progression concrète.' },
];
const stages = [
  ['Qualification du besoin', 'Nous analysons votre situation, votre niveau d’expérience et votre objectif.'],
  ['Positionnement stratégique', 'Nous clarifions votre cible, votre discours et vos priorités.'],
  ['Optimisation du dossier', 'CV, LinkedIn et éléments de candidature sont ajustés selon vos objectifs.'],
  ['Déploiement opérationnel', 'Recherche d’opportunités, candidatures ciblées, prospection et relances.'],
  ['Suivi et ajustements', 'Nous suivons les retours, les actions menées et ajustons lorsque nécessaire.'],
  ['Préparation aux entretiens', 'Vous vous concentrez sur les entretiens pendant que le cadre de recherche reste piloté.'],
];
const roles = [
  { title: 'Votre rôle', items: ['Définir votre objectif', 'Partager vos informations et documents', 'Valider les orientations importantes', 'Préparer et passer les entretiens'] },
  { title: 'Notre rôle', items: ['Structurer la stratégie', 'Optimiser votre image professionnelle', 'Cibler les opportunités', 'Adapter les candidatures', 'Organiser la prospection', 'Assurer le suivi et les relances'] },
];
const audience = ['Vous manquez de temps pour piloter votre recherche seul', 'Vous voulez une démarche structurée', 'Vous souhaitez déléguer une partie opérationnelle', 'Vous recherchez un emploi, un stage, un stage PFE, une alternance ou une évolution', 'Vous voulez gagner en clarté et en efficacité', 'Vous cherchez un accompagnement humain et concret'];
const faq = [
  ['À qui s’adresse cet accompagnement ?', 'Aux étudiants et professionnels qui souhaitent structurer leur recherche et déléguer une partie de son exécution. Le périmètre est défini après étude du profil.'],
  ['Est-ce que Talentiques réalise les candidatures avec moi ?', 'Nous préparons et adaptons les candidatures, puis organisons leur déploiement selon le périmètre convenu avec vous. Vous validez les orientations importantes.'],
  ['Puis-je demander cet accompagnement pour un stage ou un PFE ?', 'Oui. La démarche peut être adaptée à un stage, un stage PFE ou une alternance, selon votre objectif et votre calendrier.'],
  ['Comment se fait le suivi ?', 'Les actions, les retours et les ajustements sont partagés selon des modalités définies ensemble au démarrage.'],
  ['Le devis est-il personnalisé ?', 'Oui. Il tient compte de votre profil, de vos objectifs et du périmètre d’intervention. L’accompagnement ne garantit pas une embauche.'],
];
const container = 'container mx-auto max-w-7xl px-5 md:px-8';
const titleClass = 'font-heading text-3xl font-bold leading-tight tracking-tight text-[#0F3452] sm:text-4xl';

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .45, delay }} className={className}>{children}</motion.div>;
}
function QuoteLink() {
  return <a href="#demande-accompagnement" className={quoteButton}>Demander mon devis <ArrowRight size={17} aria-hidden="true" /></a>;
}

export function CareerAccompanimentPage({ countries, quoteEnabled = false }: { countries: ReturnType<typeof countryOptions>; quoteEnabled?: boolean }) {
  return <MotionConfig reducedMotion="user"><div className={`${laptop.page} min-h-screen bg-white text-slate-900`}>
    <Navbar locale="fr" />
    <main>
      <section className="pb-14 pt-28 sm:pt-32 lg:pb-16">
        <div className={container}>
          <Link href="/services" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-bold text-[#0369a1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"><ArrowLeft size={16} aria-hidden="true" />Retour aux services</Link>
          <Reveal className="mt-7 max-w-4xl">
            <div className="mb-6 h-1 w-16 bg-[#D97706]" aria-hidden="true" />
            <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-[-.04em] text-[#0F3452] sm:text-5xl lg:text-6xl">Accompagnement carrière<br /> <span className="text-[#C96A08]">de A à Z</span></h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Vous nous transmettez votre objectif. Nous prenons en charge la structuration et l’exécution de votre recherche : positionnement, optimisation, candidatures, prospection ciblée et suivi.</p>
            <p className="mt-4 max-w-2xl leading-7 text-slate-600">Une solution conçue pour les profils qui souhaitent avancer avec méthode, gagner du temps et bénéficier d’un accompagnement concret.</p>
            <div className="mt-8"><QuoteLink /></div>
          </Reveal>
        </div>
      </section>

      <section aria-label="L’expérience Talentiques" className="border-t border-slate-200">
        <div className={`${container} grid divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0`}>
          {/* Indicateurs fournis par Talentiques ; taux déclaré, sans garantie de résultat individuel. */}
          {[['Depuis 2024', 'Des profils aux parcours variés'], ['+500', 'Professionnels accompagnés'], ['+80 %', 'Taux de réussite déclaré']].map(([value, label], i) => <Reveal key={value} delay={i * .06} className="py-8 text-center sm:px-5 sm:py-10"><p className="font-heading text-4xl font-semibold tracking-tight text-[#0F3452]">{value}</p><p className="mt-2 text-sm text-slate-600">{label}</p></Reveal>)}
        </div>
        <EmployerLogoMarquee locale="fr" />
      </section>

      <section className="py-14 lg:py-20" aria-labelledby="care-title">
        <div className={container}>
          <Reveal><h2 id="care-title" className={titleClass}>Ce que nous prenons en charge</h2></Reveal>
          <div className="mt-9 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={(i % 3) * .05} className="group border-t border-slate-200 py-7 transition-colors hover:border-[#0683C9]">
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" className="mb-5 text-[#0683C9] transition-transform group-hover:-translate-y-1 motion-reduce:transform-none" />
              <h3 className="font-heading text-xl font-semibold leading-7 text-[#0F3452]">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
            </Reveal>)}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f8fbfe] py-14 lg:py-20" aria-labelledby="stages-title">
        <div className={container}>
          <Reveal><h2 id="stages-title" className={titleClass}>Les étapes de l’accompagnement</h2></Reveal>
          <ol className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">{stages.map(([title, text], i) => <li key={title}><Reveal delay={(i % 3) * .05} className="relative border-l border-slate-300 pl-6"><span className="absolute -left-[4px] top-2 h-[7px] w-[7px] rounded-full bg-[#D97706]" aria-hidden="true" /><span className="font-heading text-3xl font-medium text-[#C96A08]" aria-hidden="true">0{i + 1}</span><h3 className="mt-3 font-heading text-xl font-semibold text-[#0F3452]">{title}</h3><p className="mt-2 max-w-sm text-sm leading-7 text-slate-600">{text}</p></Reveal></li>)}</ol>
        </div>
      </section>

      <section className="py-14 lg:py-20" aria-labelledby="roles-title"><div className={container}>
        <Reveal><h2 id="roles-title" className={`${titleClass} max-w-3xl`}>Un accompagnement clair, avec un rôle bien défini</h2></Reveal>
        <div className="mt-9 grid border-y border-slate-200 md:grid-cols-2">{roles.map((role, i) => <Reveal key={role.title} className={`py-8 md:py-10 ${i ? 'border-t border-slate-200 md:border-l md:border-t-0 md:pl-10' : 'md:pr-10'}`}>
          <h3 className="font-heading text-2xl font-semibold text-[#0F3452]">{role.title}</h3><ul className="mt-5 space-y-4">{role.items.map(item => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600"><Check size={17} className="mt-1 shrink-0 text-[#0683C9]" aria-hidden="true" />{item}</li>)}</ul>
        </Reveal>)}</div>
      </div></section>

      <section className="pb-14 lg:pb-20" aria-labelledby="audience-title"><div className={`${container} grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-14`}>
        <Reveal><h2 id="audience-title" className={titleClass}>Cet accompagnement est fait pour vous si…</h2></Reveal>
        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{audience.map(item => <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-600"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D97706]" aria-hidden="true" />{item}</li>)}</ul>
      </div></section>

      <AccompanimentLeadForm countries={countries} enabled={quoteEnabled} />

      <section className="py-14 lg:py-20" aria-labelledby="faq-title"><div className="container mx-auto max-w-5xl px-5 md:px-8">
        <Reveal><h2 id="faq-title" className={titleClass}>Quelques réponses à vos questions</h2></Reveal>
        <div className="mt-8 border-t border-slate-200">{faq.map(([question, answer]) => <details key={question} className="group border-b border-slate-200"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 rounded py-5 text-sm font-semibold leading-6 text-[#0F3452] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0683C9] [&::-webkit-details-marker]:hidden"><h3 className="font-inherit">{question}</h3><span aria-hidden="true" className="shrink-0 text-xl font-normal text-[#0683C9] transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span></summary><p className="max-w-3xl pb-6 text-sm leading-7 text-slate-600">{answer}</p></details>)}</div>
      </div></section>

      <section className="border-t border-slate-200 bg-[#f8fbfe] py-12 lg:py-14"><div className={`${container} flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center`}>
        <div className="max-w-2xl"><h2 className="font-heading text-2xl font-semibold leading-tight text-[#0F3452] sm:text-3xl">Besoin d’un accompagnement structuré pour votre recherche ?</h2><p className="mt-4 text-sm leading-7 text-slate-600">Partagez votre besoin et notre équipe reviendra vers vous avec la suite la plus adaptée.</p></div><div className="shrink-0"><QuoteLink /></div>
      </div></section>
    </main>
    <Footer locale="fr" />
  </div></MotionConfig>;
}
