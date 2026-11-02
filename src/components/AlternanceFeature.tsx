'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import type { HomeLocale } from '@/lib/home-content';
import { quoteButton } from './CareerAccompanimentIntro';
import styles from './home/CommercialSections.module.css';

export function AlternanceFeature({ locale = 'fr' }: { locale?: HomeLocale }) {
  const fr = locale === 'fr';
  const reduced = useReducedMotion();
  const platforms = fr ? [
    {
      title: 'Career Search 360', label: 'Recherche d’opportunités professionnelles',
      description: 'Une plateforme pour centraliser vos opportunités, préparer vos candidatures et piloter votre recherche d’emploi.',
      benefits: ['Suivi des opportunités et candidatures.', 'CV et positionnement professionnel.', 'Outils de recherche et de préparation.'],
      cta: 'Découvrir Career Search 360', href: '/career-search-360', external: false,
    },
    {
      title: 'Alternance Talentiques', label: 'Recherche d’alternance',
      description: 'Un espace spécialisé pour structurer votre recherche d’alternance, suivre vos candidatures et préparer vos démarches.',
      benefits: ['Positionnement et ciblage.', 'Suivi des candidatures.', 'Préparation aux entretiens.'],
      cta: 'Découvrir Alternance Talentiques', href: 'https://alternance.talentiques.com/', external: true,
    },
  ] : [
    {
      title: 'Career Search 360', label: 'Professional opportunity search',
      description: 'A platform to centralize your opportunities, prepare applications and manage your job search.',
      benefits: ['Opportunity and application tracking.', 'Resume and professional positioning.', 'Search and preparation tools.'],
      cta: 'Explore Career Search 360', href: '/career-search-360?lang=en', external: false,
    },
    {
      title: 'Alternance Talentiques', label: 'Work-study opportunity search',
      description: 'A dedicated space to structure your work-study search, track applications and prepare your next steps.',
      benefits: ['Positioning and targeting.', 'Application tracking.', 'Interview preparation.'],
      cta: 'Explore Alternance Talentiques', href: 'https://alternance.talentiques.com/', external: true,
    },
  ];

  return <section id="alternance" aria-labelledby="home-digital-title" className={styles.section + ' relative overflow-hidden bg-white py-12 lg:py-16'}>
    <div className="container relative mx-auto px-5 md:px-8"><div className="mx-auto max-w-7xl">
      <motion.header className={styles.reveal} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: reduced ? 0 : .35 }}>
        <span className={styles.headingRule} aria-hidden="true" />
        <h2 id="home-digital-title" className={styles.title}>{fr ? 'Nos solutions digitales' : 'Our Digital Solutions'}</h2>
        <p className={styles.intro}>{fr ? 'Des plateformes pour structurer vos démarches et piloter votre recherche d’opportunités.' : 'Platforms to organize your next steps and manage your search for opportunities.'}</p>
      </motion.header>
      <div className={styles.platforms}>{platforms.map((platform, index) => <motion.article key={platform.title} className={styles.platform + ' ' + styles.reveal} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reduced ? 0 : .35, delay: reduced ? 0 : index * .07 }}>
        <p className={styles.platformLabel}>{platform.label}</p>
        <h3 className={styles.offerTitle}>{platform.title}</h3>
        <p className={styles.description}>{platform.description}</p>
        <ul className={styles.benefits}>{platform.benefits.map((benefit, i) => <motion.li key={benefit} className={styles.reveal} initial={{ opacity: 0, y: 4 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : .25, delay: reduced ? 0 : i * .025 }}><Check size={16} aria-hidden="true" /><span>{benefit}</span></motion.li>)}</ul>
        <div className={styles.actions}>{platform.external ? <a href={platform.href} target="_blank" rel="noopener noreferrer" className={quoteButton + ' ' + styles.primary}><span>{platform.cta}</span><ArrowUpRight size={17} aria-hidden="true" /></a> : <Link href={platform.href} className={quoteButton + ' ' + styles.primary}><span>{platform.cta}</span><ArrowRight size={17} aria-hidden="true" /></Link>}</div>
      </motion.article>)}</div>
    </div></div>
  </section>;
}