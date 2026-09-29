import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/affiliate/admin-auth';
import { archiveProspect, completeTask, createProspect, deleteMessageTemplate, importProspects, saveCampaign, saveMessageTemplate, updateProspect } from '@/lib/acquisition/mutations';
import { findDuplicates, getAcquisitionState } from '@/lib/acquisition/queries';
import type { Activity, Campaign, MessageTemplate, Prospect } from '@/lib/acquisition/types';

export const dynamic = 'force-dynamic';

function unauthorized() { return NextResponse.json({ error: 'Authentification administrateur requise.' }, { status: 401 }); }
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}; }

export async function GET() {
  if (!await getAdminSession()) return unauthorized();
  try { return NextResponse.json(await getAcquisitionState(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) { console.error('Acquisition bootstrap failed', error); return NextResponse.json({ error: error instanceof Error ? error.message : 'Chargement impossible.' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!await getAdminSession()) return unauthorized();
  try {
    const body = object(await request.json());
    const action = String(body.action ?? '');
    if (action === 'create_prospect') return NextResponse.json(await createProspect(body.prospect as Prospect, { force: body.force === true, mergeId: typeof body.mergeId === 'string' ? body.mergeId : undefined }));
    if (action === 'update_prospect') return NextResponse.json(await updateProspect(String(body.id), object(body.patch) as Partial<Prospect>, body.event ? object(body.event) as Omit<Activity, 'id' | 'occurredAt'> : undefined));
    if (action === 'archive_prospect') { await archiveProspect(String(body.id)); return NextResponse.json({ ok: true }); }
    if (action === 'complete_task') { await completeTask(String(body.id)); return NextResponse.json({ ok: true }); }
    if (action === 'find_duplicates') return NextResponse.json({ duplicates: await findDuplicates(object(body.input)) });
    if (action === 'save_campaign') { await saveCampaign(body.campaign as Campaign); return NextResponse.json({ ok: true }); }
    if (action === 'save_template') { await saveMessageTemplate(body.template as MessageTemplate); return NextResponse.json({ ok: true }); }
    if (action === 'delete_template') { await deleteMessageTemplate(String(body.id)); return NextResponse.json({ ok: true }); }
    if (action === 'import_csv') return NextResponse.json(await importProspects(Array.isArray(body.rows) ? body.rows : [], body.forceDuplicates === true));
    return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
  } catch (error) {
    console.error('Acquisition mutation failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Mutation impossible.' }, { status: 500 });
  }
}
