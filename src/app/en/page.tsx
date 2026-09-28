import type { Metadata } from 'next';
import { HomePage } from '@/components/home/HomePage';

const description = 'Talentiques helps students, job seekers and professionals access better opportunities with tools, systems and services for jobs, internships, work-study programs and career growth.';

export const metadata: Metadata = {
  title: { absolute: 'TalentiQues | The Professional Opportunities Ecosystem' },
  description,
  alternates: { canonical: '/en', languages: { 'fr-FR': '/', en: '/en', 'x-default': '/' } },
  openGraph: { title: 'TalentiQues | The Professional Opportunities Ecosystem', description, url: 'https://talentiques.com/en', locale: 'en_US', type: 'website' },
};

const faq = [
  ['What is Talentiques?', 'Talentiques is an ecosystem of solutions helping students, job seekers and professionals prepare, organize and capture professional opportunities.'],
  ['Who is Talentiques for?', 'Students, work-study candidates, job seekers, graduates, professionals in transition and people exploring international opportunities.'],
  ['How are Talentiques tools and services different?', 'Tools are reusable and designed for independent use. Services add personalized human expertise when your situation requires it.'],
  ['Is Talentiques available in English?', 'Yes. The official website and main Talentiques solutions offer an English experience.'],
];

const structuredData = {
  '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', name: 'TalentiQues', url: 'https://talentiques.com', logo: 'https://talentiques.com/favicon.svg', description: 'Talentiques is an ecosystem of solutions built to help students, job seekers and professionals access better professional opportunities.' },
    { '@type': 'WebSite', name: 'TalentiQues', url: 'https://talentiques.com/en', inLanguage: 'en' },
    { '@type': 'FAQPage', mainEntity: faq.map(([name,text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
  ],
};

export default function EnglishHome() {
  return <div lang="en"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><HomePage locale="en" /></div>;
}
