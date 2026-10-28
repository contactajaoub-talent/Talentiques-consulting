import { NextResponse } from "next/server";
import { requireSession } from "@/lib/crm/auth";
import { failure, json, sameOrigin } from "@/lib/crm/http";
import {
  canUpload,
  createUpload,
  commitUpload,
  downloadUrl,
} from "@/lib/crm/uploads";
import { uuid } from "@/lib/crm/core";
export async function GET(request: Request) {
  try {
    const current = await requireSession();
    const id = uuid(new URL(request.url).searchParams.get("id"));
    return NextResponse.json(
      { url: await downloadUrl(id, current.token) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const current = await requireSession(),
      body = await json(request);
    const requestId = uuid(body.request_id),
      caseId = body.case_id ? uuid(body.case_id) : null;
    await canUpload(
      requestId,
      caseId,
      String(body.document_kind),
      current.token,
    );
    return NextResponse.json(
      await createUpload(
        { ...body, request_id: requestId, case_id: caseId },
        current.member.user_id,
      ),
    );
  } catch (error) {
    return failure(error);
  }
}
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    const current = await requireSession(),
      body = await json(request);
    return NextResponse.json(
      await commitUpload(uuid(body.uploadId), String(body.token || ""), {
        token: current.token,
        userId: current.member.user_id,
      }),
    );
  } catch (error) {
    return failure(error);
  }
}
