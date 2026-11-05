import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { config, rpc, storage, storagePath } from "@/lib/crm/db";
import { CrmError, uuid } from "@/lib/crm/core";
import { json, rateLimit } from "@/lib/crm/http";
import { fileMetadata, MAX_FILE, validateFile } from "@/lib/crm/files";
import { capability, dossierAnswers } from "@/lib/monportfolio/dossier";
import { allowedOrigin } from "@/lib/monportfolio/origin";
export const runtime = "nodejs";
const bucket = "monportfolio-cvs";
function headers(request: Request) {
  const origin = request.headers.get("origin") || "";
  return { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "Vary": "Origin", ...(allowedOrigin(origin) ? { "Access-Control-Allow-Origin": origin } : {}) };
}
async function context(request: Request) {
  if (!allowedOrigin(request.headers.get("origin") || "")) throw new CrmError("Origine non autorisée.", 403);
  const hash = capability(request);
  await rateLimit(request, "mp-dossier", 60);
  const secret = process.env.CRM_RATE_LIMIT_SECRET;
  if (!await rpc("crm_rate_limit", { p_key: createHash("sha256").update(`${secret}:mp-token:${hash}`).digest("hex"), p_limit: 60 })) throw new CrmError("Trop de tentatives.", 429);
  return hash;
}
function fail(request: Request, e: unknown) {
  return NextResponse.json({ error: e instanceof CrmError ? e.message : "Envoi indisponible. Réessayez sans fermer cette page." }, { status: e instanceof CrmError ? e.status : 500, headers: headers(request) });
}
function output(request: Request, data: unknown) { return NextResponse.json(data, { headers: headers(request) }); }
export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: allowedOrigin(request.headers.get("origin") || "") ? 204 : 403, headers: { ...headers(request), "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Max-Age": "600" } });
}
export async function GET(request: Request) {
  try {
    const access = await rpc("monportfolio_access", { p_hash: await context(request) });
    return output(request, { reference: access.reference, submitted: access.submitted });
  } catch (e) { return fail(request, e); }
}
// Metadata / responses only pass through Next. The 5-Mo file goes directly to private Storage.
export async function POST(request: Request) {
  try {
    const hash = await context(request), body = await json(request, 18000);
    if (body.action === "prepare") {
      if (typeof body.name !== "string" || !/\.(pdf|docx)$/i.test(body.name) || !Number.isSafeInteger(body.size)) throw new CrmError("CV PDF ou DOCX requis.");
      const meta = fileMetadata(body.name, body.size);
      if (body.mime !== meta.mime) throw new CrmError("Type de fichier invalide.");
      const upload = await rpc("monportfolio_prepare", { p_hash: hash, p_key: uuid(body.key), p_name: meta.name, p_size: meta.size, p_mime: meta.mime, p_ext: meta.ext });
      if (upload.submitted) return output(request, { submitted: true, reference: upload.reference });
      const signed = await storage(`object/upload/sign/${bucket}/${storagePath(upload.path)}`, { method: "POST", body: "{}" });
      return output(request, { uploadId: upload.id, mime: meta.mime, uploadUrl: `${config().url}/storage/v1${signed.url}` });
    }
    if (body.action !== "submit") throw new CrmError("Action invalide.");
    const answers = dossierAnswers(body);
    const upload = await rpc("monportfolio_upload", { p_hash: hash, p_upload: uuid(body.uploadId) });
    if (upload.submitted) return output(request, { submitted: true, reference: upload.reference });
    const c = config();
    const response = await fetch(`${c.url}/storage/v1/object/authenticated/${bucket}/${storagePath(upload.path)}`, { headers: { apikey: c.service, Authorization: `Bearer ${c.service}` }, cache: "no-store", signal: AbortSignal.timeout(20000) });
    if (!response.ok || !response.body) throw new CrmError("CV indisponible. Réessayez le téléversement.", 409);
    if (response.headers.get("content-type")?.split(";")[0] !== upload.mime || Number(response.headers.get("content-length")) > MAX_FILE) throw new CrmError("Type ou taille du CV invalide.");
    const chunks: Uint8Array[] = []; let size = 0;
    const reader = response.body.getReader();
    try {
      while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > MAX_FILE) { await reader.cancel(); throw new CrmError("CV trop volumineux."); } chunks.push(part.value); }
    } finally { reader.releaseLock(); }
    const bytes = Buffer.concat(chunks);
    validateFile(bytes, fileMetadata(upload.name, upload.size));
    const result = await rpc("monportfolio_submit", { p_hash: hash, p_upload: upload.id, p_data: answers, p_cv_hash: createHash("sha256").update(bytes).digest("hex") });
    return output(request, result);
  } catch (e) { return fail(request, e); }
}
