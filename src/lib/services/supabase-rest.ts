type Json = Record<string, unknown>;

function config() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) throw new Error('Configuration Supabase Services incomplète');
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

async function rows(response: Response) {
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`Supabase Services ${response.status}: ${text.slice(0, 500)}`);
  return body as Json[];
}

export async function insertServiceOrder(payload: Json) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/service_orders`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const result = await rows(response);
  if (!result?.[0]) throw new Error('Création de commande service impossible');
  return result[0];
}

export async function updateServiceOrder(id: string, payload: Json) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/service_orders?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  return (await rows(response))?.[0] || null;
}

export async function findServiceOrderById(id: string) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/service_orders?id=eq.${encodeURIComponent(id)}&limit=1`, {
    headers: headers(), cache: 'no-store',
  });
  return (await rows(response))?.[0] || null;
}
