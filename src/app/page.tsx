import type { Metadata } from 'next';
import { HomePage } from '@/components/home/HomePage';

const description = 'Talentiques aide étudiants, candidats et professionnels à accéder à de meilleures opportunités grâce à des outils, ressources, systèmes et solutions pour l’emploi, les stages, l’alternance, la mobilité et l’évolution de carrière.';

export const metadata: Metadata = {
  title: { absolute: 'TalentiQues | L’écosystème des opportunités professionnelles' },
  description,
  alternates: { canonical: '/', languages: { 'fr-FR': '/', en: '/en', 'x-default': '/' } },
  openGraph: { title: 'TalentiQues | L’écosystème des opportunités professionnelles', description, url: 'https://talentiques.com/', locale: 'fr_FR', type: 'website' },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: 'TalentiQues', url: 'https://talentiques.com', logo: 'https://talentiques.com/favicon.svg', description },
    { '@type': 'WebSite', name: 'TalentiQues', url: 'https://talentiques.com', inLanguage: ['fr-FR', 'en'] },
  ],
};

export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/><HomePage locale="fr"/></>;
}
