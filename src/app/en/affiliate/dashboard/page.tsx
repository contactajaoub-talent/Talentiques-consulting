import type { Metadata } from 'next';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';
import { requireAffiliateSession } from '@/lib/affiliate/auth';
import { getAffiliateDashboardData } from '@/lib/affiliate/dashboard';

export const metadata: Metadata = { title: 'Affiliate dashboard', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function Page() {
  const { affiliate } = await requireAffiliateSession('en');
  return <AffiliateDashboard locale="en" initialData={await getAffiliateDashboardData(affiliate)} />;
}

