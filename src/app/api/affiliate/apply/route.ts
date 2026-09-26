import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  affiliateCodeCandidate,
  duplicateApplicationMessage,
  validateAffiliateApplication,
} from '@/lib/affiliate/application';
import {
  sendAffiliateAdminNotification,
  sendApplicationConfirmation,
} from '@/lib/affiliate/emails';
import {
  findAffiliateByCode,
  findLatestAffiliateByEmail,
  insertAffiliateApplication,
} from '@/lib/affiliate/supabase-rest';

export const runtime = 'nodejs';

const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(request: Request) {
  const key = (request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown').trim().slice(0, 100);
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 10 * 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 5;
}

async function reserveCode(fullName: string) {
  for (let index = 0; index < 8; index += 1) {
    const suffix = index === 0 ? '' : randomBytes(3).toString('hex');
    const code = affiliateCodeCandidate(fullName, suffix);
    if (!(await findAffiliateByCode(code))) return code;
  }
  throw new Error('Unable to reserve affiliate code');
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json({ error: 'Too many applications. Please try again later.' }, { status: 429 });
  }

  try {
    const validation = validateAffiliateApplication(await request.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid application', fields: validation.errors }, { status: 400 });
    }

    const application = validation.data;
    const existing = await findLatestAffiliateByEmail(application.email);
    const duplicateMessage = duplicateApplicationMessage(existing?.status, application.application_language);
    if (duplicateMessage) {
      return NextResponse.json({ error: duplicateMessage, code: `duplicate_${String(existing?.status)}` }, { status: 409 });
    }

    const code = await reserveCode(application.full_name);
    const affiliate = await insertAffiliateApplication({
      code,
      full_name: application.full_name,
      email: application.email,
      country: application.country,
      status: 'pending',
      commission_rate: 0.5,
      payout_method: application.payout_preference,
      primary_channel: application.primary_channel,
      profile_url: application.profile_url,
      audience_size: application.audience_size,
      content_focus: application.content_focus,
      motivation: application.motivation,
      application_language: application.application_language,
      terms_accepted_at: application.terms_accepted_at,
      terms_version: application.terms_version,
    });

    const emailData = {
      fullName: application.full_name,
      email: application.email,
      code,
      language: application.application_language,
    };
    const emailResults = await Promise.allSettled([
      sendApplicationConfirmation(emailData),
      sendAffiliateAdminNotification({
        ...emailData,
        country: application.country,
        primaryChannel: application.primary_channel,
        profileUrl: application.profile_url,
        audienceSize: application.audience_size,
        contentFocus: application.content_focus.join(', '),
      }),
    ]);
    for (const result of emailResults) {
      if (result.status === 'rejected') console.error('Affiliate application email error', result.reason);
    }

    return NextResponse.json({ ok: true, status: affiliate.status || 'pending' }, { status: 201 });
  } catch (error) {
    console.error('Affiliate application error', error);
    return NextResponse.json({ error: 'Application could not be submitted.' }, { status: 500 });
  }
}
