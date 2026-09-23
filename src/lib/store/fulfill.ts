import {
  getStoreProduct,
  isStoreMarket,
  isStoreProductId,
  type StoreMarket,
  type StoreProductId,
} from '@/lib/store/catalog';
import { deliverPaidStoreOrder } from '@/lib/store/delivery';
import {
  findStoreOrderById,
  updateStoreOrder,
} from '@/lib/store/supabase-rest';

type CaptureLike = {
  id?: string;
  status?: string;
  amount?: { currency_code?: string; value?: string };
};

function sameMoney(expected: string, actual?: string) {
  const a = Number(expected);
  const b = Number(actual);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 0.001;
}

export async function fulfillStorePayment(input: {
  internalOrderId: string;
  paypalOrderId: string;
  capture: CaptureLike;
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
  };
}) {
  const raw = await findStoreOrderById(input.internalOrderId);
  if (!raw) throw new Error('Commande interne introuvable');

  const productId = raw.product_id;
  const market = raw.market;
  if (!isStoreProductId(productId) || !isStoreMarket(market)) {
    throw new Error('Produit de commande invalide');
  }

  const product = getStoreProduct(productId as StoreProductId, market as StoreMarket);

  if (raw.paypal_order_id && raw.paypal_order_id !== input.paypalOrderId) {
    throw new Error('Référence PayPal incohérente');
  }

  if (input.capture.status && input.capture.status !== 'COMPLETED') {
    throw new Error('Capture PayPal non complétée');
  }

  if (
    input.capture.amount?.currency_code !== product.currency ||
    !sameMoney(product.amount, input.capture.amount?.value)
  ) {
    throw new Error('Montant PayPal incohérent');
  }

  const fullName = [
    input.payer?.name?.given_name,
    input.payer?.name?.surname,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (
    raw.status !== 'paid' ||
    (!raw.customer_email && input.payer?.email_address) ||
    (!raw.customer_name && fullName)
  ) {
    await updateStoreOrder(input.internalOrderId, {
      status: 'paid',
      paypal_order_id: input.paypalOrderId,
      paypal_capture_id: input.capture.id || raw.paypal_capture_id || null,
      customer_email: input.payer?.email_address || raw.customer_email || null,
      customer_name: fullName || raw.customer_name || null,
      paid_at: raw.paid_at || new Date().toISOString(),
    });
  }

  let delivery: 'sent' | 'already_processing' | 'pending' = 'pending';
  try {
    const result = await deliverPaidStoreOrder(input.internalOrderId);
    delivery = result.status;
  } catch (error) {
    console.error('Store delivery error', error);
  }

  return { delivery };
}
