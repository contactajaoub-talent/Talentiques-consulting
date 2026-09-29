import 'server-only';

export type JsonRow = Record<string, unknown>;
const SCHEMA = 'acquisition';

function config() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Configuration Supabase Acquisition OS incomplète');
  return { url: url.replace(/\/$/, ''), key };
}

function headers(method = 'GET', extra: HeadersInit = {}): HeadersInit {
  const { key } = config();
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', [method === 'GET' ? 'Accept-Profile' : 'Content-Profile']: SCHEMA, ...extra };
}

async function parse(response: Response) {
  const raw = await response.text();
  let body: unknown = null;
  try { body = raw ? JSON.parse(raw) : null; } catch { body = { message: raw.slice(0, 500) }; }
  if (!response.ok) {
    const detail = body && typeof body === 'object' && 'message' in body ? String((body as { message: unknown }).message) : `Supabase ${response.status}`;
    throw new Error(`Acquisition OS: ${detail}`);
  }
  return body;
}

export async function selectRows(table: string, params: Record<string, string> = {}) {
  const { url } = config();
  const query = new URLSearchParams(params);
  return parse(await fetch(`${url}/rest/v1/${table}?${query}`, { headers: headers('GET'), cache: 'no-store' })) as Promise<JsonRow[]>;
}

export async function selectAllRows(table: string, params: Record<string, string> = {}, pageSize = 500) {
  const rows: JsonRow[] = [];
  let offset = 0;
  const base = { ...params };
  delete base.limit;
  delete base.offset;

  while (true) {
    const batch = await selectRows(table, { ...base, limit: String(pageSize), offset: String(offset) });
    rows.push(...batch);
    if (batch.length < pageSize) break;
    offset += batch.length;
  }

  return rows;
}

export async function insertRows(table: string, payload: JsonRow | JsonRow[]) {
  const { url } = config();
  return parse(await fetch(`${url}/rest/v1/${table}`, { method: 'POST', headers: headers('POST', { Prefer: 'return=representation' }), body: JSON.stringify(payload), cache: 'no-store' })) as Promise<JsonRow[]>;
}

export async function updateRows(table: string, filters: Record<string, string>, payload: JsonRow) {
  const { url } = config();
  const query = new URLSearchParams(filters);
  return parse(await fetch(`${url}/rest/v1/${table}?${query}`, { method: 'PATCH', headers: headers('PATCH', { Prefer: 'return=representation' }), body: JSON.stringify(payload), cache: 'no-store' })) as Promise<JsonRow[]>;
}

export async function deleteRows(table: string, filters: Record<string, string>) {
  const { url } = config();
  const query = new URLSearchParams(filters);
  await parse(await fetch(`${url}/rest/v1/${table}?${query}`, { method: 'DELETE', headers: headers('DELETE'), cache: 'no-store' }));
}
