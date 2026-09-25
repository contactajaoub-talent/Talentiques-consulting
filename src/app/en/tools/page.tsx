import type { Metadata } from 'next';
import StorePageFR from '@/components/store/StorePageFR';

export const metadata: Metadata = {
  title: 'Career Search Tools | ATS Resume, Application Tracker & Bundle',
  description: 'Organize your search for career opportunities with an application tracker, ATS resume templates, LinkedIn resources and the Career Search Bundle. One-time payment and instant access.',
  alternates: { canonical: '/en/tools', languages: { 'fr-FR': '/outils', 'en': '/en/tools' } },
  openGraph: { title: 'Career Search Tools | TalentiQues', description: 'Application tracker, ATS resume templates, LinkedIn resources and a complete career-search system.', url: 'https://talentiques.com/en/tools', locale: 'en_US' },
};

export default function EnglishStorePage() { return <StorePageFR market="en" />; }
