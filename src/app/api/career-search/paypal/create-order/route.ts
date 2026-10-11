export const runtime = 'nodejs';

export async function POST() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const response = await fetch('https://app.talentiques.com/api/payments/career-search/create-order', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(35_000),
    });
    const payload = await response.json();
    if (!response.ok || typeof payload?.id !== 'string' || !/^[A-Z0-9-]{6,64}$/i.test(payload.id)) {
      return Response.json({ error: 'checkout_unavailable' }, { status: 502, headers });
    }
    return Response.json({ id: payload.id }, { headers });
  } catch {
    return Response.json({ error: 'checkout_unavailable' }, { status: 502, headers });
  }
}
