import type { Metadata } from 'next';
import ProductDetailPageFR from '@/components/store/ProductDetailPageFR';
export const metadata: Metadata = { title: 'Career Search Bundle | TalentiQues', description: 'The complete system to organize your opportunity search, strengthen applications and manage every next action.', alternates: { canonical: '/en/tools/bundle', languages: { 'fr-FR': '/outils/bundle', en: '/en/tools/bundle' } } };
export default function Page() { return <ProductDetailPageFR productId="bundle" market="en" />; }
