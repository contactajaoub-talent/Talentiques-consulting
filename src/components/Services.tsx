'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import type { HomeLocale } from '@/lib/home-content';
import { CAREER_SERVICE_PATH, quoteButton } from './CareerAccompanimentIntro';
import styles from './home/CommercialSections.module.css';

export function Services({ locale = 'fr' }: { locale?: HomeLocale }) {
  const fr = locale === 'fr';
  const reduced = useReducedMotion();
  const offers = fr ? [
    {
      title: 'Optimisation de votre image professionnelle',
      description: 'Nous préparons un dossier professionnel complet, ciblé et prêt à être utilisé pour vos candidatures.',
      benefits: ['CV optimisé ATS.', 'Lettre de motivation personnalisée.', 'Optimisation du profil LinkedIn.', 'Cohérence du positionnement professionnel.'],
      nature: 'Prestation ponctuelle réalisée par notre équipe.',
      cta: 'Voir les formules', href: '/services',
    },
    {
      title: 'Accompagnement carrière de A à Z',
      description: 'Nous prenons en charge votre recherche d’opportunités : stratégie, candidatures, prospection, relances et suivi.',
      benefits: ['Positionnement et stratégie.', 'Ciblage des opportunités.', 'Candidatures adaptées.', 'Prospection des recruteurs.', 'Relances et suivi.'],
      nature: 'Gestion déléguée de la recherche sur devis personnalisé.',
      cta: 'Demander mon devis', href: CAREER_SERVICE_PATH + '#demande-accompagnement',
    },
  ] : [
    {
      title: 'Professional Image Optimization',
      description: 'We prepare a complete, targeted professional application package, ready for you to use.',
      benefits: ['ATS-optimized resume.', 'Tailored cover letter.', 'LinkedIn profile optimization.', 'Consistent professional positioning.'],
      nature: 'A one-off service delivered by our team.',
      cta: 'View Packages', href: '/en/services',
    },
    {
      title: 'End-to-End Career Support',
      description: 'We manage your opportunity search: strategy, applications, outreach, follow-ups and tracking.',
      benefits: ['Positioning and strategy.', 'Targeted opportunities.', 'Tailored applications.', 'Recruiter outreach.', 'Follow-ups and tracking.'],
      nature: 'A delegated search service with a personalized quote.',
      cta: 'Request a Quote', href: CAREER_SERVICE_PATH + '#demande-accompagnement',
    },
  ];

  return <section id="services" aria-labelledby="home-services-title" className={styles.section + ' relative overflow-hidden bg-white py-12 lg:py-16'}>
    <div className="container relative mx-auto px-5 md:px-8"><div className="mx-auto max-w-7xl">
      <motion.header className={styles.reveal} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: reduced ? 0 : .35 }}>
        <span className={styles.headingRule} aria-hidden="true" />
        <h2 id="home-services-title" className={styles.title}>{fr ? 'Nos services d’accompagnement' : 'Our Career Services'}</h2>
        <p className={styles.intro}>{fr ? 'Deux niveaux d’intervention selon ce que vous souhaitez confier à notre équipe.' : 'Two levels of support, depending on what you want to entrust to our team.'}</p>
      </motion.header>
      <div className={styles.offers}>{offers.map((offer, index) => <motion.article key={offer.title} className={styles.offer + ' ' + styles.reveal} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reduced ? 0 : .35, delay: reduced ? 0 : index * .07 }}>
        <h3 className={styles.offerTitle}>{offer.title}</h3>
        <p className={styles.description}>{offer.description}</p>
        <ul className={styles.benefits}>{offer.benefits.map((benefit, i) => <motion.li key={benefit} className={styles.reveal} initial={{ opacity: 0, y: 4 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : .25, delay: reduced ? 0 : i * .025 }}><Check size={16} aria-hidden="true" /><span>{benefit}</span></motion.li>)}</ul>
        <p className={styles.nature}>{offer.nature}</p>
        {index === 1 && !fr && <p className={styles.languageNote}>Service page and quote form available in French.</p>}
        <div className={styles.actions}>
          <Link href={offer.href} className={quoteButton + ' ' + styles.primary}><span>{offer.cta}</span><ArrowRight size={17} aria-hidden="true" /></Link>
          {index === 1 && <Link href={CAREER_SERVICE_PATH} className={styles.secondary}>{fr ? 'Découvrir l’accompagnement' : 'Explore the Service'}<ArrowRight size={15} aria-hidden="true" /></Link>}
        </div>
      </motion.article>)}</div>
    </div></div>
  </section>;
}