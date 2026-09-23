import type { Metadata } from 'next';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';

export const metadata: Metadata = {
  title: 'Opportunity Tracker Pro | TalentiQues',
  description:
    'Pilotez vos candidatures, relances, entretiens et opportunités avec un système réutilisable. Paiement unique, accès immédiat.',
};

export default function OpportunityTrackerPage() {
  return <ProductDetailPageFR productId="tracker" />;
}
