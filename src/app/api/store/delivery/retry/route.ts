import { createHash, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { deliverPaidStoreOrder } from '@/lib/store/delivery';
import { findStoreOrderById } from '@/lib/store/supabase-rest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RetryBody = {
  orderId?: unknown;
};

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

function hasValidAuthorization(request: Request) {
  const secret = process.env.STORE_DELIVERY_RETRY_SECRET?.trim();
  const authorization = request.headers.get('authorization');

  if (!secret || !authorization?.startsWith('Bearer ')) {
    return false;
  }

  const providedSecret = authorization.slice('Bearer '.length);
  const expectedDigest = createHash('sha256').update(secret).digest();
  const providedDigest = createHash('sha256')
    .update(providedSecret)
    .digest();

  return timingSafeEqual(expectedDigest, providedDigest);
}

export async function POST(request: Request) {
  if (!hasValidAuthorization(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, 400);
  }

  const retryBody =
    body && typeof body === 'object' ? (body as RetryBody) : {};
  const orderId =
    typeof retryBody.orderId === 'string'
      ? retryBody.orderId.trim()
      : '';

  if (!orderId || orderId.length > 200) {
    return json({ error: 'orderId is required' }, 400);
  }

  try {
    const order = await findStoreOrderById(orderId);

    if (!order) {
      return json({ error: 'Order not found' }, 404);
    }

    if (order.status !== 'paid') {
      return json({ error: 'Order is not paid' }, 409);
    }

    if (order.delivery_status === 'sent') {
      return json({
        ok: true,
        delivery: 'sent',
        message: 'already delivered',
      });
    }

    if (order.delivery_status === 'sending') {
      return json({
        ok: true,
        delivery: 'already_processing',
      });
    }

    if (
      order.delivery_status !== 'failed' &&
      order.delivery_status !== 'pending'
    ) {
      return json({ error: 'Delivery is not retryable' }, 409);
    }

    const result = await deliverPaidStoreOrder(orderId);

    return json({
      ok: true,
      delivery: result.status,
    });
  } catch (error) {
    console.error('Store delivery retry failed', error);
    return json({ error: 'Delivery retry failed' }, 500);
  }
}
