import { NextResponse } from "next/server";
import { failure, hash, json, rateLimit, sameOrigin } from "@/lib/crm/http";
import { CrmError, text } from "@/lib/crm/core";
import { rpc } from "@/lib/crm/db";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await rateLimit(request, "complete-info", 12);
    const body = await json(request);
    if (typeof body.token !== "string" || !/^[a-f0-9]{64}$/.test(body.token))
      throw new CrmError("Lien invalide.");
    await rpc("crm_complete_info", {
      p_hash: hash(body.token),
      p_text: text(body.text, 4000),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
