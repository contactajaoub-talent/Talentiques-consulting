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
    { '@type': 'Organization', name: 'TalentiQues', url: 'https://talentiques.com', logo: 'https://talentiques.com/favicon.svg', description: 'Talentiques est un écosystème de solutions conçu pour aider étudiants, candidats et professionnels à accéder à de meilleures opportunités professionnelles.' },
    { '@type': 'WebSite', name: 'TalentiQues', url: 'https://talentiques.com', inLanguage: ['fr-FR', 'en'] },
    { '@type': 'FAQPage', mainEntity: [
      ['Qu’est-ce que Talentiques ?', 'Talentiques est un écosystème de solutions pour aider étudiants, candidats et professionnels à mieux préparer, organiser et saisir leurs opportunités professionnelles.'],
      ['À qui s’adresse Talentiques ?', 'Aux étudiants, alternants, candidats, jeunes diplômés, professionnels en évolution et personnes qui explorent des opportunités internationales.'],
      ['Quelle différence entre les outils et les services Talentiques ?', 'Les outils sont conçus pour être utilisés de manière autonome et réutilisable. Les services ajoutent une intervention humaine et personnalisée lorsque votre situation le nécessite.'],
      ['Talentiques est-il disponible en anglais ?', 'Oui. Le site officiel et les principales solutions Talentiques disposent d’une expérience en anglais.'],
    ].map(([name,text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
  ],
};

export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><HomePage locale="fr" /></>;
}
