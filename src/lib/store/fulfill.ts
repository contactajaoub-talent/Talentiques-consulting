import {
  calculateCommission,
  commissionAvailableAt,
  isSelfReferral,
} from '@/lib/affiliate/core';
import {
  createAffiliateCommission,
  findActiveAffiliateByCode,
} from '@/lib/affiliate/supabase-rest';
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
  const paidAt =
    typeof raw.paid_at === 'string' ? raw.paid_at : new Date().toISOString();

  if (
    raw.status !== 'paid' ||
    (!raw.customer_email && input.payer?.email_address) ||
    (!raw.customer_name && fullName)
  ) {
    await updateStoreOrder(input.internalOrderId, {
      status: 'paid',
      paypal_order_id: input.paypalOrderId,
      paypal_capture_id: input.capture.id || raw.paypal_capture_id || null,
      customer_email: raw.customer_email || input.payer?.email_address || null,
      customer_name: raw.customer_name || fullName || null,
      paid_at: paidAt,
    });
  }

  try {
    const affiliateCode = typeof raw.affiliate_ref === 'string' ? raw.affiliate_ref : '';
    if (affiliateCode && typeof raw.affiliate_id === 'string') {
      const affiliate = await findActiveAffiliateByCode(affiliateCode);
      const customerEmail = raw.customer_email || input.payer?.email_address;
      if (
        affiliate &&
        affiliate.id === raw.affiliate_id &&
        !isSelfReferral(customerEmail, affiliate.email)
      ) {
        const orderAmount = Number(input.capture.amount?.value);
        const commissionRate = Number(affiliate.commission_rate ?? 0.5);
        await createAffiliateCommission({
          affiliate_id: affiliate.id,
          order_id: input.internalOrderId,
          product_id: product.id,
          market,
          order_amount: orderAmount,
          commission_rate: commissionRate,
          commission_amount: calculateCommission(orderAmount, commissionRate),
          currency: product.currency,
          status: 'pending',
          available_at: commissionAvailableAt(paidAt),
        });
      }
    }
  } catch (error) {
    console.error('Affiliate commission creation error', error);
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
