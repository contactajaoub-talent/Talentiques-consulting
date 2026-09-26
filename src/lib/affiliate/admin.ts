import { createHash, timingSafeEqual } from 'node:crypto';

export function hasValidAffiliateAdminAuthorization(request: Request, secret = process.env.AFFILIATE_ADMIN_SECRET) {
  const authorization = request.headers.get('authorization');
  if (!secret?.trim() || !authorization?.startsWith('Bearer ')) return false;
  const expected = createHash('sha256').update(secret.trim()).digest();
  const provided = createHash('sha256').update(authorization.slice(7)).digest();
  return timingSafeEqual(expected, provided);
}

export const AFFILIATE_STATUS_TRANSITIONS = {
  approve: { from: 'pending', to: 'active' },
  reject: { from: 'pending', to: 'rejected' },
  suspend: { from: 'active', to: 'suspended' },
  reactivate: { from: 'suspended', to: 'active' },
} as const;

export type AffiliateStatusAction = keyof typeof AFFILIATE_STATUS_TRANSITIONS;

