'use client';

import { useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, FileText, ListChecks, Send, SlidersHorizontal, Target } from 'lucide-react';
import type { Locale } from './content';
import s from './career-search.module.css';

const steps = [
  { fr: 'Définir', en: 'Define', phase: ['AVANT LA CANDIDATURE', 'BEFORE APPLYING'], description: ['Fixez un cap qui guide chaque choix de votre recherche.', 'Set a direction that guides every choice in your search.'], title: ['Votre objectif donne le cap.', 'Your goal sets the direction.'], fields: [['Objectif professionnel', 'Career goal'], ['Environnement et fonctions visés', 'Target environment and roles'], ['Priorités et plan d’action', 'Priorities and action plan']], result: ['Vous ciblez à partir de votre projet, pas au hasard.', 'Your career plan guides your search, not chance.'] },
  { fr: 'Positionner', en: 'Position', phase: ['AVANT LA CANDIDATURE', 'BEFORE APPLYING'], description: ['Clarifiez ce que vous apportez et l’image que vous présentez.', 'Clarify what you bring and the image you present.'], title: ['Un positionnement qui vous ressemble.', 'Positioning that reflects you.'], fields: [['Compétences et valeur professionnelle', 'Skills and professional value'], ['Image cohérente avec votre objectif', 'Image consistent with your goal'], ['Positionnement LinkedIn', 'LinkedIn positioning']], result: ['Un fil conducteur entre votre projet, votre CV et votre profil.', 'A consistent story across your career plan, resume and profile.'] },
  { fr: 'Optimiser', en: 'Optimise', phase: ['AVANT LA CANDIDATURE', 'BEFORE APPLYING'], description: ['Diagnostiquez votre candidature, puis travaillez les points qui comptent.', 'Assess your application, then work on what matters.'], title: ['Une candidature alignée.', 'An aligned application.'], fields: [['Diagnostic détaillé du CV et du profil', 'Detailed resume and profile assessment'], ['Guide CV ATS et 7 modèles Canva', 'ATS Resume Guide and 7 Canva templates'], ['Guide LinkedIn et image professionnelle', 'LinkedIn Guide and professional image']], result: ['Des supports optimisés pour le poste et le cap que vous visez.', 'Application materials aligned with your target role and direction.'] },
  { fr: 'Cibler', en: 'Target', phase: ['PENDANT LA RECHERCHE', 'DURING YOUR SEARCH'], description: ['Identifiez les entreprises et les pistes cohérentes avec votre projet.', 'Identify companies and opportunities consistent with your career plan.'], title: ['Des pistes choisies.', 'Opportunities chosen with intent.'], fields: [['Entreprises cibles', 'Target companies'], ['Identification des opportunités', 'Opportunity identification'], ['Contacts et méthode Academy', 'Contacts and Academy methodology']], result: ['Vous construisez votre recherche autour d’un ciblage précis.', 'Build your search around specific targets.'] },
  { fr: 'Qualifier', en: 'Qualify', phase: ['AVANT DE CANDIDATER', 'BEFORE SENDING AN APPLICATION'], description: ['Évaluez les pistes avant d’y consacrer votre temps.', 'Evaluate opportunities before investing your time.'], title: ['Choisissez où agir.', 'Choose where to act.'], fields: [['Adéquation avec votre objectif', 'Fit with your goal'], ['Critères et qualification avec l’Academy', 'Criteria and qualification with the Academy'], ['Priorités et Focus Mode', 'Priorities and Focus Mode']], result: ['Votre prochaine action porte sur une opportunité qualifiée.', 'Your next action focuses on a qualified opportunity.'] },
  { fr: 'Agir', en: 'Act', phase: ['CANDIDATURE ET APRÈS', 'APPLYING AND BEYOND'], description: ['Candidatez, suivez les échanges et gardez la prochaine action visible.', 'Apply, track conversations and keep the next action visible.'], title: ['De la candidature à la réponse.', 'From application to response.'], fields: [['Candidatures et contacts centralisés', 'Centralised applications and contacts'], ['Relances, échéances et prochaines actions', 'Follow-ups, dates and next actions'], ['Academy : candidature et gestion des réponses', 'Academy: applications and response management']], result: ['Chaque échange reste relié à une suite concrète.', 'Every conversation stays connected to a concrete next step.'] },
];
const icons = [Compass, Target, SlidersHorizontal, FileText, ListChecks, Send];

export default function Methodology({ locale }: { locale: Locale }) {
  const [active, setActive] = useState(0);
  const language = locale === 'fr' ? 0 : 1;
  const t = (fr: string, en: string) => locale === 'fr' ? fr : en;
  const step = steps[active];
  const Icon = icons[active];
  function select(index: number, focus = false) {
    setActive(index);
    const button = document.getElementById('cs-step-' + index);
    if (focus) button?.focus({ preventScroll: true });
    button?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % steps.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + steps.length - 1) % steps.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = steps.length - 1;
    else return;
    event.preventDefault();
    select(next, true);
  }
  return <div className={s.methodExperience}>
    <div className={s.steps} role="tablist" aria-label={t('Les six étapes de votre recherche', 'The six steps of your search')}>
      {steps.map((item, index) => <button key={item.en} type="button" role="tab" id={'cs-step-' + index} aria-controls="cs-step-panel" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => select(index)} onKeyDown={event => onKey(event, index)} className={[s.step, active === index ? s.stepActive : ''].join(' ')}>
        <span className={s.stepNumber}>{String(index + 1).padStart(2, '0')}</span><span>{item[locale]}</span><ArrowRight size={16} aria-hidden="true" />
      </button>)}
    </div>
    <div className={s.methodPanel} id="cs-step-panel" role="tabpanel" aria-labelledby={'cs-step-' + active} tabIndex={0}>
      <div className={s.methodContent} key={active}>
        <div className={s.methodPanelTop}><span className={s.methodIcon}><Icon size={23} aria-hidden="true" /></span><span className={s.methodCount}>{String(active + 1).padStart(2, '0')} <small>/ 06</small></span></div>
        <h3>{step.title[language]}</h3><p className={s.methodDescription}>{step.description[language]}</p>
        <div className={s.methodDetails}><p className={s.kicker}>{step.phase[language]}</p>{step.fields.map(field => <div key={field[0]}><Check size={16} aria-hidden="true" /><span>{field[language]}</span></div>)}</div>
        <p className={s.methodResult}><span className={s.statusDot} />{step.result[language]}</p>
      </div>
      <div className={s.methodFooter}><button type="button" onClick={() => select(active - 1)} disabled={active === 0} aria-label={t('Étape précédente', 'Previous step')}><ArrowLeft size={17} aria-hidden="true" /></button><div className={s.progressTrack} aria-hidden="true"><span style={{ width: ((active + 1) / steps.length) * 100 + '%' }} /></div><button type="button" onClick={() => select(active + 1)} disabled={active === steps.length - 1} aria-label={t('Étape suivante', 'Next step')}><ArrowRight size={17} aria-hidden="true" /></button></div>
    </div>
  </div>;
}
