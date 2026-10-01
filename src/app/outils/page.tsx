import type { Metadata } from 'next';
import StorePageFR from '@/components/store/StorePageFR';

export const metadata: Metadata = {
  title: 'Career Search 360 | TalentiQues',
  description:
    'Career Search 360 : le système complet et réutilisable pour structurer votre recherche, renforcer vos candidatures et suivre vos opportunités.',
  alternates: { canonical: '/outils', languages: { 'fr-FR': '/outils', en: '/en/tools' } },
  openGraph: {
    title: 'Career Search 360 | TalentiQues Store',
    description:
      'Tracker de candidatures, modèles CV ATS, guides CV et LinkedIn. Paiement unique, accès immédiat.',
    url: 'https://talentiques.com/outils',
    type: 'website',
  },
};

export default function OutilsPage() {
  return <StorePageFR />;
}
