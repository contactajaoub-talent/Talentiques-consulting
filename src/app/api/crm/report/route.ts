import { NextResponse } from "next/server";
import { requireSession } from "@/lib/crm/auth";
import { rows } from "@/lib/crm/db";
import { CrmError, uuid } from "@/lib/crm/core";
import { reportPdf } from "@/lib/crm/report-pdf";
import { commitUpload, createUpload } from "@/lib/crm/uploads";
import { failure, json, sameOrigin } from "@/lib/crm/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const current = await requireSession(),
      body = await json(request),
      id = uuid(body.id);
    const row = (
      await rows(
        "crm_requests",
        `select=id,report_text,contact:crm_contacts(name)&id=eq.${id}&limit=1`,
        current.token,
      )
    )[0];
    if (!row || String(row.report_text || "").trim().length < 50)
      throw new CrmError(
        "Enregistrez un rapport rédigé d’au moins 50 caractères.",
      );
    const pdf = reportPdf(row.contact.name, row.report_text);
    const upload = await createUpload(
      {
        request_id: id,
        case_id: null,
        document_kind: "report",
        filename: "Diagnostic-TALENTIQUES.pdf",
        size: pdf.length,
      },
      current.member.user_id,
    );
    const response = await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: new Uint8Array(pdf),
    });
    if (!response.ok) throw new CrmError("Création du PDF privé impossible.");
    return NextResponse.json(
      await commitUpload(upload.uploadId, upload.token, {
        token: current.token,
        userId: current.member.user_id,
      }),
    );
  } catch (error) {
    return failure(error);
  }
}
