import type { Metadata } from 'next';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';
export const metadata: Metadata = { title: 'ATS Resume & LinkedIn Pro | TalentiQues', description: 'Build stronger applications with editable ATS resume templates and a practical LinkedIn optimization guide.', alternates: { canonical: '/en/tools/ats-resume', languages: { 'fr-FR': '/outils/cv-ats', en: '/en/tools/ats-resume' } } };
export default function Page() { return <ProductDetailPageFR productId="ats" market="en" />; }
