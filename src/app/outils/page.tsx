import type { Metadata } from 'next';
import StorePageFR from '@/components/store/StorePageFR';

export const metadata: Metadata = {
  title: 'Outils carrière : Tracker, CV ATS & Bundle',
  description:
    'Opportunity Tracker Pro, CV ATS System et Career Search Bundle : des outils réutilisables pour structurer votre recherche, renforcer vos candidatures et suivre vos opportunités.',
  alternates: { canonical: '/outils' },
  openGraph: {
    title: 'TalentiQues Store | Outils carrière',
    description:
      'Tracker de candidatures, modèles CV ATS, guides CV et LinkedIn. Paiement unique, accès immédiat.',
    url: 'https://talentiques.com/outils',
    type: 'website',
  },
};

export default function OutilsPage() {
  return <StorePageFR />;
}
