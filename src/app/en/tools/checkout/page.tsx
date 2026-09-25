import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CheckoutClient from '@/components/store/CheckoutClient';
import { getStoreProduct, isStoreProductId } from '@/lib/store/catalog';
export const metadata: Metadata = { title: 'Secure checkout | TalentiQues', robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const params = await searchParams;
  if (!isStoreProductId(params.product)) notFound();
  return <CheckoutClient product={getStoreProduct(params.product, 'en')} clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ''} />;
}
