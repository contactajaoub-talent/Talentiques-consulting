export const runtime = 'nodejs';

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers });
  }
  const orderId = body && typeof body === 'object' && !Array.isArray(body)
    ? (body as { orderId?: unknown }).orderId : undefined;
  if (typeof orderId !== 'string' || !/^[A-Z0-9-]{6,64}$/i.test(orderId)) {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers });
  }
  try {
    const response = await fetch('https://app.talentiques.com/api/payments/career-search/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ orderId }),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(60_000),
    });
    const payload = await response.json();
    if (!response.ok || payload?.ok !== true) {
      return Response.json({ error: 'payment_failed' }, { status: 502, headers });
    }
    return Response.json({ ok: true }, { headers });
  } catch {
    return Response.json({ error: 'payment_failed' }, { status: 502, headers });
  }
}
