import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { requireSession } from "@/lib/crm/auth";
import { CrmError, uuid } from "@/lib/crm/core";
import { config, rpc, storage, storagePath } from "@/lib/crm/db";
import { failure, json, sameOrigin } from "@/lib/crm/http";
import { digest, idempotency, validateLead } from "@/lib/monportfolio/core";
import { dossierOrigin } from "@/lib/monportfolio/origin";
const noStore = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
const adminActions = new Set(["manual_create","cleanup","documents_deleted","payment_confirm","link_generated","link_revoked","assigned","delivered","revision_requested","revision_done","finished","cancelled"]);
export async function GET(request: Request) {
  try {
    const { token } = await requireSession(), p = new URL(request.url).searchParams;
    if (p.get("document")) {
      const doc = await rpc("monportfolio_document", { p_id: uuid(p.get("document")) }, token);
      if (!doc?.path) throw new CrmError("CV inaccessible.", 404);
      const signed = await storage(`object/sign/monportfolio-cvs/${storagePath(doc.path)}`, { method: "POST", body: JSON.stringify({ expiresIn: 60 }) });
      const filename = doc.mime === "application/pdf" ? "CV.pdf" : "CV.docx";
      return NextResponse.json({ url: `${config().url}/storage/v1${signed.signedURL}&download=${filename}` }, { headers: noStore });
    }
    return NextResponse.json(await rpc("monportfolio_snapshot", { p_id: p.get("id") ? uuid(p.get("id")) : null, p_search: (p.get("search") || "").slice(0,90), p_status: (p.get("status") || "").slice(0,30), p_page: Math.min(10000,Math.max(0,Math.floor(Number(p.get("page")) || 0))) }, token), { headers: noStore });
  } catch(e) { return failure(e); }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const { token, member } = await requireSession(), body = await json(request, 18000);
    const action = body.action ?? "assigned";
    if (typeof action !== "string") throw new CrmError("Action invalide.");
    if (adminActions.has(action) && member.role !== "admin") throw new CrmError("Accès refusé.", 403);
    const id = body.id ? uuid(body.id) : null;
    if (action === "manual_create") {
      const payload=validateLead(body);
      return NextResponse.json(await rpc(payload.phone ? "monportfolio_create_phone_lead" : "monportfolio_create_lead", { p_key:idempotency(body.key), p_payload_hash:digest(JSON.stringify({...payload,utm:{}})), p_nonce:randomBytes(16).toString("hex"), p_data:payload }), {headers:noStore});
    }
    if (action === "cleanup" || action === "documents_deleted") {
      if (action === "documents_deleted" && !id) throw new CrmError("Dossier requis.");
      const candidates = await rpc("monportfolio_cleanup", { p_id: action === "documents_deleted" ? id : null }, token);
      for (const doc of candidates) {
        await storage("object/monportfolio-cvs", { method: "DELETE", body: JSON.stringify({ prefixes: [doc.path] }) });
        await rpc("monportfolio_cleanup_done", { p_upload: doc.id }, token);
      }
      return NextResponse.json({ ok: true, deleted: candidates.length }, { headers: noStore });
    }
    if (!id) throw new CrmError("Dossier requis.");
    if (action === "link_generated") {
      const origin = dossierOrigin();
      const raw = randomBytes(32).toString("hex");
      await rpc("monportfolio_action", { p_id: id, p_action: action, p_data: { hash: digest(raw) } }, token);
      return NextResponse.json({ url: `${origin}/dossier/?token=${raw}` }, { headers: noStore });
    }
    await rpc("monportfolio_action", { p_id: id, p_action: action, p_data: body.data || { owner: body.owner } }, token);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch(e) { return failure(e); }
}
