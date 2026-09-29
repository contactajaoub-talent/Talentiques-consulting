import type { Metadata } from 'next';
import { ServicesOffersPage } from '@/components/ServicesOffersPage';

export const metadata: Metadata = {
  title: 'Services carrière | Accompagnement professionnel',
  description:
    'Découvrez les services Talentiques pour professionnels, étudiants, alternants et demandeurs d’emploi : CV ATS, LinkedIn, candidature et positionnement professionnel.',
  alternates: {
    canonical: '/services',
    languages: { 'fr-FR': '/services', en: '/en/services' },
  },
  openGraph: {
    title: 'Services Talentiques | Accompagnement professionnel',
    description:
      'Deux niveaux d’accompagnement pour renforcer votre image professionnelle, vos candidatures et votre positionnement.',
    url: 'https://talentiques.com/services',
    type: 'website',
  },
};

export default function ServicesPage() {
  return <ServicesOffersPage locale="fr" />;
}
