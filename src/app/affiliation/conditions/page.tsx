import type { Metadata } from 'next';
import AffiliateTermsPage from '@/components/affiliate/AffiliateTermsPage';

export const metadata: Metadata = { title: 'Conditions du programme d’affiliation', robots: { index: true, follow: true } };
export default function Page() { return <AffiliateTermsPage locale="fr" />; }

