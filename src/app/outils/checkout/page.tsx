import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CheckoutClient from '@/components/store/CheckoutClient';
import { getStoreProduct, isStoreProductId } from '@/lib/store/catalog';

export const metadata: Metadata = {
  title: 'Paiement sécurisé | TalentiQues',
  robots: { index: false, follow: false },
};

export default async function StoreCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const params = await searchParams;
  if (!isStoreProductId(params.product)) notFound();

  const product = getStoreProduct(params.product, 'fr');
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  return <CheckoutClient product={product} clientId={clientId} />;
}
