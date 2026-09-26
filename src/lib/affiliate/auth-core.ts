import { createHash, randomBytes } from 'node:crypto';

export const LOGIN_TOKEN_TTL_MS = 15 * 60_000;
export const AFFILIATE_SESSION_TTL_MS = 30 * 24 * 60 * 60_000;

export function createSecureToken() {
  return randomBytes(32).toString('base64url');
}

export function hashAffiliateToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function affiliateSessionCookieOptions(production = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: production,
    path: '/',
    maxAge: AFFILIATE_SESSION_TTL_MS / 1000,
  };
}

export function shouldIssueMagicLink(affiliate: { status?: unknown } | null) {
  return affiliate?.status === 'active';
}

export function canConsumeLoginToken(
  token: { expires_at?: unknown; used_at?: unknown } | null,
  now = new Date()
) {
  if (!token || token.used_at) return false;
  const expires = typeof token.expires_at === 'string' ? Date.parse(token.expires_at) : Number.NaN;
  return Number.isFinite(expires) && expires > now.getTime();
}
