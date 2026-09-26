export const AFFILIATE_COOKIE_NAME = 'tq_affiliate_ref';
export const AFFILIATE_CLICK_COOKIE_NAME = 'tq_affiliate_click';
export const AFFILIATE_SESSION_COOKIE_NAME = 'tq_affiliate_session';
export const AFFILIATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export type AffiliateMarket = 'fr' | 'en';

export function normalizeAffiliateCode(value: unknown) {
  if (typeof value !== 'string') return null;
  const code = value.trim().toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/.test(code)) return null;
  return code;
}

export function affiliateMarketFromPath(pathname: string): AffiliateMarket | null {
  if (pathname === '/outils' || pathname.startsWith('/outils/')) return 'fr';
  if (pathname === '/en/tools' || pathname.startsWith('/en/tools/')) return 'en';
  return null;
}

export function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function calculateCommission(orderAmount: number, commissionRate: number) {
  if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
    throw new Error('Invalid affiliate order amount');
  }
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 1) {
    throw new Error('Invalid affiliate commission rate');
  }
  return Math.round((orderAmount * commissionRate + Number.EPSILON) * 100) / 100;
}

export function commissionAvailableAt(paidAt: string | Date) {
  const date = new Date(paidAt);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid paid date');
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString();
}

export function isSelfReferral(customerEmail: unknown, affiliateEmail: unknown) {
  const customer = normalizeEmail(customerEmail);
  const affiliate = normalizeEmail(affiliateEmail);
  return Boolean(customer && affiliate && customer === affiliate);
}

export function affiliateCancellationReason(eventType: unknown) {
  if (eventType === 'PAYMENT.CAPTURE.REFUNDED' || eventType === 'PAYMENT.CAPTURE.REVERSED') {
    return 'refund' as const;
  }
  if (eventType === 'CUSTOMER.DISPUTE.CREATED') return 'dispute' as const;
  return null;
}
