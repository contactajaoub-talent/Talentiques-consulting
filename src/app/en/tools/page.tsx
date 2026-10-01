import type { Metadata } from 'next';
import StorePageFR from '@/components/store/StorePageFR';

export const metadata: Metadata = {
  title: 'Career Search 360 | TalentiQues',
  description: 'Career Search 360 brings together opportunity tracking, ATS resume templates and LinkedIn resources in one reusable system.',
  alternates: { canonical: '/en/tools', languages: { 'fr-FR': '/outils', 'en': '/en/tools' } },
  openGraph: { title: 'Career Search 360 | TalentiQues Store', description: 'One complete system for opportunity tracking, ATS resumes and LinkedIn.', url: 'https://talentiques.com/en/tools', locale: 'en_US' },
};

export default function EnglishStorePage() { return <StorePageFR market="en" />; }
