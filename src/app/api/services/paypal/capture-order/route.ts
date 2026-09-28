import { NextResponse } from 'next/server';
import { getServiceOffer, isServiceId, isServiceMarket, serviceMoneyMatches } from '@/lib/services/catalog';
import { findServiceOrderById, updateServiceOrder } from '@/lib/services/supabase-rest';
import { paypalFetch } from '@/lib/store/paypal';

export const runtime = 'nodejs';

type PayPalOrder = {
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: { captures?: Array<{ id?: string; status?: string; amount?: { currency_code?: string; value?: string } }> };
  }>;
};

function captureFrom(order: PayPalOrder) {
  return order.purchase_units?.[0]?.payments?.captures?.[0];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: unknown };
    const paypalOrderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    if (!paypalOrderId) return NextResponse.json({ error: 'Commande PayPal manquante' }, { status: 400 });

    const lookupResponse = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
    let order = (await lookupResponse.json()) as PayPalOrder;
    if (!lookupResponse.ok) return NextResponse.json({ error: 'Commande PayPal introuvable' }, { status: 400 });

    const internalOrderId = order.purchase_units?.[0]?.custom_id;
    if (!internalOrderId) return NextResponse.json({ error: 'Référence de commande invalide' }, { status: 400 });
    const stored = await findServiceOrderById(internalOrderId);
    if (!stored || stored.paypal_order_id !== paypalOrderId) {
      return NextResponse.json({ error: 'Commande non reconnue' }, { status: 400 });
    }
    if (stored.status === 'paid') {
      return NextResponse.json({ ok: true, status: 'COMPLETED', replay: true });
    }
    if (!isServiceId(stored.service_id) || !isServiceMarket(stored.market)) {
      return NextResponse.json({ error: 'Configuration service invalide' }, { status: 500 });
    }
    const expected = getServiceOffer(stored.service_id, stored.market);
    const amount = order.purchase_units?.[0]?.amount;
    if (amount?.currency_code !== expected.currency || !serviceMoneyMatches(expected.amount, amount?.value)) {
      return NextResponse.json({ error: 'Le montant du paiement ne correspond pas au service' }, { status: 400 });
    }

    if (order.status !== 'COMPLETED') {
      const captureResponse = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
        method: 'POST',
        headers: { 'PayPal-Request-Id': `service-capture-${paypalOrderId}` },
        body: '{}',
      });
      const capturePayload = (await captureResponse.json()) as PayPalOrder;
      if (!captureResponse.ok) {
        const retryResponse = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
        const retry = (await retryResponse.json()) as PayPalOrder;
        if (!retryResponse.ok || retry.status !== 'COMPLETED') {
          return NextResponse.json({ error: 'Le paiement n’a pas pu être finalisé' }, { status: 400 });
        }
        order = retry;
      } else {
        order = capturePayload;
      }
    }

    const capture = captureFrom(order);
    if (order.status !== 'COMPLETED' || !capture?.id || capture.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Paiement non complété' }, { status: 400 });
    }
    if (capture.amount?.currency_code !== expected.currency || !serviceMoneyMatches(expected.amount, capture.amount?.value)) {
      return NextResponse.json({ error: 'La capture PayPal ne correspond pas au service' }, { status: 400 });
    }

    await updateServiceOrder(internalOrderId, {
      status: 'paid',
      paypal_capture_id: capture.id,
      paid_at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, status: order.status, amount: expected.amount, currency: expected.currency });
  } catch (error) {
    console.error('Service PayPal capture-order error', error);
    return NextResponse.json({ error: 'Impossible de confirmer le paiement' }, { status: 500 });
  }
}
