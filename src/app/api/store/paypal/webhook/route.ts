import { NextResponse } from 'next/server';
import { affiliateCancellationReason } from '@/lib/affiliate/core';
import { cancelAffiliateCommissionByOrderId } from '@/lib/affiliate/supabase-rest';
import { fulfillStorePayment } from '@/lib/store/fulfill';
import { paypalFetch } from '@/lib/store/paypal';
import {
  findStoreOrderById,
  findStoreOrderByPayPalCaptureId,
  findStoreOrderByPayPalId,
  updateStoreOrder,
} from '@/lib/store/supabase-rest';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const event = await request.json();
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!webhookId) {
      return NextResponse.json(
        { error: 'PAYPAL_WEBHOOK_ID manquant' },
        { status: 500 }
      );
    }

    const verificationResponse = await paypalFetch(
      '/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        body: JSON.stringify({
          auth_algo: request.headers.get('paypal-auth-algo'),
          cert_url: request.headers.get('paypal-cert-url'),
          transmission_id: request.headers.get('paypal-transmission-id'),
          transmission_sig: request.headers.get('paypal-transmission-sig'),
          transmission_time: request.headers.get('paypal-transmission-time'),
          webhook_id: webhookId,
          webhook_event: event,
        }),
      }
    );

    const verification = await verificationResponse.json();
    if (
      !verificationResponse.ok ||
      verification?.verification_status !== 'SUCCESS'
    ) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
    }

    const eventType = event?.event_type;
    const cancellationReason = affiliateCancellationReason(eventType);

    if (cancellationReason) {
      const captureId =
        event?.resource?.disputed_transactions?.[0]?.seller_transaction_id ||
        event?.resource?.supplementary_data?.related_ids?.capture_id ||
        event?.resource?.id;
      const order = captureId
        ? await findStoreOrderByPayPalCaptureId(captureId)
        : null;
      if (!order || typeof order.id !== 'string') {
        return NextResponse.json({ ok: true, ignored: true });
      }
      await updateStoreOrder(order.id, {
        status: cancellationReason === 'refund' ? 'refunded' : 'disputed',
      });
      await cancelAffiliateCommissionByOrderId(order.id, cancellationReason);
      return NextResponse.json({ ok: true });
    }

    if (eventType !== 'PAYMENT.CAPTURE.COMPLETED') {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const capture = event.resource || {};
    const paypalOrderId = capture?.supplementary_data?.related_ids?.order_id;

    if (!paypalOrderId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const paypalOrderResponse = await paypalFetch(
      `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`
    );
    const paypalOrder = await paypalOrderResponse.json();

    let internalOrderId =
      paypalOrder?.purchase_units?.[0]?.custom_id || capture?.custom_id;

    if (!internalOrderId) {
      const existing = await findStoreOrderByPayPalId(paypalOrderId);
      internalOrderId = existing?.id;
    }

    if (!internalOrderId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const order = await findStoreOrderById(internalOrderId);
    if (!order) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    await fulfillStorePayment({
      internalOrderId,
      paypalOrderId,
      capture,
      payer: paypalOrder?.payer,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Store PayPal webhook error', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
