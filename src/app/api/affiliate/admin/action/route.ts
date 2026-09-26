import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/affiliate/admin-auth';
import { addAdminNote, completePayoutItem, createPayoutBatch, getPayoutItem, insertAdminAudit, updatePayoutBatch } from '@/lib/affiliate/admin-supabase';
import { sendAffiliatePayoutPaidEmail } from '@/lib/affiliate/emails';

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  try {
    const body = await request.json() as Record<string, unknown>;
    const identity = String(admin.email || 'admin');
    if (body.kind === 'create_batch') {
      const currency = body.currency === 'USD' ? 'USD' : 'EUR';
      const ids = Array.isArray(body.affiliateIds) ? body.affiliateIds.filter((id): id is string => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)).slice(0, 500) : [];
      if (!ids.length) return NextResponse.json({ error: 'No affiliates selected' }, { status: 400 });
      const id = await createPayoutBatch(currency, ids, identity, typeof body.notes === 'string' ? body.notes.slice(0, 1000) : undefined);
      return NextResponse.json({ ok: true, id });
    }
    if (body.kind === 'batch') {
      if (typeof body.batchId !== 'string' || !['approve', 'cancel'].includes(String(body.action))) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
      return NextResponse.json({ ok: true, status: await updatePayoutBatch(body.batchId, String(body.action), identity) });
    }
    if (body.kind === 'payout_item') {
      if (typeof body.itemId !== 'string' || !['paid', 'failed'].includes(String(body.result))) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
      const result = String(body.result);
      const status = await completePayoutItem(body.itemId, result, identity, typeof body.reference === 'string' ? body.reference.slice(0, 500) : undefined, typeof body.reason === 'string' ? body.reason.slice(0, 1000) : undefined);
      if (result === 'paid' && status === 'paid') {
        try {
          const item = await getPayoutItem(body.itemId);
          const affiliate = item?.affiliate as Record<string, unknown> | undefined;
          if (affiliate?.email) await sendAffiliatePayoutPaidEmail({ email: String(affiliate.email), fullName: String(affiliate.full_name || 'Partner'), code: String(affiliate.code || ''), language: affiliate.application_language === 'en' ? 'en' : 'fr', amount: Number(item.amount || 0).toFixed(2), currency: String(item.currency || 'EUR'), method: String(item.payout_method || ''), paymentDate: new Date().toISOString().slice(0, 10) });
        } catch (emailError) { console.error('Payout confirmation email failed', emailError); }
      }
      return NextResponse.json({ ok: true, status });
    }
    if (body.kind === 'note') {
      if (typeof body.affiliateId !== 'string' || typeof body.note !== 'string' || body.note.trim().length < 2) return NextResponse.json({ error: 'Invalid note' }, { status: 400 });
      await addAdminNote(body.affiliateId, body.note.trim().slice(0, 2000), identity);
      await insertAdminAudit({ admin_identity: identity, action: 'admin_note_created', affiliate_id: body.affiliateId });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin action error', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 409 });
  }
}
