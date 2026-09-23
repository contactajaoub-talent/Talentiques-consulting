import type { Metadata } from 'next';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';

export const metadata: Metadata = {
  title: 'Career Search Bundle | TalentiQues',
  description:
    'Opportunity Tracker Pro + CV ATS System + guides premium dans une seule offre. Paiement unique, accès immédiat.',
};

export default function CareerSearchBundlePage() {
  return <ProductDetailPageFR productId="bundle" />;
}
