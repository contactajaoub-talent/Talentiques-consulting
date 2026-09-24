import { localizedMetadata } from '@/lib/i18n';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';

export const metadata = localizedMetadata('/outils/opportunity-tracker', "Opportunity Tracker Pro | TalentiQues", "Pilotez vos candidatures, relances, entretiens et opportunités avec un système réutilisable. Paiement unique, accès immédiat.");

export default function OpportunityTrackerPage() {
  return <ProductDetailPageFR productId="tracker" />;
}
