import type { Metadata } from 'next';
import AffiliateTermsPage from '@/components/affiliate/AffiliateTermsPage';

export const metadata: Metadata = { title: 'Affiliate Program Terms', robots: { index: true, follow: true } };
export default function Page() { return <AffiliateTermsPage locale="en" />; }

