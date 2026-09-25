import { NextResponse } from 'next/server';
import { getRecentPaidStoreOrders } from '@/lib/store/supabase-rest';
import { getStoreProduct, isStoreMarket, isStoreProductId } from '@/lib/store/catalog';

function anonymizeName(value: unknown) {
  if (typeof value !== 'string') return null;
  const parts = value
    .trim()
    .replace(/[^\p{L}\p{M}'’\-\s]/gu, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean);
  if (!parts.length) return null;

  const firstName = parts[0].slice(0, 40);
  const lastInitial = parts.length > 1 ? parts.at(-1)?.charAt(0).toUpperCase() : '';
  return lastInitial ? `${firstName} ${lastInitial}.` : `${firstName.charAt(0).toUpperCase()}.`;
}

export async function GET() {
  try {
    const rows = await getRecentPaidStoreOrders(6);
    const purchases = rows.flatMap((row) => {
      const buyer = anonymizeName(row.customer_name);
      if (!buyer || !isStoreProductId(row.product_id) || !isStoreMarket(row.market)) return [];
      return [{ buyer, productName: getStoreProduct(row.product_id, row.market).name }];
    });

    return NextResponse.json(
      { purchases },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Recent paid purchases unavailable', error);
    return NextResponse.json(
      { purchases: [] },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
    );
  }
}
