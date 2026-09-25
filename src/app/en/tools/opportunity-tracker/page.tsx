import type { Metadata } from 'next';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';
export const metadata: Metadata = { title: 'Application Tracker Pro | TalentiQues', description: 'Organize applications, follow-ups, interviews and next actions in one reusable tracker.', alternates: { canonical: '/en/tools/opportunity-tracker', languages: { 'fr-FR': '/outils/opportunity-tracker', en: '/en/tools/opportunity-tracker' } } };
export default function Page() { return <ProductDetailPageFR productId="tracker" market="en" />; }
