import type { Metadata } from 'next';
import { CareerAccompanimentPage } from '@/components/CareerAccompanimentPage';
import { countryOptions, quoteDeliveryEnabled } from '@/lib/services/career-quote';

export const dynamic = 'force-dynamic';

const path = '/services/accompagnement-carriere-a-a-z';
const description = 'Un accompagnement carrière de A à Z : positionnement, CV et LinkedIn, candidatures, prospection ciblée et suivi. Demandez votre devis personnalisé à Talentiques.';

export const metadata: Metadata = {
  title: 'Accompagnement carrière de A à Z',
  description,
  alternates: { canonical: path, languages: { 'fr-FR': path } },
  openGraph: { title: 'Accompagnement carrière de A à Z | Talentiques', description, url: path, locale: 'fr_FR', type: 'website' },
};

export default function Page() {
  return <CareerAccompanimentPage countries={countryOptions()} quoteEnabled={quoteDeliveryEnabled(process.env)} />;
}
