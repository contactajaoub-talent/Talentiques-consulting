import type { Metadata } from 'next';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';

export const metadata: Metadata = {
  title: 'CV ATS System | TalentiQues',
  description:
    '7 modèles CV ATS, guide CV complet et guide LinkedIn offert. Paiement unique, accès immédiat.',
};

export default function CvAtsPage() {
  return <ProductDetailPageFR productId="ats" />;
}
