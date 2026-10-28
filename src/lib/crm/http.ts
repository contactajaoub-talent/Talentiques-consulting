import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { CrmError } from "./core";
import { rpc } from "./db";

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.NEXT_PUBLIC_APP_URL || request.url)
    .origin;
  if (!origin || origin !== expected)
    throw new CrmError("Origine non autorisée.", 403);
}
export async function json(
  request: Request,
  max = 20000,
): Promise<Record<string, unknown>> {
  if (Number(request.headers.get("content-length")) > max)
    throw new CrmError("Requête trop volumineuse.", 413);
  const raw = await request.text();
  if (raw.length > max) throw new CrmError("Requête trop volumineuse.", 413);
  try {
    const value = JSON.parse(raw);
    if (!value || Array.isArray(value) || typeof value !== "object")
      throw new Error();
    return value;
  } catch {
    throw new CrmError("Requête invalide.");
  }
}
export function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
export async function rateLimit(request: Request, scope: string, limit = 10) {
  const secret = process.env.CRM_RATE_LIMIT_SECRET;
  if (!secret)
    throw new CrmError("Protection des formulaires non configurée.", 503);
  // Vercel overwrites this header. Do not trust arbitrary x-forwarded-for chains.
  const ip =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "local";
  const allowed = await rpc("crm_rate_limit", {
    p_key: hash(`${secret}:${scope}:${ip}`),
    p_limit: limit,
  });
  if (!allowed)
    throw new CrmError(
      "Trop de tentatives. Réessayez dans quelques minutes.",
      429,
    );
}
export function failure(error: unknown) {
  return NextResponse.json(
    {
      error:
        error instanceof CrmError
          ? error.message
          : "Opération impossible. Réessayez ou contactez l’équipe.",
    },
    {
      status: error instanceof CrmError ? error.status : 500,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
