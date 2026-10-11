export const runtime = 'nodejs';

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers });
  }
  const input = body && typeof body === 'object' && !Array.isArray(body) ? body as Record<string, unknown> : {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const locale = input.locale === undefined ? 'fr' : input.locale;
  if (name.length < 2 || name.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (locale !== 'fr' && locale !== 'en')) {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers });
  }
  try {
    const response = await fetch('https://app.talentiques.com/api/payments/career-search/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name, email, locale }),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(35_000),
    });
    const payload = await response.json();
    if (!response.ok || typeof payload?.id !== 'string' || !/^[A-Z0-9-]{6,64}$/i.test(payload.id)) {
      return Response.json({ error: 'checkout_unavailable' }, { status: response.status === 400 ? 400 : 502, headers });
    }
    return Response.json({ id: payload.id }, { headers });
  } catch {
    return Response.json({ error: 'checkout_unavailable' }, { status: 502, headers });
  }
}
