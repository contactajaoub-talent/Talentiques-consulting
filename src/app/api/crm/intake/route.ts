import { NextResponse } from "next/server";
import { CrmError, validateIntake, uuid } from "@/lib/crm/core";
import { failure, json, rateLimit, sameOrigin } from "@/lib/crm/http";
import { createUpload, commitUpload, businessHours } from "@/lib/crm/uploads";
export const runtime = "nodejs";
export async function GET() {
  try {
    const settings = await businessHours();
    return NextResponse.json(
      { promise: settings.promise_enabled ? settings.diagnostic_hours : null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await rateLimit(request, "intake", 8);
    const body = await json(request);
    if (body.website) throw new CrmError("Envoi non autorisé.", 400);
    const payload = validateIntake(body);
    return NextResponse.json(
      await createUpload({
        ...payload,
        filename: body.filename,
        size: body.size,
      }),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    await rateLimit(request, "intake-commit", 20);
    const body = await json(request);
    return NextResponse.json(
      await commitUpload(uuid(body.uploadId), String(body.token || "")),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
