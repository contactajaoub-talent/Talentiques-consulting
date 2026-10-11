import { Instagram, Linkedin } from 'lucide-react';
import type { Locale } from './content';
import s from './career-search.module.css';

export default function LandingFooter({ locale }: { locale: Locale }) {
  const fr = locale === 'fr';
  const groups = [
    { title: 'TALENTIQUES', links: [
      { label: 'Services', href: fr ? '/services' : '/en/services' },
      { label: fr ? 'Diagnostic CV ATS' : 'ATS Resume Diagnostic', href: '/diagnostic-cv-ats' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: fr ? '/#contact' : '/en#contact' },
    ] },
    { title: fr ? 'RESSOURCES' : 'RESOURCES', links: [
      { label: 'Career Search 360', href: fr ? '/career-search-360' : '/career-search-360?lang=en' },
      { label: fr ? 'Affiliation' : 'Affiliate programme', href: fr ? '/affiliation' : '/en/affiliate' },
    ] },
    { title: fr ? 'LÉGAL' : 'LEGAL', links: [
      { label: fr ? 'Confidentialité' : 'Privacy', href: '/politique-de-confidentialite' },
      { label: fr ? 'Conditions générales' : 'Terms and conditions', href: '/conditions-generales' },
      { label: fr ? 'Mentions légales' : 'Legal notice', href: '/mentions-legales' },
    ] },
  ];

  return <footer id="cs-footer" className={s.landingFooter}>
    <div className={s.container}>
      <div className={s.footerGrid}>
        <div className={s.footerBrand}>
          <a href={fr ? '/' : '/en'} aria-label={fr ? 'Talentiques — accueil' : 'Talentiques — home'}><img src="/career-search-360/talentiques-store-wordmark.png" alt="TalentiQues" width="893" height="141" loading="lazy" /></a>
          <p>{fr ? 'Outils, ressources et accompagnement pour transformer votre recherche d’opportunités en actions concrètes.' : 'Tools, resources and support to turn your opportunity search into concrete actions.'}</p>
          <div className={s.footerSocial}>
            <a href="https://www.linkedin.com/company/talentiques/" target="_blank" rel="noopener noreferrer" aria-label={fr ? 'Talentiques sur LinkedIn' : 'Talentiques on LinkedIn'}><Linkedin size={18} aria-hidden="true" /></a>
            <a href="https://www.instagram.com/talentiques/" target="_blank" rel="noopener noreferrer" aria-label={fr ? 'Talentiques sur Instagram' : 'Talentiques on Instagram'}><Instagram size={18} aria-hidden="true" /></a>
          </div>
        </div>
        {groups.map(group => <nav key={group.title} className={s.footerGroup} aria-label={group.title}><h3>{group.title}</h3><ul>{group.links.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul></nav>)}
      </div>
      <p className={s.footerCopyright}>© 2026 TalentiQues. {fr ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
    </div>
  </footer>;
}
