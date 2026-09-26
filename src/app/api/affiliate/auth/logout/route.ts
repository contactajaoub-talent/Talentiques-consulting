import { NextResponse } from 'next/server';
import { affiliateSessionCookieOptions, revokeCurrentAffiliateSession } from '@/lib/affiliate/auth';
import { AFFILIATE_AUTH_SESSION_COOKIE_NAME } from '@/lib/affiliate/core';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  await revokeCurrentAffiliateSession();
  const url = new URL(request.url);
  const destination = url.searchParams.get('lang') === 'en' ? '/en/affiliate/login' : '/affiliation/connexion';
  const response = NextResponse.redirect(new URL(destination, url.origin), 303);
  response.cookies.set(AFFILIATE_AUTH_SESSION_COOKIE_NAME, '', { ...affiliateSessionCookieOptions(), maxAge: 0 });
  return response;
}

