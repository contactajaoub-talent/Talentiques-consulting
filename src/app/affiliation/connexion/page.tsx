import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AffiliateLoginPage from '@/components/affiliate/AffiliateLoginPage';
import { getCurrentAffiliate } from '@/lib/affiliate/auth';

export const metadata: Metadata = { title: 'Connexion affilié', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentAffiliate()) redirect('/affiliation/espace');
  return <AffiliateLoginPage locale="fr" invalid={(await searchParams).error === 'invalid'} />;
}

