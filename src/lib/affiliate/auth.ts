import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AFFILIATE_AUTH_SESSION_COOKIE_NAME } from './core.ts';
import {
  AFFILIATE_SESSION_TTL_MS,
  LOGIN_TOKEN_TTL_MS,
  createSecureToken,
  hashAffiliateToken,
  shouldIssueMagicLink,
} from './auth-core.ts';
import {
  consumeAffiliateLoginTokenHash,
  findActiveAffiliateByEmail,
  findAffiliateById,
  findAffiliateSessionByHash,
  hasRecentAffiliateLoginToken,
  insertAffiliateLoginToken,
  insertAffiliateSession,
  revokeAffiliateSessionHash,
  touchAffiliateSession,
} from './supabase-rest.ts';

export { affiliateSessionCookieOptions } from './auth-core.ts';

export async function createAffiliateLoginToken(email: string, language: 'fr' | 'en') {
  const affiliate = await findActiveAffiliateByEmail(email);
  if (!shouldIssueMagicLink(affiliate) || !affiliate || typeof affiliate.id !== 'string') return null;
  const cooldown = new Date(Date.now() - 2 * 60_000).toISOString();
  if (await hasRecentAffiliateLoginToken(affiliate.id, cooldown)) return null;
  const rawToken = createSecureToken();
  await insertAffiliateLoginToken({
    affiliate_id: affiliate.id,
    token_hash: hashAffiliateToken(rawToken),
    expires_at: new Date(Date.now() + LOGIN_TOKEN_TTL_MS).toISOString(),
    requested_language: language,
  });
  return { rawToken, affiliate };
}

export async function consumeAffiliateLoginToken(rawToken: string) {
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(rawToken)) return null;
  const consumed = await consumeAffiliateLoginTokenHash(hashAffiliateToken(rawToken));
  if (!consumed || typeof consumed.affiliate_id !== 'string') return null;
  const affiliate = await findAffiliateById(consumed.affiliate_id);
  if (!affiliate || affiliate.status !== 'active') return null;
  const rawSession = createSecureToken();
  await insertAffiliateSession({
    affiliate_id: affiliate.id,
    session_hash: hashAffiliateToken(rawSession),
    expires_at: new Date(Date.now() + AFFILIATE_SESSION_TTL_MS).toISOString(),
    last_seen_at: new Date().toISOString(),
  });
  return {
    rawSession,
    affiliate,
    language: consumed.requested_language === 'en' ? 'en' as const : 'fr' as const,
  };
}

export async function getAffiliateFromSessionToken(rawSession: string | undefined) {
  if (!rawSession) return null;
  const session = await findAffiliateSessionByHash(hashAffiliateToken(rawSession));
  if (!session || typeof session.affiliate_id !== 'string') return null;
  const affiliate = await findAffiliateById(session.affiliate_id);
  if (!affiliate || affiliate.status !== 'active') {
    await revokeAffiliateSessionHash(hashAffiliateToken(rawSession));
    return null;
  }
  const lastSeen = typeof session.last_seen_at === 'string' ? Date.parse(session.last_seen_at) : 0;
  if (Date.now() - lastSeen > 15 * 60_000 && typeof session.id === 'string') {
    await touchAffiliateSession(session.id);
  }
  return { affiliate, session };
}

export async function getCurrentAffiliate() {
  const cookieStore = await cookies();
  return getAffiliateFromSessionToken(cookieStore.get(AFFILIATE_AUTH_SESSION_COOKIE_NAME)?.value);
}

export async function requireAffiliateSession(locale: 'fr' | 'en') {
  const current = await getCurrentAffiliate();
  if (!current) redirect(locale === 'fr' ? '/affiliation/connexion' : '/en/affiliate/login');
  return current;
}

export async function revokeCurrentAffiliateSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(AFFILIATE_AUTH_SESSION_COOKIE_NAME)?.value;
  if (raw) await revokeAffiliateSessionHash(hashAffiliateToken(raw));
}
