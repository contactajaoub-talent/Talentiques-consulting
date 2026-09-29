import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/affiliate/admin-auth';
import { getAcquisitionState } from '@/lib/acquisition/queries';

const columns = ['first_name','last_name','linkedin_url','email','phone','country','city','language','job_title','company','source','campaign','status','score','product','next_action','next_action_at'] as const;
function csvCell(value: unknown) { const text = String(value ?? ''); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }

export async function GET(request: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Authentification administrateur requise.' }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const state = await getAcquisitionState();
  const campaignNames = new Map(state.campaigns.map((campaign) => [campaign.id, campaign.name]));
  const prospects = state.prospects.filter((item) =>
    (!params.get('status') || item.status === params.get('status')) &&
    (!params.get('market') || item.market === params.get('market')) &&
    (!params.get('campaign') || item.campaignId === params.get('campaign')) &&
    (!params.get('q') || `${item.firstName} ${item.lastName} ${item.company} ${item.jobTitle}`.toLowerCase().includes(String(params.get('q')).toLowerCase()))
  );

  const rows = prospects.map((item) => [
    item.firstName,
    item.lastName,
    item.linkedinUrl,
    item.email,
    item.phone,
    item.country,
    item.city,
    item.language,
    item.jobTitle,
    item.company,
    item.source,
    campaignNames.get(item.campaignId) ?? '',
    item.status,
    item.score,
    item.potentialProduct,
    item.nextAction,
    item.nextActionAt,
  ]);

  const csv = `\uFEFF${columns.join(',')}\r\n${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="talentiques-prospects-${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' } });
}
