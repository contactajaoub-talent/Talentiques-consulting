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
