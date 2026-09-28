import type { Metadata } from 'next';
import { HomePage } from '@/components/home/HomePage';

const description = 'Talentiques helps students, job seekers and professionals access better opportunities with tools, resources, services and specialized programs for their professional goals.';

export const metadata: Metadata = {
  title: { absolute: 'TalentiQues | The Professional Opportunities Ecosystem' },
  description,
  alternates: { canonical: '/en', languages: { 'fr-FR': '/', en: '/en', 'x-default': '/' } },
  openGraph: { title: 'TalentiQues | The Professional Opportunities Ecosystem', description, url: 'https://talentiques.com/en', locale: 'en_US', type: 'website' },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: 'TalentiQues', url: 'https://talentiques.com', logo: 'https://talentiques.com/favicon.svg', description },
    { '@type': 'WebSite', name: 'TalentiQues', url: 'https://talentiques.com/en', inLanguage: 'en' },
  ],
};

export default function EnglishHome() {
  return <div lang="en"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}/><HomePage locale="en"/></div>;
}
