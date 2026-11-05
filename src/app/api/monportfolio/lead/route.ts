import { NextResponse } from "next/server";
import { CrmError } from "@/lib/crm/core";
import { json, rateLimit } from "@/lib/crm/http";
import { rpc } from "@/lib/crm/db";
import { challenge, digest, idempotency, validateLead, verifyProof } from "@/lib/monportfolio/core";
import { allowedOrigin } from "@/lib/monportfolio/origin";
export const runtime = "nodejs";
function headers(request: Request) {
  const origin = request.headers.get("origin") || "";
  return { "Cache-Control": "no-store", "Vary": "Origin", ...(allowedOrigin(origin) ? { "Access-Control-Allow-Origin": origin } : {}) };
}
function context(request: Request) {
  if (!allowedOrigin(request.headers.get("origin") || "")) throw new CrmError("Origine non autorisée.", 403);
  const secret = process.env.CRM_RATE_LIMIT_SECRET;
  if (!secret) throw new CrmError("Service temporairement indisponible.", 503);
  // Same trusted proxy assumption as the existing CRM limiter; document reverse-proxy requirements.
  const ip = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-real-ip") || "local";
  return { secret, client: digest(`${secret}:monportfolio:${ip}`) };
}
function fail(request: Request, error: unknown) {
  const status = error instanceof CrmError ? error.status : 500;
  return NextResponse.json({ error: status >= 500 || status === 409 ? "Enregistrement indisponible. Réessayez avec la même demande." : error instanceof CrmError ? error.message : "Enregistrement impossible." }, { status, headers: headers(request) });
}
export async function OPTIONS(request: Request) {
  if (!allowedOrigin(request.headers.get("origin") || "")) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: { ...headers(request), "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600" } });
}
export async function GET(request: Request) {
  try {
    const { secret, client } = context(request);
    await rateLimit(request, "monportfolio-challenge", 30);
    return NextResponse.json({ challenge: challenge(secret, client) }, { headers: headers(request) });
  } catch (e) { return fail(request, e); }
}
export async function POST(request: Request) {
  try {
    const { secret, client } = context(request);
    await rateLimit(request, "monportfolio-lead", 12);
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new CrmError("Format invalide.", 415);
    const body = await json(request, 4096);
    const payload = validateLead(body);
    const key = idempotency(body.key);
    const nonce = verifyProof(body.challenge, body.proof, secret, client);
    if (!await rpc("crm_rate_limit", { p_key: digest(secret + ":monportfolio-global"), p_limit: 300 })) throw new CrmError("Trop de tentatives. Réessayez plus tard.", 429);
    // Advertising consent may change between retries; business identity stays idempotent.
    const result = await rpc("monportfolio_create_lead", { p_key: key, p_payload_hash: digest(JSON.stringify({ ...payload, utm: {} })), p_nonce: nonce, p_data: payload });
    return NextResponse.json(result, { status: 200, headers: headers(request) });
  } catch (e) { return fail(request, e); }
}
