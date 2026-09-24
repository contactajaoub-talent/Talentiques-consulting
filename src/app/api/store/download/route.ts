import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';
import {
  isStoreMarket,
  isStoreProductId,
  type StoreProductId,
} from '@/lib/store/catalog';
import { findStoreOrderByAccessToken } from '@/lib/store/supabase-rest';

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

    if (order.market !== 'fr') {
      return NextResponse.json(
        { error: 'Package non disponible pour ce marché' },
        { status: 403 }
      );
    }

    if (!canDownload(order.product_id, item)) {
      return NextResponse.json(
        { error: 'Ce produit ne fait pas partie de votre achat' },
        { status: 403 }
      );
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
  } catch (error) {
    console.error('Store secure download error', error);

    return NextResponse.json(
      { error: 'Impossible de télécharger le fichier' },
      { status: 500 }
    );
  }
}
