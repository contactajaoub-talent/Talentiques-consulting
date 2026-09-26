import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAffiliateLoginToken } from '@/lib/affiliate/auth';
import { normalizeEmail } from '@/lib/affiliate/core';
import { sendAffiliateLoginEmail } from '@/lib/affiliate/emails';

export const runtime = 'nodejs';
const attempts = new Map<string, { count: number; resetAt: number }>();

function generic(language: 'fr' | 'en') {
  return language === 'fr'
    ? 'Si un compte affilié actif correspond à cette adresse, vous recevrez un lien de connexion.'
    : "If an active affiliate account matches this email, you'll receive a login link.";
}

function throttled(request: Request, email: string) {
  const ip = (request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim();
  const key = createHash('sha256').update(`${ip}:${email}`).digest('hex');
  const now = Date.now(); const current = attempts.get(key);
  if (!current || current.resetAt <= now) { attempts.set(key, { count: 1, resetAt: now + 10 * 60_000 }); return false; }
  current.count += 1; return current.count > 5;
}

export async function POST(request: Request) {
  let language: 'fr' | 'en' = 'fr';
  try {
    const body = await request.json() as Record<string, unknown>;
    language = body.language === 'en' ? 'en' : 'fr';
    const email = normalizeEmail(body.email);
    if (!email || throttled(request, email)) return NextResponse.json({ ok: true, message: generic(language) });
    const created = await createAffiliateLoginToken(email, language);
    if (created) {
      const configured = process.env.NEXT_PUBLIC_APP_URL || 'https://talentiques.com';
      const origin = /^https?:\/\//i.test(configured) ? configured.replace(/\/$/, '') : `https://${configured}`;
      const loginUrl = `${origin}/api/affiliate/auth/verify?token=${encodeURIComponent(created.rawToken)}`;
      await sendAffiliateLoginEmail({
        fullName: String(created.affiliate.full_name || ''), email: String(created.affiliate.email || email),
        code: String(created.affiliate.code || ''), language, loginUrl,
      });
    }
  } catch (error) {
    console.error('Affiliate login request error', error);
  }
  return NextResponse.json({ ok: true, message: generic(language) });
}

