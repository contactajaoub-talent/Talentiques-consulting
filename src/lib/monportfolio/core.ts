import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { CrmError, uuid } from "../crm/core.ts";

export const COUNTRIES = ["Maroc", "France", "Belgique", "Suisse", "Canada", "Tunisie", "Autre"];
export const PAYMENTS = ["CIH Bank", "Attijariwafa bank", "Banque Populaire", "PayPal", "Cash Plus", "Carte bancaire"];
export const digest = (s: string) => createHash("sha256").update(s).digest("hex");
export function validateLead(body: Record<string, unknown>) {
  if (typeof body.name !== "string" || body.name.length > 90) throw new CrmError("Nom invalide.");
  const name = body.name.trim().replace(/\s+/g, " ");
  if (name.length < 3 || !/^[\p{L}\p{M} .’'\-]+$/u.test(name) || !/\p{L}.*\p{L}/u.test(name)) throw new CrmError("Nom invalide.");
  if (typeof body.country !== "string" || !COUNTRIES.includes(body.country)) throw new CrmError("Pays invalide.");
  if (typeof body.payment !== "string" || !PAYMENTS.includes(body.payment)) throw new CrmError("Moyen de paiement invalide.");
  if (!(body.country === "Maroc" ? PAYMENTS.filter(p => p !== "Carte bancaire") : ["PayPal", "Carte bancaire"]).includes(body.payment)) throw new CrmError("Moyen de paiement indisponible pour ce pays.");
  if (body.consent !== true || body.website) throw new CrmError("Consentement ou demande invalide.");
  const utm: Record<string, string> = {};
  if (body.utm !== undefined && (!body.utm || typeof body.utm !== "object" || Array.isArray(body.utm))) throw new CrmError("Paramètres invalides.");
  for (const [key, value] of Object.entries((body.utm || {}) as Record<string, unknown>)) {
    if (!["source", "medium", "campaign", "content", "term"].includes(key) || typeof value !== "string" || value.length > 150 || /[\u0000-\u001f\u007f<>]/u.test(value)) throw new CrmError("Paramètres invalides.");
    utm[key] = value;
  }
  return { name, country: body.country, payment: body.payment, consent: true, utm: Object.fromEntries(Object.entries(utm).sort()) };
}
export function idempotency(value: unknown) { return digest(uuid(value)); }
function sign(value: string, secret: string) { return createHmac("sha256", secret).update("monportfolio:v1:" + value).digest("hex"); }
export function challenge(secret: string, client: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ nonce: randomBytes(16).toString("hex"), at: now, client })).toString("base64url");
  return payload + "." + sign(payload, secret);
}
export function verifyProof(token: unknown, proof: unknown, secret: string, client: string, now = Date.now()) {
  if (typeof token !== "string" || token.length > 600 || !Number.isSafeInteger(proof) || Number(proof) < 0 || Number(proof) > 10000000) throw new CrmError("Vérification invalide.");
  const [payload, signature, extra] = token.split(".");
  const expected = sign(payload, secret);
  if (extra || !signature || !/^[a-f0-9]{64}$/.test(signature) || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new CrmError("Vérification invalide.");
  let value;
  try { value = JSON.parse(Buffer.from(payload, "base64url").toString()); } catch { throw new CrmError("Vérification invalide."); }
  if (value.client !== client || !Number.isFinite(value.at) || now - value.at < 0 || now - value.at > 600000 || !/^[a-f0-9]{32}$/.test(value.nonce) || !digest(`${token}:${proof}`).startsWith("000")) throw new CrmError("Vérification expirée ou invalide. Réessayez.");
  return value.nonce as string;
}
