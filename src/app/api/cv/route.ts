import { createHmac, timingSafeEqual } from 'node:crypto';
import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get('pathname');
  const sig = request.nextUrl.searchParams.get('sig');
  const secret = process.env.BLOB_READ_WRITE_TOKEN;

  if (!pathname || !sig || !secret) {
    return new NextResponse('Lien invalide', { status: 400 });
  }

  const expected = createHmac('sha256', secret).update(pathname).digest('hex');
  const supplied = Buffer.from(sig, 'utf8');
  const target = Buffer.from(expected, 'utf8');
  if (supplied.length !== target.length || !timingSafeEqual(supplied, target)) {
    return new NextResponse('Accès refusé', { status: 403 });
  }

  const result = await get(pathname, { access: 'private' });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return new NextResponse('Fichier introuvable', { status: 404 });
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'application/octet-stream',
      'Content-Disposition': result.blob.contentDisposition || 'attachment',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
