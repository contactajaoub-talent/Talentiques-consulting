import { NextResponse } from 'next/server';
import { getCurrentAffiliate } from '@/lib/affiliate/auth';
import { getAffiliateDashboardData, type DashboardPeriod } from '@/lib/affiliate/dashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const current = await getCurrentAffiliate();
  if (!current) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const requested = new URL(request.url).searchParams.get('period');
  const period: DashboardPeriod = requested === 'today' || requested === '7d' || requested === 'all' ? requested : '30d';
  const data = await getAffiliateDashboardData(current.affiliate, period);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
}

