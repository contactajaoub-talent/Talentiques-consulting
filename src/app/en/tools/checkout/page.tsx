import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CheckoutClient from '@/components/store/CheckoutClient';
import { getStoreProduct, isStoreProductId } from '@/lib/store/catalog';
export const metadata: Metadata = { title: 'Secure checkout', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;
  if (!isStoreProductId(product)) notFound();
  return <CheckoutClient product={getStoreProduct(product, 'en')} clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''} />;
}
