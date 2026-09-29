import type { Metadata } from 'next';
import { ServicesOffersPage } from '@/components/ServicesOffersPage';

export const metadata: Metadata = {
  title: 'Career Services | Professional Support',
  description:
    'Explore Talentiques services for professionals, students and job seekers: ATS resume, LinkedIn, applications and professional positioning.',
  alternates: {
    canonical: '/en/services',
    languages: { 'fr-FR': '/services', en: '/en/services' },
  },
  openGraph: {
    title: 'Talentiques Services | Professional Support',
    description:
      'Two levels of support to strengthen your professional image, applications and positioning.',
    url: 'https://talentiques.com/en/services',
    locale: 'en_US',
    type: 'website',
  },
};

export default function EnglishServicesPage() {
  return <ServicesOffersPage locale="en" />;
}
