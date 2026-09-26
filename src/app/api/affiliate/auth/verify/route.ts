import { NextResponse } from 'next/server';
import { consumeAffiliateLoginToken, affiliateSessionCookieOptions } from '@/lib/affiliate/auth';
import { AFFILIATE_AUTH_SESSION_COOKIE_NAME } from '@/lib/affiliate/core';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token') || '';
  try {
    const verified = await consumeAffiliateLoginToken(token);
    if (verified) {
      const destination = verified.language === 'en' ? '/en/affiliate/dashboard' : '/affiliation/espace';
      const response = NextResponse.redirect(new URL(destination, requestUrl.origin));
      response.cookies.set(AFFILIATE_AUTH_SESSION_COOKIE_NAME, verified.rawSession, affiliateSessionCookieOptions());
      return response;
    }
  } catch (error) {
    console.error('Affiliate magic link verification error', error);
  }
  const fallback = requestUrl.searchParams.get('lang') === 'en' ? '/en/affiliate/login?error=invalid' : '/affiliation/connexion?error=invalid';
  return NextResponse.redirect(new URL(fallback, requestUrl.origin));
}

