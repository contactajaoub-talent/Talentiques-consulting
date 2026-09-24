import { localizedMetadata } from '@/lib/i18n';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';

export const metadata = localizedMetadata('/outils/bundle', "Career Search Bundle | TalentiQues", "Opportunity Tracker Pro + CV ATS System + guides premium dans une seule offre. Paiement unique, accès immédiat.");

export default function CareerSearchBundlePage() {
  return <ProductDetailPageFR productId="bundle" />;
}
