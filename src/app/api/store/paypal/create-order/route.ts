import { NextResponse } from 'next/server';
import {
  getStoreProduct,
  isStoreMarket,
  isStoreProductId,
  STORE_TRACKING_KEYS,
  type StoreTracking,
} from '@/lib/store/catalog';
import { paypalFetch } from '@/lib/store/paypal';
import {
  insertStoreOrder,
  updateStoreOrder,
} from '@/lib/store/supabase-rest';

export const runtime = 'nodejs';

type CreateBody = {
  productId?: unknown;
  market?: unknown;
  tracking?: unknown;
  digitalContentConsent?: unknown;
};

function sanitizeTracking(value: unknown): StoreTracking {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  const clean: StoreTracking = {};

  for (const key of STORE_TRACKING_KEYS) {
    const item = source[key];
    if (typeof item === 'string' && item.trim()) {
      clean[key] = item.trim().slice(0, 500);
    }
  }

  return clean;
}

export async function POST(request: Request) {
  let internalOrderId = '';

  try {
    const body = (await request.json()) as CreateBody;
    const productId = body.productId;
    const market = body.market ?? 'fr';

    if (!isStoreProductId(productId) || !isStoreMarket(market)) {
      return NextResponse.json({ error: 'Produit invalide' }, { status: 400 });
    }

    if (body.digitalContentConsent !== true) {
      return NextResponse.json(
        { error: 'Confirmation d’accès immédiat requise' },
        { status: 400 }
      );
    }

    const product = getStoreProduct(productId, market);
    const tracking = sanitizeTracking(body.tracking);
    internalOrderId = crypto.randomUUID();
    const accessToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll(
      '-',
      ''
    );

    await insertStoreOrder({
      id: internalOrderId,
      access_token: accessToken,
      market,
      product_id: product.id,
      product_name: product.name,
      amount: Number(product.amount),
      currency: product.currency,
      status: 'pending',
      delivery_status: 'pending',
      digital_content_consent_at: new Date().toISOString(),
      consent_version: 'store-fr-v1-2026-09',
      ...tracking,
    });

    const paypalResponse = await paypalFetch('/v2/checkout/orders', {
      method: 'POST',
      headers: { 'PayPal-Request-Id': `store-create-${internalOrderId}` },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: `talentiques-${market}-${product.id}`,
            custom_id: internalOrderId,
            description: product.paypalDescription,
            amount: {
              currency_code: product.currency,
              value: product.amount,
            },
          },
        ],
        application_context: {
          brand_name: 'TalentiQues',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
    });

    const paypalOrder = await paypalResponse.json();

    if (!paypalResponse.ok || !paypalOrder?.id) {
      await updateStoreOrder(internalOrderId, {
        status: 'paypal_create_failed',
        paypal_error: JSON.stringify(paypalOrder).slice(0, 4000),
      });

      return NextResponse.json(
        { error: 'Création du paiement PayPal impossible' },
        { status: 502 }
      );
    }

    await updateStoreOrder(internalOrderId, {
      paypal_order_id: paypalOrder.id,
    });

    return NextResponse.json({
      id: paypalOrder.id,
      accessToken,
    });
  } catch (error) {
    console.error('Store PayPal create-order error', error);

    if (internalOrderId) {
      try {
        await updateStoreOrder(internalOrderId, {
          status: 'paypal_create_failed',
          paypal_error:
            error instanceof Error ? error.message.slice(0, 4000) : 'Erreur serveur',
        });
      } catch {
        // Ne masque pas l'erreur PayPal initiale si Supabase est indisponible.
      }
    }

    return NextResponse.json(
      { error: 'Impossible de démarrer le paiement' },
      { status: 500 }
    );
  }
}
