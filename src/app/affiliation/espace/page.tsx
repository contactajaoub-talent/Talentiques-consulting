import type { Metadata } from 'next';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';
import { requireAffiliateSession } from '@/lib/affiliate/auth';
import { getAffiliateDashboardData } from '@/lib/affiliate/dashboard';

export const metadata: Metadata = { title: 'Espace affilié', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function Page() {
  const { affiliate } = await requireAffiliateSession('fr');
  return <AffiliateDashboard locale="fr" initialData={await getAffiliateDashboardData(affiliate)} />;
}

