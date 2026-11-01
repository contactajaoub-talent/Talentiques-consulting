import { NextResponse } from 'next/server';
import { CrmError, uuid } from '@/lib/crm/core';
import { failure, hash, json, rateLimit } from '@/lib/crm/http';
import { rows, storage, storagePath, config } from '@/lib/crm/db';
import { createUpload, commitUpload } from '@/lib/crm/uploads';
import { fileMetadata } from '@/lib/crm/files';
import { careerQuotePayload, quoteDeliveryEnabled } from '@/lib/services/career-quote';

export const runtime = 'nodejs';

function guard(request: Request) {
  if (!quoteDeliveryEnabled(process.env)) throw new CrmError('L’envoi des demandes de devis est temporairement indisponible. Vos informations n’ont pas été transmises.', 503);
  // Next's internal request URL may use localhost; trust explicit site/deployment configuration only.
  const site = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.talentiques.com');
  const allowed = new Set([site.origin]);
  if (['talentiques.com', 'www.talentiques.com'].includes(site.hostname)) {
    allowed.add('https://talentiques.com'); allowed.add('https://www.talentiques.com');
  }
  if (process.env.VERCEL_URL) allowed.add(new URL(`https://${process.env.VERCEL_URL}`).origin);
  if (!allowed.has(request.headers.get('origin') || '')) throw new CrmError('Origine non autorisée.', 403);
}
function capability(body: Record<string, unknown>) {
  const id = uuid(body.uploadId), token = String(body.token || '');
  if (!/^[a-f0-9]{64}$/.test(token)) throw new CrmError('Référence d’envoi invalide.');
  return { id, token };
}

export async function POST(request: Request) {
  try {
    guard(request);
    const body = await json(request);
    if (body.website) throw new CrmError('Envoi non autorisé.');
    let payload;
    try { payload = careerQuotePayload(body); }
    catch (error) { throw new CrmError(error instanceof Error ? error.message : 'Vérifiez votre demande.'); }
    const meta = fileMetadata(body.filename, body.size);
    const cap = capability(body);
    await rateLimit(request, 'career-quote', 8);
    const payloadHash = hash(JSON.stringify({ ...payload, filename: meta.name, size: meta.size }));
    const uploads = await rows('crm_uploads', `id=eq.${cap.id}&token_hash=eq.${hash(cap.token)}&limit=1`);
    const existing = uploads[0];
    if (existing) {
      if (existing.member_id !== null || existing.payload.kind !== 'quote' || existing.payload.quote_payload_hash !== payloadHash)
        throw new CrmError('Les informations de cet envoi ont changé. Recommencez la demande.', 409);
      if (existing.result) return NextResponse.json({ ...existing.result, committed: true }, { headers: { 'Cache-Control': 'no-store' } });
      if (Date.parse(existing.expires_at) < Date.now()) throw new CrmError('Envoi expiré. Rechargez le formulaire puis réessayez.', 410);
      const signed = await storage(`object/upload/sign/crm-documents/${storagePath(existing.path)}`, { method: 'POST', body: '{}' });
      return NextResponse.json({ uploadId: cap.id, token: cap.token, uploadUrl: `${config().url}/storage/v1${signed.url}`, mime: meta.mime }, { headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json(await createUpload({ ...payload, filename: meta.name, size: meta.size, quote_payload_hash: payloadHash }, null, cap), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}

export async function PUT(request: Request) {
  try {
    guard(request);
    const body = await json(request);
    const cap = capability(body);
    await rateLimit(request, 'career-quote-commit', 20);
    const result = await commitUpload(cap.id, cap.token, undefined, 'quote');
    if (!result.requestId || !result.documentId) throw new CrmError('L’enregistrement de votre demande n’a pas pu être confirmé.', 503);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}
