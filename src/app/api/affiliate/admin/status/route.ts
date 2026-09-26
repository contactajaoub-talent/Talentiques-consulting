import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/affiliate/admin-auth';
import { insertAdminAudit } from '@/lib/affiliate/admin-supabase';
import {
  AFFILIATE_STATUS_TRANSITIONS,
  hasValidAffiliateAdminAuthorization,
  type AffiliateStatusAction,
} from '@/lib/affiliate/admin';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/affiliate/emails';
import {
  findAffiliateById,
  findLatestAffiliateByEmail,
  updateAffiliateStatus,
} from '@/lib/affiliate/supabase-rest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const adminSession = await getAdminSession();
  if (!adminSession && !hasValidAffiliateAdminAuthorization(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const action = typeof body.action === 'string' ? body.action as AffiliateStatusAction : '';
    const transition = AFFILIATE_STATUS_TRANSITIONS[action as AffiliateStatusAction];
    if (!transition) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const id = typeof body.affiliateId === 'string' ? body.affiliateId.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const affiliate = id ? await findAffiliateById(id) : email ? await findLatestAffiliateByEmail(email) : null;
    if (!affiliate || typeof affiliate.id !== 'string') {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    const rejectionReason = typeof body.rejectionReason === 'string'
      ? body.rejectionReason.trim().slice(0, 1000) || null
      : null;
    const payload: Record<string, unknown> = { status: transition.to };
    if (action === 'approve' || action === 'reactivate') {
      payload.commission_rate = 0.5;
      payload.rejection_reason = null;
      if (action === 'approve') payload.approved_at = new Date().toISOString();
    }
    if (action === 'reject') payload.rejection_reason = rejectionReason;

    const updated = await updateAffiliateStatus(affiliate.id, transition.from, payload);
    if (!updated) {
      return NextResponse.json({ error: `Affiliate must be ${transition.from}` }, { status: 409 });
    }

    await insertAdminAudit({
      admin_identity: String(adminSession?.email || 'legacy-admin-secret'),
      action: `affiliate_${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'suspend' ? 'suspended' : 'reactivated'}`,
      affiliate_id: affiliate.id,
    });

    const emailData = {
      fullName: String(updated.full_name || ''),
      email: String(updated.email || ''),
      code: String(updated.code || ''),
      language: updated.application_language === 'en' ? 'en' as const : 'fr' as const,
    };
    try {
      if (action === 'approve' || action === 'reactivate') await sendApprovalEmail(emailData);
      if (action === 'reject') await sendRejectionEmail(emailData);
    } catch (error) {
      console.error('Affiliate status email error', error);
    }

    return NextResponse.json({ ok: true, status: transition.to });
  } catch (error) {
    console.error('Affiliate admin status error', error);
    return NextResponse.json({ error: 'Status update failed' }, { status: 500 });
  }
}
