import { localizedMetadata } from '@/lib/i18n';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';

export const metadata = localizedMetadata('/outils/cv-ats', "CV ATS System | TalentiQues", "7 modèles CV ATS, guide CV complet et guide LinkedIn offert. Paiement unique, accès immédiat.");

export default function CvAtsPage() {
  return <ProductDetailPageFR productId="ats" />;
}
