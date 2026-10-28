import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/crm/auth";
import { CrmError } from "@/lib/crm/core";
import { failure, sameOrigin } from "@/lib/crm/http";
import { runJobs } from "@/lib/crm/worker";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: Request) {
  try {
    const expected = process.env.CRON_SECRET;
    const actual = Buffer.from(request.headers.get("authorization") || "");
    const wanted = Buffer.from(`Bearer ${expected || ""}`);
    if (
      !expected ||
      actual.length !== wanted.length ||
      !timingSafeEqual(actual, wanted)
    )
      throw new CrmError("Accès refusé.", 401);
    return NextResponse.json(await runJobs(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if ((await requireSession()).member.role !== "admin")
      throw new CrmError("Accès refusé.", 403);
    return NextResponse.json(await runJobs());
  } catch (error) {
    return failure(error);
  }
}
