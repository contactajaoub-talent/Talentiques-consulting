import type { Metadata } from 'next';
import AffiliateProgramPage from '@/components/affiliate/AffiliateProgramPage';

export const metadata: Metadata = {
  title: 'Programme d’affiliation Talentiques | Gagnez 50 % par vente',
  description: 'Rejoignez le programme d’affiliation Talentiques, partagez nos outils carrière et recevez 50 % de commission sur les ventes éligibles attribuées à votre lien.',
  alternates: { canonical: '/affiliation', languages: { fr: '/affiliation', en: '/en/affiliate' } },
};

export default function AffiliatePage() { return <AffiliateProgramPage locale="fr" />; }

