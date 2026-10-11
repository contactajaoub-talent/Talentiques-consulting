import type { Metadata } from 'next';
import { ArrowDown, ArrowRight, Check, Compass, Film, Plus, Zap } from 'lucide-react';
import Methodology from './Methodology';
import Comparison from './Comparison';
import Checkout from './Checkout';
import LandingFooter from './LandingFooter';
import { companies, countryCodes, platformVideo, testimonials, type Locale } from './content';
import s from './career-search.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Career Search 360 | Talentiques' },
  description: 'Centralisez votre recherche d’opportunités, vos candidatures et leur suivi. Career Search 360 vous aide à piloter vos priorités et vos prochaines actions.',
  alternates: { canonical: '/career-search-360', languages: { 'fr-FR': '/career-search-360', en: '/career-search-360?lang=en', 'x-default': '/career-search-360' } },
  openGraph: { title: 'Career Search 360 | Talentiques', description: 'Une direction claire, des opportunités ciblées, des candidatures suivies. Pilotez votre recherche avec Career Search 360.', url: '/career-search-360' },
};

export default async function CareerSearchPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const locale: Locale = (await searchParams).lang === 'en' ? 'en' : 'fr';
  const t = (fr: string, en: string) => locale === 'fr' ? fr : en;
  const access = t('Accéder à Career Search 360', 'Get Career Search 360');
  const countryNames = new Intl.DisplayNames([locale], { type: 'region' });
  const countries = countryCodes.map(code => ({ code, name: countryNames.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name, locale));
  const faq = [
    [t('Career Search 360 est-il un abonnement ?', 'Is Career Search 360 a subscription?'), t('Non. Vous payez une seule fois 19,90 € pendant l’offre de lancement. Aucun abonnement.', 'No. You pay €19.90 once during the launch offer. There is no subscription.')],
    [t('Que se passe-t-il après le paiement ?', 'What happens after payment?'), t('Le parcours de paiement et d’accès se poursuit sur app.talentiques.com. Suivez les instructions affichées pour accéder à Career Search 360.', 'Payment and access continue on app.talentiques.com. Follow the instructions shown to access Career Search 360.')],
    [t('À qui s’adresse Career Search 360 ?', 'Who is Career Search 360 for?'), t('Aux étudiants, candidats et professionnels qui veulent structurer leur recherche d’emploi, de stage, d’alternance ou leur évolution de carrière.', 'Students, job seekers and professionals who want to structure their job, internship, work-study or career development search.')],
    [t('Puis-je ajouter mes propres opportunités ?', 'Can I add my own opportunities?'), t('Oui. Centralisez les opportunités que vous identifiez, avec vos contacts, candidatures et prochaines actions.', 'Yes. Keep the opportunities you identify together with your contacts, applications and next actions.')],
    [t('Quelle différence avec un simple tracker de candidatures ?', 'How is it different from an application tracker?'), t('Le suivi n’est qu’une étape. Career Search 360 relie votre projet professionnel au ciblage, à la qualification, aux candidatures et aux relances.', 'Tracking is one step. Career Search 360 connects your career plan to targeting, qualification, applications and follow-ups.')],
    [t('Career Search 360 trouve-t-il automatiquement des offres ?', 'Does Career Search 360 find job listings automatically?'), t('Non. Vous identifiez vos opportunités. Le système vous aide à les organiser, les qualifier et à décider de la prochaine action.', 'No. You identify your opportunities. The system helps you organise and qualify them, and decide on the next action.')],
    [t('Puis-je utiliser Career Search 360 depuis n’importe quel pays ?', 'Can I use it from any country?'), t('Le système peut accompagner votre recherche quel que soit votre pays. Les moyens de paiement disponibles sont indiqués lors du checkout.', 'The system can support your search in any country. Available payment methods are shown at checkout.')],
  ];

  function Purchase({ label = access, light = false }: { label?: string; light?: boolean }) {
    return <a href="#offre" className={[s.purchase, light ? s.purchaseLight : ''].join(' ')}><span>{label}</span><ArrowRight size={18} aria-hidden="true" /></a>;
  }

  return <div className={s.page} lang={locale}>
    <a href="#cs-main" className={s.skipLink}>{t('Aller au contenu', 'Skip to content')}</a>
    <header className={s.header}>
      <div className={s.headerInner}>
        <a href={locale === 'fr' ? '/' : '/en'} className={s.wordmark} aria-label={t('Talentiques — accueil', 'Talentiques — home')}><img src="/career-search-360/talentiques-store-wordmark.png" alt="TalentiQues" width="893" height="141" /></a>
        <div className={s.headerActions}>
          <nav className={s.languages} aria-label={t('Langue', 'Language')}><a href="/career-search-360" hrefLang="fr" aria-current={locale === 'fr' ? 'page' : undefined}>FR</a><span aria-hidden="true">|</span><a href="/career-search-360?lang=en" hrefLang="en" aria-current={locale === 'en' ? 'page' : undefined}>EN</a></nav>
          <a href="#offre" className={s.offerLink}>{t('Voir l’offre', 'View offer')}<Zap size={15} aria-hidden="true" /></a>
        </div>
      </div>
    </header>
    <main id="cs-main">
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroInner}>
          <p className={s.productName}>Career Search <span>360</span></p>
          <h1 id="hero-title">{t('Le système complet pour piloter votre recherche d’opportunités.', 'The complete system to manage your opportunity search.')}</h1>
          <div className={s.heroSupport}><p>{t('Positionnement, diagnostic, optimisation, ciblage, candidatures et relances réunis dans un seul espace.', 'Positioning, assessment, optimisation, targeting, applications and follow-ups together in one space.')}</p></div>
          <ul className={s.heroBenefits}>{[
            t('Positionnement clair', 'Clear positioning'),
            t('Candidatures optimisées', 'Optimised applications'),
            t('Opportunités qualifiées', 'Qualified opportunities'),
            t('Suivi centralisé', 'Centralised tracking'),
          ].map(benefit => <li key={benefit}><Check size={15} aria-hidden="true" />{benefit}</li>)}</ul>
        </div>
      </section>

      <section id="plateforme" className={[s.videoSection, s.container].join(' ')} aria-labelledby="video-title">
        <div className={s.videoFrame}>
          <div className={s.videoHeading}><p className={s.kicker}>{t('LA PLATEFORME, DE A À Z', 'THE PLATFORM, FROM A TO Z')}</p><h2 id="video-title"><span className={s.videoTitleLead}>{t('Découvrez Career Search 360', 'Discover Career Search 360')}</span>{' '}<span className={s.videoTitleTiming}>{t('en 30 secondes.', 'in 30 seconds.')}</span></h2></div>
          {platformVideo.src ? <video controls playsInline preload="metadata" poster={platformVideo.poster} src={platformVideo.src} aria-label={t('Vidéo explicative de Career Search 360', 'Career Search 360 platform explainer')} /> : <div className={s.videoPlaceholder}>
            <div className={s.videoTop}><span className={s.videoWordmark}>Career Search <strong>360</strong></span><span className={s.videoStatus}><Film size={15} aria-hidden="true" />{t('Vidéo à venir', 'Video coming soon')}</span></div>
            <div className={s.videoStatement}><Compass size={25} strokeWidth={1.5} aria-hidden="true" /><strong>{t('Une direction claire.', 'A clear direction.')}</strong><span>{t('Et la suite, sous vos yeux.', 'And the next step, in view.')}</span></div>
            <div className={s.videoJourney}><span><small>01</small>{t('Votre objectif', 'Your goal')}</span><ArrowRight size={15} aria-hidden="true" /><span><small>02</small>{t('Vos opportunités', 'Your opportunities')}</span><ArrowRight size={15} aria-hidden="true" /><span><small>03</small>{t('Vos actions', 'Your actions')}</span></div>
            <div className={s.videoTimeline}><span>00:00</span><i /><span>00:30</span></div>
          </div>}
        </div>
      </section>
      <section id="premier-acces" className={[s.afterVideo, s.container].join(' ')} aria-label={t('Accéder à Career Search 360', 'Get Career Search 360')}><a href="#offre" className={s.purchase}><span>{t('Accéder maintenant', 'Get access now')}</span><ArrowDown size={18} aria-hidden="true" /></a><p><Check size={15} aria-hidden="true" />{t('Paiement unique · Aucun abonnement', 'One-time payment · No subscription')}</p></section>

      <section className={s.companySection} aria-label={t('Entreprises où les talents accompagnés ont décroché des opportunités', 'Companies where supported talent secured opportunities')}>
        <p>{t('Des talents accompagnés par Talentiques ont décroché des opportunités dans des entreprises comme…', 'Talent supported by Talentiques has secured opportunities at companies such as…')}</p>
        <div className={s.companyViewport} tabIndex={0} aria-label={t('Les 13 entreprises · défilement suspendu au survol ou au focus', 'The 13 companies · scrolling pauses on hover or focus')}><div className={s.companyTrack}>{[0, 1].map(copy => <div key={copy} className={s.companyGroup} aria-hidden={copy === 1 ? true : undefined}>{companies.map(company => <span key={company.name} className={s.companyLogo} data-dark-logo={company.darkBackground || undefined}><img src={company.logo} alt={copy === 0 ? company.name : ''} width="160" height="56" loading="eager" decoding="async" style={{ height: company.height }} data-original-color={company.originalColor || undefined} /></span>)}</div>)}</div></div>
        <small>{t('Entreprises d’accueil des talents accompagnés · aucun partenariat ni soutien commercial annoncé.', 'Companies welcoming supported talent · no partnership or endorsement implied.')}</small>
      </section>

      <section className={[s.comparisonSection, s.container].join(' ')} aria-labelledby="comparison-title">
        <div className={s.sectionHeading}><p className={s.kicker}>{t('CE QUI CHANGE CONCRÈTEMENT', 'WHAT ACTUALLY CHANGES')}</p><h2 id="comparison-title">{t('La même recherche.', 'The same search.')}<br /><span>{t('Une autre façon d’avancer.', 'A different way forward.')}</span></h2><p>{t('Passez de la dispersion à une recherche que vous pilotez.', 'Move from scattered efforts to a search you control.')}</p></div>
        <Comparison locale={locale} />
      </section>

      <section className={s.methodSection} aria-labelledby="method-title"><div className={s.container}>
        <div className={s.sectionHeading}><p className={s.kicker}>{t('VOTRE MÉTHODE, PAS À PAS', 'YOUR METHOD, STEP BY STEP')}</p><h2 id="method-title">{t('Comment Career Search 360 ', 'How Career Search 360 ')}<span>{t('vous accompagne.', 'guides you.')}</span></h2><p>{t('Six étapes pour vous positionner et agir, avant, pendant et après la candidature.', 'Six steps to position yourself and take action, before, during and after applying.')}</p></div>
        <Methodology locale={locale} />
      </div></section>

      <section className={s.testimonialSection} aria-labelledby="testimonial-title"><div className={[s.testimonialInner, s.container].join(' ')}>
        <div><p className={s.kicker}>{t('DES PARCOURS, DES PERSONNES', 'JOURNEYS AND PEOPLE')}</p><h2 id="testimonial-title">{t('Leurs mots.', 'Their words.')}<span>{t(' Leur expérience.', ' Their experience.')}</span></h2></div>
        <div className={s.testimonialViewport} tabIndex={0} aria-label={t('Témoignages Talentiques · défilement suspendu au survol ou au focus', 'Talentiques testimonials · scrolling pauses on hover or focus')}>
          {/* Reuse the homepage's animate-marquee pattern: two equal copies, paused on hover. */}
          <div className={`${s.testimonialTrack} animate-marquee`}>{[0, 1].map(copy => <div key={copy} className={s.testimonialGroup} aria-hidden={copy === 1 ? true : undefined}>{testimonials.map(item => <figure key={item.name} className={s.testimonial}>
            <figcaption><strong>{item.name}</strong><span><img src={`/career-search-360/flags/${item.countryCode.toLowerCase()}.svg`} alt="" width="22" height="16" loading="lazy" />{item.country[locale]}</span></figcaption>
            <blockquote lang="fr">{item.quote}</blockquote>
          </figure>)}</div>)}</div>
        </div>
      </div></section>

      <section id="offre" className={s.offerSection} aria-labelledby="offer-title"><div className={[s.offerInner, s.container].join(' ')}>
        <div className={s.offerCopy}><p className={s.kicker}>{t('UNE RECHERCHE MIEUX PILOTÉE', 'A SEARCH YOU CONTROL')}</p><h2 id="offer-title">Career Search <span>360.</span></h2><p className={s.offerLead}>{t('De votre objectif à la prochaine action. Tout votre système, au même endroit.', 'From your goal to your next action. Your complete system, in one place.')}</p>
          <div className={s.inclusions}>
            <div><span>01</span><p><strong>{t('Donnez une direction à votre recherche', 'Give your search a direction')}</strong>{t('Objectif professionnel, positionnement, diagnostic détaillé et plan d’action.', 'Career goal, positioning, detailed assessment and action plan.')}</p></div>
            <div><span>02</span><p><strong>{t('Gardez le contrôle sur chaque piste', 'Stay in control of every opportunity')}</strong>{t('Tableau de bord de pilotage, entreprises, contacts, opportunités, Focus Mode, suivi des candidatures et des relances.', 'Dashboard, companies, contacts, opportunities, Focus Mode, application and follow-up tracking.')}</p></div>
            <div><span>03</span><p><strong>{t('Préparez votre prochaine candidature', 'Prepare your next application')}</strong>{t('Academy, Guide CV ATS, Guide LinkedIn et 7 modèles CV Canva éditables.', 'Academy, ATS Resume Guide, LinkedIn Guide and 7 editable Canva resume templates.')}</p></div>
          </div>
          <div className={s.offerPrice}><span className={s.launchBadge}><Zap size={14} aria-hidden="true" />{t('OFFRE DE LANCEMENT', 'LAUNCH OFFER')}</span><div className={s.offerPriceLine}><s>{t('49,90 €', '€49.90')}</s><strong>{t('19,90', '19.90')}<span>€</span></strong></div><p>{t('Paiement unique · Aucun abonnement', 'One-time payment · No subscription')}</p><small>{t('Offre jusqu’au 11 novembre.', 'Offer until November 11.')}</small></div>
        </div>
        <Checkout locale={locale} countries={countries} />
      </div></section>

      <section className={[s.faqSection, s.container].join(' ')} aria-labelledby="faq-title"><div className={s.sectionHeading}><p className={s.kicker}>{t('EN TOUTE CLARTÉ', 'CLEAR ANSWERS')}</p><h2 id="faq-title">{t('Vos questions,', 'Your questions,')}<br /><span>{t('simplement.', 'answered simply.')}</span></h2></div><div className={s.faqList}>{faq.map(([question, answer]) => <details key={question}><summary>{question}<Plus size={19} className={s.faqPlus} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>

      <section className={s.finalSection} aria-labelledby="final-title"><div className={s.container}><p className={s.finalEyebrow}><span className={s.statusDot} />Career Search 360</p><h2 id="final-title">{t('Votre prochaine opportunité mérite plus qu’une ', 'Your next opportunity deserves more than a ')}<span>{t('recherche dispersée.', 'scattered search.')}</span></h2><p>{t('Une direction claire. Un système pour avancer.', 'A clear direction. A system to move forward.')}</p><Purchase light /></div></section>
    </main>
    <LandingFooter locale={locale} />
  </div>;
}
