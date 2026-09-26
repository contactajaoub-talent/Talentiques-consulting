import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  AFFILIATE_CLICK_COOKIE_NAME,
  AFFILIATE_COOKIE_MAX_AGE,
  AFFILIATE_COOKIE_NAME,
  AFFILIATE_SESSION_COOKIE_NAME,
} from '@/lib/affiliate/core';
import { createAffiliateAttribution } from '@/lib/affiliate/service';
import {
  findActiveAffiliateByCode,
  insertAffiliateClick,
} from '@/lib/affiliate/supabase-rest';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(AFFILIATE_SESSION_COOKIE_NAME)?.value || crypto.randomUUID();
    const attribution = await createAffiliateAttribution(
      {
        ref: body.ref,
        pathname: body.pathname,
        tracking: body.tracking,
        anonymousSessionId: sessionId,
      },
      { findActiveAffiliateByCode, insertAffiliateClick }
    );

    if (!attribution) return NextResponse.json({ attributed: false });

    const response = NextResponse.json({ attributed: true, code: attribution.code });
    const options = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: AFFILIATE_COOKIE_MAX_AGE,
    };
    response.cookies.set(AFFILIATE_COOKIE_NAME, attribution.code, options);
    response.cookies.set(AFFILIATE_CLICK_COOKIE_NAME, attribution.clickId, options);
    response.cookies.set(AFFILIATE_SESSION_COOKIE_NAME, sessionId, options);
    return response;
  } catch (error) {
    console.error('Affiliate attribution error', error);
    return NextResponse.json({ attributed: false }, { status: 200 });
  }
}

