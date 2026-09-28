import type { Metadata } from 'next';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';

export const metadata: Metadata = {
  title: 'Career Search 360 | TalentiQues',
  description:
    'Opportunity Management System + Career Branding Toolkit + guides premium dans une seule offre. Paiement unique, accès immédiat.',
};

export default function CareerSearchBundlePage() {
  return <ProductDetailPageFR productId="bundle" />;
}
