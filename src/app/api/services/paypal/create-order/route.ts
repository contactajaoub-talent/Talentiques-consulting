import { NextResponse } from 'next/server';
import { getServiceOffer, isServiceId, isServiceMarket } from '@/lib/services/catalog';
import { insertServiceOrder, updateServiceOrder } from '@/lib/services/supabase-rest';
import { paypalFetch } from '@/lib/store/paypal';

export const runtime = 'nodejs';

function text(value: unknown, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let internalOrderId = '';
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (!isServiceId(body.serviceId) || !isServiceMarket(body.market)) {
      return NextResponse.json({ error: 'Service invalide' }, { status: 400 });
    }

    const customer = body.customer && typeof body.customer === 'object'
      ? body.customer as Record<string, unknown>
      : {};
    const name = text(customer.name, 150);
    const email = text(customer.email, 254).toLowerCase();
    const phone = text(customer.phone, 50);
    const country = text(customer.country, 100);
    if (!name || !validEmail(email) || !phone || !country) {
      return NextResponse.json({ error: 'Informations client invalides' }, { status: 400 });
    }

    const service = getServiceOffer(body.serviceId, body.market);
    internalOrderId = crypto.randomUUID();
    await insertServiceOrder({
      id: internalOrderId,
      service_id: service.id,
      market: service.market,
      service_name: service.name,
      amount: Number(service.amount),
      currency: service.currency,
      status: 'pending',
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_country: country,
    });

    const response = await paypalFetch('/v2/checkout/orders', {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `service-create-${internalOrderId}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: `talentiques-service-${service.market}-${service.id}`,
          custom_id: internalOrderId,
          description: service.paypalDescription,
          amount: { currency_code: service.currency, value: service.amount },
        }],
        application_context: {
          brand_name: 'TalentiQues',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload?.id) {
      await updateServiceOrder(internalOrderId, { status: 'paypal_create_failed' });
      return NextResponse.json({ error: 'Création du paiement PayPal impossible' }, { status: 502 });
    }
    await updateServiceOrder(internalOrderId, { paypal_order_id: payload.id });
    return NextResponse.json({ id: payload.id });
  } catch (error) {
    console.error('Service PayPal create-order error', error);
    if (internalOrderId) {
      try { await updateServiceOrder(internalOrderId, { status: 'paypal_create_failed' }); } catch {}
    }
    return NextResponse.json({ error: 'Impossible de démarrer le paiement' }, { status: 500 });
  }
}
