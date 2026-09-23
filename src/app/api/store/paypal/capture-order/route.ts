import { NextResponse } from 'next/server';
import {
  getStoreProduct,
  isStoreMarket,
  isStoreProductId,
} from '@/lib/store/catalog';
import { fulfillStorePayment } from '@/lib/store/fulfill';
import { paypalFetch } from '@/lib/store/paypal';
import {
  findStoreOrderById,
  findStoreOrderByPayPalId,
} from '@/lib/store/supabase-rest';

export const runtime = 'nodejs';

type PayPalOrder = {
  id?: string;
  status?: string;
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
  };
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: { currency_code?: string; value?: string };
      }>;
    };
  }>;
};

function captureFrom(order: PayPalOrder) {
  return order.purchase_units?.[0]?.payments?.captures?.[0];
}

function moneyMatches(expected: string, actual?: string) {
  const a = Number(expected);
  const b = Number(actual);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 0.001;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: unknown };
    const paypalOrderId =
      typeof body.orderId === 'string' ? body.orderId.trim() : '';

    if (!paypalOrderId) {
      return NextResponse.json({ error: 'Commande PayPal manquante' }, { status: 400 });
    }

    const orderLookupResponse = await paypalFetch(
      `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`
    );
    const orderLookup = (await orderLookupResponse.json()) as PayPalOrder;

    if (!orderLookupResponse.ok) {
      return NextResponse.json(
        { error: 'Commande PayPal introuvable' },
        { status: 400 }
      );
    }

    const internalOrderId = orderLookup.purchase_units?.[0]?.custom_id;
    if (!internalOrderId) {
      return NextResponse.json(
        { error: 'Référence de commande invalide' },
        { status: 400 }
      );
    }

    const raw = await findStoreOrderById(internalOrderId);
    if (!raw || raw.paypal_order_id !== paypalOrderId) {
      return NextResponse.json(
        { error: 'Commande non reconnue' },
        { status: 400 }
      );
    }

    if (!isStoreProductId(raw.product_id) || !isStoreMarket(raw.market)) {
      return NextResponse.json(
        { error: 'Configuration produit invalide' },
        { status: 500 }
      );
    }

    const expected = getStoreProduct(raw.product_id, raw.market);
    const orderAmount = orderLookup.purchase_units?.[0]?.amount;

    if (
      orderAmount?.currency_code !== expected.currency ||
      !moneyMatches(expected.amount, orderAmount?.value)
    ) {
      return NextResponse.json(
        { error: 'Le montant du paiement ne correspond pas au produit' },
        { status: 400 }
      );
    }

    let completedOrder = orderLookup;

    if (orderLookup.status !== 'COMPLETED') {
      const captureResponse = await paypalFetch(
        `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`,
        {
          method: 'POST',
          headers: { 'PayPal-Request-Id': `store-capture-${paypalOrderId}` },
          body: '{}',
        }
      );
      const capturePayload = (await captureResponse.json()) as PayPalOrder;

      if (!captureResponse.ok) {
        // Une seconde requête peut arriver après une capture déjà réussie.
        const retryResponse = await paypalFetch(
          `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`
        );
        const retryOrder = (await retryResponse.json()) as PayPalOrder;
        if (!retryResponse.ok || retryOrder.status !== 'COMPLETED') {
          console.error('PayPal capture rejected', capturePayload);
          return NextResponse.json(
            { error: 'Le paiement n’a pas pu être finalisé' },
            { status: 400 }
          );
        }
        completedOrder = retryOrder;
      } else {
        completedOrder = capturePayload;
      }
    }

    if (completedOrder.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Paiement non complété' },
        { status: 400 }
      );
    }

    const capture = captureFrom(completedOrder);
    if (!capture) {
      return NextResponse.json(
        { error: 'Capture PayPal introuvable' },
        { status: 400 }
      );
    }

    const result = await fulfillStorePayment({
      internalOrderId,
      paypalOrderId,
      capture,
      payer: completedOrder.payer,
    });

    const refreshed = await findStoreOrderByPayPalId(paypalOrderId);

    return NextResponse.json({
      ok: true,
      status: completedOrder.status,
      delivery: result.delivery,
      accessToken: refreshed?.access_token || raw.access_token,
      email: refreshed?.customer_email || completedOrder.payer?.email_address || null,
      productId: raw.product_id,
      market: raw.market,
      amount: expected.amount,
      currency: expected.currency,
    });
  } catch (error) {
    console.error('Store PayPal capture-order error', error);
    return NextResponse.json(
      { error: 'Impossible de confirmer le paiement' },
      { status: 500 }
    );
  }
}
