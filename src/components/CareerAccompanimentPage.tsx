'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { animate, MotionConfig, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Compass, FileCheck2, Search, Send, Users, ChartNoAxesCombined } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { EmployerLogoMarquee } from './EmployerLogoMarquee';
import { AccompanimentLeadForm } from './AccompanimentLeadForm';
import { quoteButton } from './CareerAccompanimentIntro';
import laptop from './PublicLaptop.module.css';
import type { countryOptions } from '@/lib/services/career-quote';
import styles from './CareerAccompaniment.module.css';

const services = [
  { icon: Compass, title: 'Positionnement & stratégie', text: 'Clarification de votre objectif, de vos priorités et du plan d’action.' },
  { icon: FileCheck2, title: 'Optimisation de l’image professionnelle', text: 'Ajustement du CV, du LinkedIn et de votre positionnement.' },
  { icon: Search, title: 'Recherche ciblée d’opportunités', text: 'Identification d’offres, d’entreprises et d’organisations pertinentes.' },
  { icon: Send, title: 'Adaptation des candidatures', text: 'Personnalisation selon le poste, le secteur et le type d’organisation.' },
  { icon: Users, title: 'Prospection & relances', text: 'Préparation des contacts, prises de contact et relances ciblées.' },
  { icon: ChartNoAxesCombined, title: 'Pilotage & suivi', text: 'Suivi des actions menées et accompagnement jusqu’à progression concrète.' },
];
const stages = [
  ['Qualification du besoin', 'Analyse du profil, de l’objectif et des priorités.'],
  ['Positionnement stratégique', 'Clarification de la cible et du plan d’action.'],
  ['Optimisation du dossier', 'CV, LinkedIn et éléments de candidature ajustés.'],
  ['Déploiement opérationnel', 'Recherche, candidatures, prospection et relances.'],
  ['Suivi et ajustements', 'Suivi des actions et ajustements si nécessaire.'],
  ['Préparation aux entretiens', 'Vous vous concentrez sur les entretiens, nous maintenons le cadre.'],
];
const roles = [
  { title: 'Pour qui ?', items: ['Vous manquez de temps pour piloter votre recherche', 'Vous voulez une démarche structurée', 'Vous souhaitez déléguer une partie opérationnelle', 'Vous recherchez un emploi, un stage, un stage PFE, une alternance ou une évolution', 'Vous voulez gagner en clarté et en efficacité', 'Vous cherchez un accompagnement humain et concret'] },
  { title: 'Votre rôle', items: ['Définir votre objectif', 'Partager vos informations et documents', 'Valider les orientations importantes', 'Préparer et passer les entretiens'] },
  { title: 'Notre rôle', items: ['Structurer la stratégie', 'Optimiser votre image professionnelle', 'Cibler les opportunités', 'Adapter les candidatures', 'Organiser la prospection', 'Assurer le suivi et les relances'] },
];
const overview = [
  ['Cadrer votre objectif', 'Positionnement et dossier professionnel'],
  ['Déployer la recherche', 'Candidatures, prospection et relances'],
  ['Préparer vos entretiens', 'Suivi des retours et ajustements'],
];
const container = 'container mx-auto max-w-7xl px-5 md:px-8';
const titleClass = styles.sectionTitle;

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div data-motion-reveal initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reduced ? 0 : .4, delay: reduced ? 0 : delay }} className={className}>{children}</motion.div>;
}

function Stat({ value, start = 0, prefix = '', suffix = '', label, delay }: { value: number; start?: number; prefix?: string; suffix?: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null), digits = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, amount: .6 });
  const reduced = useReducedMotion(), count = useMotionValue(value);
  useMotionValueEvent(count, 'change', latest => { if (digits.current) digits.current.textContent = String(Math.round(latest)); });
  useEffect(() => {
    if (!visible || reduced !== false) { count.set(value); return; }
    count.set(start);
    const animation = animate(count, value, { duration: .9, delay, ease: 'easeOut' });
    return () => animation.stop();
  }, [visible, reduced, count, value, start, delay]);
  return <div ref={ref} className={styles.stat}>
    <Reveal delay={delay}>
      <p className={styles.statValue}><span className="sr-only">{prefix}{value}{suffix}</span><span aria-hidden="true">{prefix === 'Depuis ' ? <span className={styles.yearPrefix}>{prefix}</span> : prefix}<span ref={digits}>{value}</span>{suffix}</span></p>
      <motion.span aria-hidden="true" className={styles.statRule} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : .5, delay: reduced ? 0 : delay }} />
      <p className={styles.statLabel}>{label}</p>
    </Reveal>
  </div>;
}
function QuoteLink() {
  return <a href="#demande-accompagnement" className={`${quoteButton} ${styles.quoteCta}`}>Demander mon devis <ArrowRight size={17} aria-hidden="true" /></a>;
}

export function CareerAccompanimentPage({ countries, quoteEnabled = false }: { countries: ReturnType<typeof countryOptions>; quoteEnabled?: boolean }) {
  return <MotionConfig reducedMotion="user"><div className={`${laptop.page} ${styles.page} min-h-screen bg-white text-slate-900`}>
    <Navbar locale="fr" />
    <main>
      <section className={styles.hero}>
        <div className={container}>
          <Link href="/services" className={styles.backLink}><ArrowLeft size={15} aria-hidden="true" />Retour aux services</Link>
          <Reveal><h1 className={styles.heroTitle}>Accompagnement carrière <span>de A à Z</span></h1></Reveal>
          <div className={styles.heroLayout}>
            <div>
              <Reveal delay={.07}><p className={styles.heroLead}>Vous définissez votre objectif. Nous pilotons votre recherche : stratégie, candidatures, <span className={styles.heroEnding}>prospection et suivi.</span></p></Reveal>
              <Reveal delay={.2} className={styles.heroAction}><QuoteLink /></Reveal>
            </div>
            <Reveal delay={.14} className={styles.heroAside}>
              <ol className={styles.overview} aria-label="Votre recherche, en trois temps">
                {overview.map(([title, text], i) => <motion.li key={title} data-motion-reveal initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .35, delay: .18 + i * .06 }}>
                  <span className={styles.overviewNumber} aria-hidden="true">0{i + 1}</span><div><p>{title}</p><span className={styles.overviewText}>{text}</span></div>
                </motion.li>)}
              </ol>
              <a href="#etapes-accompagnement" className={styles.pathLink}>Voir le parcours <ArrowRight size={14} aria-hidden="true" /></a>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-label="L’expérience Talentiques" className={styles.credibility}>
        <div className={`${container} ${styles.stats}`}>
          {/* Indicateurs déclarés par Talentiques. Le texte accessible garde toujours la valeur finale. */}
          <Stat value={2024} start={2024} prefix="Depuis " label="Des profils aux parcours variés" delay={0} />
          <Stat value={500} prefix="+" label="Professionnels accompagnés" delay={.06} />
          <Stat value={80} start={1} prefix="+" suffix=" %" label="Taux de réussite déclaré" delay={.12} />
        </div>
        <Reveal className={styles.logos}><EmployerLogoMarquee locale="fr" /></Reveal>
      </section>

      <section className={styles.section} aria-labelledby="care-title">
        <div className={container}>
          <Reveal><h2 id="care-title" className={titleClass}>Ce que nous prenons en charge</h2></Reveal>
          <div className={styles.services}>
            {services.map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={(i % 3) * .055}>
              <article className={styles.serviceCard}>
                <div className={styles.serviceHeading}><Icon size={21} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3></div><p>{text}</p>
              </article>
            </Reveal>)}
          </div>
        </div>
      </section>

      <section id="etapes-accompagnement" className={`${styles.section} ${styles.stagesSection}`} aria-labelledby="stages-title">
        <div className={container}>
          <Reveal><h2 id="stages-title" className={titleClass}>Les étapes de l’accompagnement</h2></Reveal>
          <ol className={styles.timeline}>{stages.map(([title, text], i) => <motion.li key={title} data-motion-reveal className={styles.timelineItem} initial="hidden" whileInView="visible" viewport={{ once: true, amount: .3 }} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: .38, delay: (i % 3) * .05 } } }}>
            {i < stages.length - 1 && <motion.span aria-hidden="true" className={styles.timelineLine} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: .55, delay: i * .045 }} />}
            <div>
              <motion.span data-motion-reveal className={styles.stageNumber} aria-hidden="true" variants={{ hidden: { opacity: 0, scale: .9 }, visible: { opacity: 1, scale: 1, transition: { duration: .25, delay: .08 } } }}>0{i + 1}</motion.span>
              <h3>{title}</h3><p>{text}</p>
            </div>
          </motion.li>)}</ol>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="roles-title"><div className={container}>
        <Reveal><h2 id="roles-title" className={`${titleClass} ${styles.rolesTitle}`}>Un accompagnement structuré, pensé pour les profils qui veulent avancer concrètement</h2></Reveal>
        <div className={styles.roles}>{roles.map((role, i) => <Reveal key={role.title} delay={i * .08} className={styles.roleColumn}>
          <h3>{role.title}</h3><ul>{role.items.map((item, index) => <motion.li key={item} data-motion-reveal initial={{ opacity: 0, x: -4 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .3, delay: index * .035 }}><Check size={16} aria-hidden="true" />{item}</motion.li>)}</ul>
        </Reveal>)}</div>
      </div></section>

      <AccompanimentLeadForm countries={countries} enabled={quoteEnabled} />

      <section className={styles.finalCta}><div className={container}><Reveal>
        <h2 className={titleClass}>Besoin d’un accompagnement structuré pour votre recherche ?</h2>
        <div className={styles.finalCtaRow}><p>Partagez votre besoin et notre équipe reviendra vers vous avec la suite la plus adaptée.</p><QuoteLink /></div>
      </Reveal></div></section>
    </main>
    <Footer locale="fr" />
  </div></MotionConfig>;
}
