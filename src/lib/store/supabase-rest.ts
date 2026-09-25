type Json = Record<string, unknown>;

function config() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error('Configuration Supabase Store incomplète');
  }

  return {
    url: url.replace(/\/$/, ''),
    serviceRole,
  };
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
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text.slice(0, 1000) };
    }
  }

  if (!response.ok) {
    const errorBody = body && typeof body === 'object' ? (body as Json) : {};
    const message =
      (typeof errorBody.message === 'string' && errorBody.message) ||
      (typeof errorBody.error === 'string' && errorBody.error) ||
      `Supabase ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export async function insertStoreOrder(payload: Json) {
  const { url } = config();
  const response = await fetch(`${url}/rest/v1/store_orders`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const rows = (await jsonOrThrow(response)) as Json[];
  if (!rows?.[0]) throw new Error('Création de commande impossible');
  return rows[0];
}

export async function updateStoreOrder(
  orderId: string,
  payload: Json,
  extraFilter = ''
) {
  const { url } = config();
  const query = `id=eq.${encodeURIComponent(orderId)}${extraFilter}`;
  const response = await fetch(`${url}/rest/v1/store_orders?${query}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function findStoreOrderById(orderId: string) {
  const { url } = config();
  const response = await fetch(
    `${url}/rest/v1/store_orders?id=eq.${encodeURIComponent(orderId)}&limit=1`,
    {
      headers: headers(),
      cache: 'no-store',
    }
  );

  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function findStoreOrderByPayPalId(paypalOrderId: string) {
  const { url } = config();
  const response = await fetch(
    `${url}/rest/v1/store_orders?paypal_order_id=eq.${encodeURIComponent(
      paypalOrderId
    )}&limit=1`,
    {
      headers: headers(),
      cache: 'no-store',
    }
  );

  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function findStoreOrderByAccessToken(accessToken: string) {
  const { url } = config();
  const response = await fetch(
    `${url}/rest/v1/store_orders?access_token=eq.${encodeURIComponent(
      accessToken
    )}&limit=1`,
    {
      headers: headers(),
      cache: 'no-store',
    }
  );

  const rows = (await jsonOrThrow(response)) as Json[];
  return rows?.[0] || null;
}

export async function getRecentPaidStoreOrders(limit = 6) {
  const { url } = config();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 10);
  const query = new URLSearchParams({
    select: 'customer_name,product_id,market',
    status: 'eq.paid',
    order: 'paid_at.desc.nullslast',
    limit: String(safeLimit),
  });
  const response = await fetch(`${url}/rest/v1/store_orders?${query}`, {
    headers: headers(),
    cache: 'no-store',
  });

  return (await jsonOrThrow(response)) as Array<{
    customer_name?: unknown;
    product_id?: unknown;
    market?: unknown;
  }>;
}

export async function claimOrderDelivery(orderId: string) {
  return updateStoreOrder(
    orderId,
    { delivery_status: 'sending' },
    '&delivery_status=in.(pending,failed)'
  );
}
