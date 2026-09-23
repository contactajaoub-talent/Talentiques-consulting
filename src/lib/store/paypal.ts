function paypalBaseUrl() {
  const environment = process.env.PAYPAL_ENV?.toLowerCase();
  if (environment === 'sandbox') return 'https://api-m.sandbox.paypal.com';
  if (environment === 'live') return 'https://api-m.paypal.com';
  throw new Error('PAYPAL_ENV doit être défini sur sandbox ou live');
}

function paypalClientId() {
  const value = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  if (!value) throw new Error('NEXT_PUBLIC_PAYPAL_CLIENT_ID manquant');
  return value;
}

function paypalClientSecret() {
  const value = process.env.PAYPAL_CLIENT_SECRET;
  if (!value) throw new Error('PAYPAL_CLIENT_SECRET manquant');
  return value;
}

export async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${paypalClientId()}:${paypalClientSecret()}`
  ).toString('base64');

  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  const payload = await response.json();

  if (!response.ok || !payload?.access_token) {
    throw new Error('Authentification PayPal impossible');
  }

  return payload.access_token as string;
}

export async function paypalFetch(path: string, init: RequestInit = {}) {
  const token = await getPayPalAccessToken();

  return fetch(`${paypalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
}
