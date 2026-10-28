import "server-only";
import { Resend } from "resend";
import { backend, privateFile, rows, rpc, storage } from "./db";
import type { Row } from "./core";

export async function runJobs() {
  await rpc("crm_sweep");
  const messages = (await rpc("crm_claim_messages")) as Row[];
  let accepted = 0,
    manual = 0,
    failed = 0;
  for (const m of messages) {
    // Recheck cancellation/expiry/payment immediately before sending a scheduled commercial message.
    const current = (
      await rows("crm_outbox", `id=eq.${m.id}&status=eq.sending`)
    )[0];
    if (!current) continue;
    if (m.category === "reminder" || m.category === "proposal") {
      const proposal = (
        await rows("crm_proposals", `id=eq.${m.proposal_id}`)
      )[0];
      const paid = await rows(
        "service_orders",
        `crm_request_id=eq.${m.request_id}&status=eq.paid&limit=1`,
      );
      const requestRow = (
        await rows(
          "crm_requests",
          `id=eq.${m.request_id}&select=contact_id&limit=1`,
        )
      )[0];
      const contact = requestRow
        ? (
            await rows(
              "crm_contacts",
              `id=eq.${requestRow.contact_id}&select=marketing_opted_out_at&limit=1`,
            )
          )[0]
        : null;
      if (
        !proposal ||
        (m.category === "reminder" && contact?.marketing_opted_out_at) ||
        ["rejected", "expired", "converted"].includes(proposal.status) ||
        paid.length ||
        (proposal.expires_at && Date.parse(proposal.expires_at) < Date.now())
      ) {
        await backend(`/rest/v1/crm_outbox?id=eq.${m.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "cancelled" }),
        });
        continue;
      }
    }
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      await rpc("crm_finish_message", {
        p_id: m.id,
        p_status: "manual",
        p_provider: null,
        p_error:
          "Fournisseur email non configuré. Transmission manuelle requise.",
      });
      manual++;
      continue;
    }
    try {
      const ids = m.document_ids as string[];
      const attachments: { filename: string; content: Buffer }[] = [];
      for (const id of ids) {
        const doc = (
          await rows(
            "crm_documents",
            `id=eq.${id}&deleted_at=is.null&approved_at=not.is.null`,
          )
        )[0];
        if (!doc) throw new Error("Attachment unavailable");
        attachments.push({
          filename: doc.name,
          content: await privateFile(doc.path),
        });
      }
      const result = await new Resend(process.env.RESEND_API_KEY).emails.send(
        {
          from: process.env.RESEND_FROM_EMAIL,
          to: String(m.recipient),
          subject: String(m.subject),
          text: String(m.body),
          attachments,
        },
        { idempotencyKey: `crm-${m.id}` },
      );
      if (result.error || !result.data?.id)
        throw new Error("Provider rejected");
      await rpc("crm_finish_message", {
        p_id: m.id,
        p_status: "accepted",
        p_provider: result.data.id,
        p_error: null,
      });
      accepted++;
    } catch {
      await rpc("crm_finish_message", {
        p_id: m.id,
        p_status: "failed",
        p_provider: null,
        p_error:
          "Envoi non confirmé. Vérifiez le fournisseur et les documents avant reprise.",
      });
      failed++;
    }
  }
  const expired = (await rpc("crm_retention_candidates")) as Row[];
  for (const d of expired) {
    await storage("object/crm-documents", {
      method: "DELETE",
      body: JSON.stringify({ prefixes: [d.path] }),
    });
    await backend(`/rest/v1/crm_documents?id=eq.${d.id}`, {
      method: "PATCH",
      body: JSON.stringify({ deleted_at: new Date().toISOString() }),
    });
  }
  const uploads = await rows(
    "crm_uploads",
    `expires_at=lt.${encodeURIComponent(new Date(Date.now() - 2 * 3600000).toISOString())}&limit=25`,
  );
  for (const u of uploads) {
    if (!u.result)
      await storage("object/crm-documents", {
        method: "DELETE",
        body: JSON.stringify({ prefixes: [u.path] }),
      });
    await backend(`/rest/v1/crm_uploads?id=eq.${u.id}`, { method: "DELETE" });
  }
  return { accepted, manual, failed, deleted_documents: expired.length };
}
