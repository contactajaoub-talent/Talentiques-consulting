import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AffiliateLoginPage from '@/components/affiliate/AffiliateLoginPage';
import { getCurrentAffiliate } from '@/lib/affiliate/auth';

export const metadata: Metadata = { title: 'Affiliate login', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentAffiliate()) redirect('/en/affiliate/dashboard');
  return <AffiliateLoginPage locale="en" invalid={(await searchParams).error === 'invalid'} />;
}

