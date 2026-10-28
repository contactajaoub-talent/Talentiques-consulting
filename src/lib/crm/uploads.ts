import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import {
  backend,
  config,
  privateFile,
  rows,
  rpc,
  storage,
  storagePath,
} from "./db";
import {
  addBusinessHours,
  CrmError,
  DEFAULT_HOURS,
  type BusinessHours,
  type Row,
} from "./core";
import { fileMetadata, validateFile } from "./files";
import { hash } from "./http";

export async function businessHours(): Promise<BusinessHours> {
  const settings = await rows("crm_settings", "id=eq.business&select=value");
  return { ...DEFAULT_HOURS, ...settings[0]?.value };
}
export async function createUpload(
  payload: Record<string, unknown>,
  memberId: string | null = null,
) {
  const meta = fileMetadata(
    payload.filename,
    payload.size,
    String(payload.document_kind || "cv"),
  );
  const id = randomUUID(),
    token = randomBytes(32).toString("hex");
  const path = `${id}/${randomUUID()}.${meta.ext}`;
  await backend("/rest/v1/crm_uploads", {
    method: "POST",
    body: JSON.stringify({
      id,
      token_hash: hash(token),
      path,
      member_id: memberId,
      payload: {
        ...payload,
        filename: meta.name,
        mime: meta.mime,
        size: meta.size,
        kind: memberId ? payload.document_kind : payload.kind,
      },
    }),
  });
  const signed = await storage(
    `object/upload/sign/crm-documents/${storagePath(path)}`,
    { method: "POST", body: "{}" },
  );
  return {
    uploadId: id,
    token,
    uploadUrl: `${config().url}/storage/v1${signed.url}`,
    mime: meta.mime,
  };
}
export async function commitUpload(
  id: string,
  token: string,
  member?: { token: string; userId: string },
) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new CrmError("Envoi invalide.");
  const uploads = await rows(
    "crm_uploads",
    `id=eq.${id}&token_hash=eq.${hash(token)}&limit=1`,
  );
  const upload = uploads[0];
  if (
    !upload ||
    (member ? upload.member_id !== member.userId : upload.member_id !== null)
  )
    throw new CrmError("Envoi introuvable.", 404);
  // Capabilities are needed only for the upload, never for staff authorization.
  if (upload.result) {
    if (member) return upload.result;
    const settings = await businessHours();
    return {
      ...upload.result,
      checkoutToken: upload.result.orderId
        ? hash(`checkout:${token}`)
        : undefined,
      promise: settings.promise_enabled ? settings.diagnostic_hours : null,
    };
  }
  if (Date.parse(upload.expires_at) < Date.now())
    throw new CrmError("Envoi expiré.");
  const p = upload.payload;
  const meta = fileMetadata(p.filename, p.size, member ? p.kind : "cv");
  try {
    validateFile(await privateFile(upload.path), meta);
  } catch (error) {
    await storage("object/crm-documents", {
      method: "DELETE",
      body: JSON.stringify({ prefixes: [upload.path] }),
    });
    throw error;
  }
  if (member)
    return rpc(
      "crm_add_document",
      { p_upload: id, p_hash: hash(token) },
      member.token,
    );
  const settings = await businessHours();
  // Derive a stable checkout capability from this upload token, allowing safe retry after a lost response.
  const checkoutToken = hash(`checkout:${token}`);
  const result = await rpc("crm_commit_intake", {
    p_upload: id,
    p_hash: hash(token),
    p_due: addBusinessHours(
      new Date(),
      settings.diagnostic_hours,
      settings,
    ).toISOString(),
    p_checkout_hash: hash(checkoutToken),
  });
  return {
    ...result,
    checkoutToken: result.orderId ? checkoutToken : undefined,
    promise: settings.promise_enabled ? settings.diagnostic_hours : null,
  };
}
export async function canUpload(
  requestId: string,
  caseId: string | null,
  kind: string,
  token: string,
) {
  if (caseId) {
    const c = (
      await rows(
        "crm_cases",
        `id=eq.${caseId}&request_id=eq.${requestId}&limit=1`,
        token,
      )
    )[0];
    if (!c || ["completed", "cancelled"].includes(c.status))
      throw new CrmError("Dossier inaccessible.", 403);
  } else {
    if (
      !["cv", "report"].includes(kind) ||
      !(await rows("crm_requests", `id=eq.${requestId}&limit=1`, token))[0]
    )
      throw new CrmError("Demande inaccessible.", 403);
  }
}
export async function downloadUrl(id: string, token: string) {
  const doc = (
    await rows("crm_documents", `id=eq.${id}&deleted_at=is.null&limit=1`, token)
  )[0] as Row | undefined;
  if (!doc) throw new CrmError("Document inaccessible.", 404);
  const signed = await storage(
    `object/sign/crm-documents/${storagePath(String(doc.path))}`,
    { method: "POST", body: JSON.stringify({ expiresIn: 120 }) },
  );
  return `${config().url}/storage/v1${signed.signedURL}&download=`;
}
