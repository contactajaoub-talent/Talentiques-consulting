type Json = Record<string, unknown>;

export type ActiveAffiliate = {
  id: string;
  code: string;
  email: string;
  status: 'active';
  commission_rate: number | string;
};

function config() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw new Error('Affiliate Supabase configuration missing');
  return { url: url.replace(/\/$/, ''), serviceRole };
}

function headers(extra: HeadersInit = {}): HeadersInit {
  const { serviceRole } = config();
  return {
    apikey: serviceRole,
    Authorization: `Bearer ${serviceRole}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function jsonOrThrow(response: Response) {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = body && typeof body === 'object' ? (body as Json) : {};
    throw new Error(typeof error.message === 'string' ? error.message : `Supabase ${response.status}`);
  }
  return body;
}

export async function findActiveAffiliateByCode(code: string): Promise<ActiveAffiliate | null> {
  const { url } = config();
  const query = new URLSearchParams({
    select: 'id,code,email,status,commission_rate',
    code: `eq.${code}`,
    status: 'eq.active',
    limit: '1',
  });
  const response = await fetch(`${url}/rest/v1/affiliates?${query}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as ActiveAffiliate[];
  return rows?.[0] || null;
}

export async function findAffiliateByCode(code: string) {
  const { url } = config();
  const query = new URLSearchParams({ code: `eq.${code}`, limit: '1' });
  const response = await fetch(`${url}/rest/v1/affiliates?${query}`, {
    headers: headers(), cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function findAffiliateById(id: string) {
  const { url } = config();
  const query = new URLSearchParams({ id: `eq.${id}`, limit: '1' });
  const response = await fetch(`${url}/rest/v1/affiliates?${query}`, {
    headers: headers(), cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function findLatestAffiliateByEmail(email: string) {
  const { url } = config();
  const query = new URLSearchParams({
    email: `eq.${email}`,
    order: 'created_at.desc',
    limit: '1',
  });
  const response = await fetch(`${url}/rest/v1/affiliates?${query}`, {
    headers: headers(), cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function insertAffiliateApplication(payload: Json) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/affiliates`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  if (!rows?.[0]) throw new Error('Affiliate application creation failed');
  return rows[0];
}

export async function updateAffiliateStatus(
  affiliateId: string,
  fromStatus: string,
  payload: Json
) {
  const { url } = config();
  const query = new URLSearchParams({ id: `eq.${affiliateId}`, status: `eq.${fromStatus}` });
  const response = await fetch(`${url}/rest/v1/affiliates?${query}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function findActiveAffiliateByEmail(email: string) {
  const { url } = config();
  const query = new URLSearchParams({ email: `eq.${email}`, status: 'eq.active', limit: '1' });
  const response = await fetch(`${url}/rest/v1/affiliates?${query}`, { headers: headers(), cache: 'no-store' });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function insertAffiliateLoginToken(payload: Json) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/affiliate_login_tokens`, {
    method: 'POST', headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload), cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function hasRecentAffiliateLoginToken(affiliateId: string, since: string) {
  const { url } = config();
  const query = new URLSearchParams({ affiliate_id: `eq.${affiliateId}`, created_at: `gte.${since}`, limit: '1', select: 'id' });
  const response = await fetch(`${url}/rest/v1/affiliate_login_tokens?${query}`, { headers: headers(), cache: 'no-store' });
  const rows = (await jsonOrThrow(response)) as Json[];
  return Boolean(rows?.[0]);
}

export async function consumeAffiliateLoginTokenHash(tokenHash: string) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/rpc/consume_affiliate_login_token`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ p_token_hash: tokenHash }), cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function insertAffiliateSession(payload: Json) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/affiliate_sessions`, {
    method: 'POST', headers: headers({ Prefer: 'return=representation' }), body: JSON.stringify(payload), cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function findAffiliateSessionByHash(sessionHash: string) {
  const { url } = config();
  const query = new URLSearchParams({
    session_hash: `eq.${sessionHash}`, revoked_at: 'is.null', expires_at: `gt.${new Date().toISOString()}`,
    select: 'id,affiliate_id,created_at,expires_at,last_seen_at', limit: '1',
  });
  const response = await fetch(`${url}/rest/v1/affiliate_sessions?${query}`, { headers: headers(), cache: 'no-store' });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function touchAffiliateSession(sessionId: string) {
  const { url } = config();
  const query = new URLSearchParams({ id: `eq.${sessionId}`, revoked_at: 'is.null' });
  const response = await fetch(`${url}/rest/v1/affiliate_sessions?${query}`, {
    method: 'PATCH', headers: headers(), body: JSON.stringify({ last_seen_at: new Date().toISOString() }), cache: 'no-store',
  });
  await jsonOrThrow(response);
}

export async function revokeAffiliateSessionHash(sessionHash: string) {
  const { url } = config();
  const query = new URLSearchParams({ session_hash: `eq.${sessionHash}`, revoked_at: 'is.null' });
  const response = await fetch(`${url}/rest/v1/affiliate_sessions?${query}`, {
    method: 'PATCH', headers: headers(), body: JSON.stringify({ revoked_at: new Date().toISOString() }), cache: 'no-store',
  });
  await jsonOrThrow(response);
}

export async function releaseMatureAffiliateCommissions(affiliateId: string) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/rpc/release_mature_affiliate_commissions`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ p_affiliate_id: affiliateId }), cache: 'no-store',
  });
  return jsonOrThrow(response);
}

export async function getAffiliateDashboardRows(affiliateId: string) {
  const { url } = config();
  async function rows(table: string, select: string, extra: Record<string, string> = {}) {
    const query = new URLSearchParams({ select, affiliate_id: `eq.${affiliateId}`, limit: '10000', ...extra });
    const response = await fetch(`${url}/rest/v1/${table}?${query}`, { headers: headers(), cache: 'no-store' });
    return (await jsonOrThrow(response)) as Json[];
  }
  const [clicks, orders, commissions, payouts] = await Promise.all([
    rows('affiliate_clicks', 'created_at'),
    rows('store_orders', 'id,created_at,paid_at,product_id,market,amount,currency,status', { order: 'paid_at.desc.nullslast' }),
    rows('affiliate_commissions', 'order_id,product_id,market,order_amount,commission_amount,commission_rate,currency,status,created_at,available_at,paid_at', { order: 'created_at.desc' }),
    rows('affiliate_payouts', 'created_at,processed_at,currency,amount,status,method', { order: 'created_at.desc', limit: '100' }),
  ]);
  return { clicks, orders, commissions, payouts };
}

export async function insertAffiliateClick(payload: Json) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/affiliate_clicks`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  if (!rows?.[0]) throw new Error('Affiliate click creation failed');
  return rows[0] as { id: string } & Json;
}

export async function findAffiliateClick(clickId: string, affiliateId: string) {
  const { url } = config();
  const query = new URLSearchParams({
    select: 'id,affiliate_id',
    id: `eq.${clickId}`,
    affiliate_id: `eq.${affiliateId}`,
    limit: '1',
  });
  const response = await fetch(`${url}/rest/v1/affiliate_clicks?${query}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function findAffiliateCommissionByOrderId(orderId: string) {
  const { url } = config();
  const query = new URLSearchParams({ order_id: `eq.${orderId}`, limit: '1' });
  const response = await fetch(`${url}/rest/v1/affiliate_commissions?${query}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function createAffiliateCommission(payload: Json) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/affiliate_commissions?on_conflict=order_id`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=ignore-duplicates,return=representation' }),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function cancelAffiliateCommissionByOrderId(
  orderId: string,
  reason: 'refund' | 'dispute'
) {
  const { url } = config();
  const query = new URLSearchParams({
    order_id: `eq.${orderId}`,
    status: 'in.(pending,available)',
  });
  const response = await fetch(`${url}/rest/v1/affiliate_commissions?${query}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify({ status: 'cancelled', reason }),
    cache: 'no-store',
  });
  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}
