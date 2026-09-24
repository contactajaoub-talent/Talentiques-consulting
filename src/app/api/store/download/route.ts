import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import {
  isStoreMarket,
  isStoreProductId,
  type StoreProductId,
} from '@/lib/store/catalog';
import { findStoreOrderByAccessToken } from '@/lib/store/supabase-rest';
import { requiredDeliveryUrl } from '@/lib/store/delivery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DeliveryKey = 'tracker' | 'ats';

const FILES: Record<
  DeliveryKey,
  {
    pathname: string;
    filename: string;
  }
> = {
  tracker: {
    pathname:
      'store-delivery/Talentiques_Opportunity_Tracker_Pro_FR_EN.zip',
    filename: 'Talentiques_Opportunity_Tracker_Pro_FR_EN.zip',
  },
  ats: {
    pathname: 'store-delivery/Talentiques_ATS_CV_System_FR_EN.zip',
    filename: 'Talentiques_ATS_CV_System_FR_EN.zip',
  },
};

function isDeliveryKey(value: string | null): value is DeliveryKey {
  return value === 'tracker' || value === 'ats';
}

function canDownload(
  productId: StoreProductId,
  requestedItem: DeliveryKey
) {
  if (productId === 'bundle') return true;
  return productId === requestedItem;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const token = url.searchParams.get('token')?.trim() || '';
    const item = url.searchParams.get('item');

    if (!token || !isDeliveryKey(item)) {
      return NextResponse.json(
        { error: 'Lien de téléchargement invalide' },
        { status: 400 }
      );
    }

    const order = await findStoreOrderByAccessToken(token);

    if (
      !order ||
      order.status !== 'paid' ||
      !isStoreProductId(order.product_id) ||
      !isStoreMarket(order.market)
    ) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    if (!canDownload(order.product_id, item)) {
      return NextResponse.json(
        { error: 'Ce produit ne fait pas partie de votre achat' },
        { status: 403 }
      );
    }

    if (order.market === 'en') {
      const source = requiredDeliveryUrl(item === 'tracker' ? 'STORE_TRACKER_PACKAGE_EN_URL' : 'STORE_ATS_PACKAGE_EN_URL');
      const sourceUrl = new URL(source);
      if (sourceUrl.protocol !== 'https:') throw new Error('Invalid package configuration');
      // Private Blob uses its SDK. Existing HTTPS packages are streamed, never redirected.
      const privateBlob = sourceUrl.hostname.endsWith('.private.blob.vercel-storage.com');
      const packageFile = privateBlob
        ? await get(source, { access: 'private' })
        : null;
      const response = privateBlob ? null : await fetch(source, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(30000) });
      const stream = privateBlob ? (packageFile?.statusCode === 200 ? packageFile.stream : null) : (response?.ok ? response.body : null);
      if (!stream) return NextResponse.json({ error: 'Download temporarily unavailable' }, { status: 503 });
      return new Response(stream, { headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="Talentiques_${item}_EN.zip"`,
        'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
      } });
    }
    const file = FILES[item];

    const blob = await get(file.pathname, {
      access: 'private',
    });

    if (!blob || blob.statusCode !== 200) {
      return NextResponse.json(
        { error: 'Fichier temporairement indisponible' },
        { status: 404 }
      );
    }

    return new Response(blob.stream, {
      headers: {
        'Content-Type': blob.blob.contentType || 'application/zip',
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    // SDK/fetch errors can contain signed source URLs; never log those credentials.
    console.error('Store secure download failed');

    return NextResponse.json(
      { error: 'Impossible de télécharger le fichier' },
      { status: 500 }
    );
  }
}
