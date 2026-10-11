'use client';

import { useState, type KeyboardEvent } from 'react';
import { ArrowRight, Check, Minus, Target, X } from 'lucide-react';
import type { Locale } from './content';
import s from './career-search.module.css';

export default function Comparison({ locale }: { locale: Locale }) {
  const [withSystem, setWithSystem] = useState(false);
  const t = (fr: string, en: string) => locale === 'fr' ? fr : en;
  const items = withSystem ? [
    [t('Un objectif clarifié', 'A clear goal'), t('Votre cap guide chaque choix.', 'Your direction guides every choice.')],
    [t('Un positionnement précis', 'Precise positioning'), t('Votre image et votre profil racontent la même histoire.', 'Your image and profile tell the same story.')],
    [t('Une candidature optimisée', 'An optimised application'), t('Diagnostic, CV et LinkedIn alignés sur votre objectif.', 'Assessment, resume and LinkedIn aligned with your goal.')],
    [t('Des opportunités qualifiées', 'Qualified opportunities'), t('Entreprises ciblées, pistes évaluées, priorités visibles.', 'Targeted companies, evaluated opportunities, clear priorities.')],
    [t('Une prochaine action claire', 'A clear next action'), t('Candidatures, contacts et relances reliés.', 'Applications, contacts and follow-ups connected.')],
  ] : [
    [t('Un objectif encore flou', 'An unclear goal'), t('Vous avancez sans cap précis.', 'You move forward without a clear direction.')],
    [t('Un positionnement peu distinct', 'Undistinctive positioning'), t('Votre profil ne montre pas ce qui vous distingue.', 'Your profile does not show what sets you apart.')],
    [t('Une candidature peu alignée', 'A poorly aligned application'), t('CV et image professionnelle manquent de cohérence.', 'Your resume and professional image lack consistency.')],
    [t('Des opportunités dispersées', 'Scattered opportunities'), t('Difficile de qualifier les pistes qui méritent du temps.', 'It is hard to qualify opportunities worth your time.')],
    [t('Une suite qui se perd', 'Next steps get lost'), t('Contacts dispersés, candidatures sans vue globale, relances oubliées.', 'Scattered contacts, disconnected applications, forgotten follow-ups.')],
  ];
  function onKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? false : event.key === 'End' ? true : !withSystem;
    setWithSystem(next);
    document.getElementById(next ? 'comparison-yes' : 'comparison-no')?.focus();
  }
  return <div className={`${s.comparison} ${withSystem ? s.withSystem : s.withoutSystem}`}>
    <div className={s.comparisonTop}>
      <p className={s.kicker}>{t('UNE RECHERCHE QUE VOUS PILOTEZ ?', 'A SEARCH YOU CONTROL?')}</p>
      <div className={s.comparisonSwitch} role="tablist" aria-label={t('Sans ou avec Career Search 360', 'Without or with Career Search 360')}>
        {[false, true].map(value => <button key={String(value)} type="button" id={value ? 'comparison-yes' : 'comparison-no'} role="tab" aria-selected={value === withSystem} aria-controls="comparison-panel" tabIndex={value === withSystem ? 0 : -1} onClick={() => setWithSystem(value)} onKeyDown={onKey}>
          {value ? <Check size={16} aria-hidden="true" /> : <Minus size={16} aria-hidden="true" />}{value ? t('OUI', 'YES') : t('NON', 'NO')}
        </button>)}
      </div>
    </div>
    <div id="comparison-panel" role="tabpanel" aria-labelledby={withSystem ? 'comparison-yes' : 'comparison-no'} tabIndex={0}>
      <div className={s.comparisonMessage} key={`message-${withSystem}`}>
        <span className={s.stateLabel}>{withSystem ? t('Avec Career Search 360', 'With Career Search 360') : t('Sans Career Search 360', 'Without Career Search 360')}</span>
        <h3>{withSystem ? t('Un cap. Un profil aligné. La prochaine action.', 'A direction. An aligned profile. The next action.') : t('Vous cherchez. Votre recherche vous échappe.', 'You’re searching. Your search slips out of your control.')}</h3>
        <p>{withSystem ? t('Vous savez comment vous positionner, où investir votre temps et quoi exécuter ensuite.', 'Know how to position yourself, where to invest your time and what to do next.') : t('Sans direction ni positionnement clair, les efforts s’accumulent. Le contrôle se perd.', 'Without clear direction or positioning, effort builds up. Control slips away.')}</p>
      </div>
      <div className={s.stateCanvas}>
        <div className={s.stateAnchor}><Target size={18} aria-hidden="true" />{withSystem ? t('Votre objectif', 'Your goal') : t('Une recherche fragmentée', 'A fragmented search')}<span>{withSystem ? <Check size={16} aria-hidden="true" /> : '…'}</span></div>
        <div className={s.stateItems}>{items.map(([title, detail], index) => <div className={s.stateItem} key={index}><span className={s.stateIndicator}>{withSystem ? <Check size={15} aria-hidden="true" /> : <X size={15} aria-hidden="true" />}</span><div><small className={s.stateStep}>{String(index + 1).padStart(2, '0')}</small><strong>{title}</strong><p>{detail}</p></div></div>)}</div>
        <div className={s.stateOutcome}><span />{withSystem ? t('Vous pilotez, avant et après la candidature.', 'You are in control, before and after applying.') : t('Des efforts. Une direction à retrouver.', 'Effort invested. Direction still missing.')}<ArrowRight size={16} aria-hidden="true" /></div>
      </div>
    </div>
  </div>;
}
