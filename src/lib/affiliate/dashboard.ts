import { affiliateLinks } from './emails.ts';
import { getAffiliateDashboardRows, releaseMatureAffiliateCommissions } from './supabase-rest.ts';

type Json = Record<string, unknown>;
export type DashboardPeriod = 'today' | '7d' | '30d' | 'all';

function number(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
function date(value: unknown) { return typeof value === 'string' ? new Date(value) : new Date(0); }
function round(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }

function periodStart(period: DashboardPeriod, now: Date) {
  if (period === 'all') return new Date(0);
  if (period === 'today') return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(now); start.setUTCDate(start.getUTCDate() - (period === '7d' ? 7 : 30)); return start;
}

function totalsByCurrency(rows: Json[], amountKey: string) {
  const totals: Record<string, number> = {};
  for (const row of rows) {
    const currency = typeof row.currency === 'string' ? row.currency : '';
    if (currency === 'EUR' || currency === 'USD') totals[currency] = round((totals[currency] || 0) + number(row[amountKey]));
  }
  return totals;
}

export function conversionRate(clicks: number, sales: number) {
  return clicks > 0 ? round((sales / clicks) * 100) : 0;
}

export function affiliateProductLinks(code: string) {
  const ref = encodeURIComponent(code);
  return {
    fr: {
      tracker: `https://talentiques.com/outils/opportunity-tracker?ref=${ref}`,
      ats: `https://talentiques.com/outils/cv-ats?ref=${ref}`,
      bundle: `https://talentiques.com/outils/bundle?ref=${ref}`,
    },
    en: {
      tracker: `https://talentiques.com/en/tools/opportunity-tracker?ref=${ref}`,
      ats: `https://talentiques.com/en/tools/ats-resume?ref=${ref}`,
      bundle: `https://talentiques.com/en/tools/bundle?ref=${ref}`,
    },
  };
}

export function buildAffiliateLink(code: string, market: 'fr' | 'en', tracking: Record<string, string> = {}) {
  const base = market === 'fr' ? 'https://talentiques.com/outils' : 'https://talentiques.com/en/tools';
  const url = new URL(base); url.searchParams.set('ref', code);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = tracking[key]?.trim().slice(0, 100);
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export function buildDashboardData(affiliate: Json, rows: { clicks: Json[]; orders: Json[]; commissions: Json[]; payouts: Json[] }, period: DashboardPeriod, now = new Date()) {
  const start = periodStart(period, now);
  const clicks = rows.clicks.filter((item) => date(item.created_at) >= start);
  const eligibleOrders = rows.orders.filter((item) => item.status === 'paid' && date(item.paid_at || item.created_at) >= start);
  const orderMap = new Map(rows.orders.map((order) => [String(order.id), order]));
  const commissionRows: Array<Json & { order?: Json }> = rows.commissions.map((commission) =>
    Object.assign({}, commission, { order: orderMap.get(String(commission.order_id)) })
  );
  const eligibleCommission = commissionRows.filter((item) => item.order?.status === 'paid' && date(item.order.paid_at || item.created_at) >= start);
  const code = String(affiliate.code || '');
  const links = affiliateLinks(code);
  const balances = {
    pending: totalsByCurrency(rows.commissions.filter((item) => item.status === 'pending'), 'commission_amount'),
    available: totalsByCurrency(rows.commissions.filter((item) => item.status === 'available'), 'commission_amount'),
    paid: totalsByCurrency(rows.commissions.filter((item) => item.status === 'paid'), 'commission_amount'),
  };

  const chart = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (29 - index)));
    const key = day.toISOString().slice(0, 10);
    return {
      date: key,
      clicks: rows.clicks.filter((item) => date(item.created_at).toISOString().slice(0, 10) === key).length,
      sales: rows.orders.filter((item) => item.status === 'paid' && date(item.paid_at || item.created_at).toISOString().slice(0, 10) === key).length,
    };
  });

  const safeCommissions = commissionRows.slice(0, 100).map((item) => ({
    date: item.created_at, productId: item.product_id, market: item.market,
    orderAmount: number(item.order_amount), commissionAmount: number(item.commission_amount),
    currency: item.currency, status: item.status,
  }));

  return {
    affiliate: {
      fullName: affiliate.full_name, email: affiliate.email, country: affiliate.country,
      code, primaryChannel: affiliate.primary_channel, profileUrl: affiliate.profile_url,
      commissionRate: number(affiliate.commission_rate), status: affiliate.status, approvedAt: affiliate.approved_at,
    },
    links: { ...links, products: affiliateProductLinks(code) },
    period,
    metrics: {
      clicks: clicks.length, sales: eligibleOrders.length,
      conversionRate: conversionRate(clicks.length, eligibleOrders.length),
      revenue: totalsByCurrency(eligibleOrders, 'amount'),
      commissions: totalsByCurrency(eligibleCommission, 'commission_amount'),
      balances,
    },
    chart,
    recentSales: safeCommissions.filter((item) => item.status !== 'cancelled').slice(0, 10),
    commissionHistory: safeCommissions,
    payouts: rows.payouts.slice(0, 100).map((item) => ({
      date: item.processed_at || item.created_at, currency: item.currency,
      amount: number(item.amount), method: item.method, status: item.status,
    })),
  };
}

export async function getAffiliateDashboardData(affiliate: Json, period: DashboardPeriod = '30d') {
  if (typeof affiliate.id !== 'string') throw new Error('Invalid affiliate');
  await releaseMatureAffiliateCommissions(affiliate.id);
  const rows = await getAffiliateDashboardRows(affiliate.id);
  return buildDashboardData(affiliate, rows, period);
}

export type AffiliateDashboardData = ReturnType<typeof buildDashboardData>;
