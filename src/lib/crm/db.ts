import "server-only";
import { CrmError } from "./core";

export function config() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !service)
    throw new CrmError(
      "Le CRM nÃ©cessite la configuration Supabase et sa migration.",
      503,
    );
  return { url: url.replace(/\/$/, ""), key, service };
}
export async function backend(
  path: string,
  init: RequestInit = {},
  token?: string,
) {
  const c = config();
  const response = await fetch(`${c.url}${path}`, {
    ...init,
    headers: {
      apikey: token ? c.key : c.service,
      Authorization: `Bearer ${token || c.service}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    // Do not surface provider errors, SQL details, emails, or tokens to logs/clients.
    const body = await response.json().catch(() => ({}));
    const safe =
      typeof body.message === "string" && body.message.startsWith("CRM:")
        ? body.message.slice(4)
        : response.status === 401 || response.status === 403
          ? "AccÃ¨s refusÃ©."
          : "OpÃ©ration indisponible. VÃ©rifiez la configuration et les migrations.";
    throw new CrmError(
      safe,
      response.status === 401 ? 401 : response.status === 403 ? 403 : 409,
    );
  }
  if (response.status === 204) return null;
  const payload = await response.text();
  return payload.trim() ? JSON.parse(payload) : null;
}
export function rpc(
  name: string,
  body: Record<string, unknown> = {},
  token?: string,
) {
  return backend(
    `/rest/v1/rpc/${name}`,
    { method: "POST", body: JSON.stringify(body) },
    token,
  );
}
export function rows(table: string, query: string, token?: string) {
  return backend(`/rest/v1/${table}?${query}`, {}, token);
}
export async function storage(path: string, init: RequestInit = {}) {
  return backend(`/storage/v1/${path}`, init);
}
export function storagePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}
export async function privateFile(path: string) {
  const c = config();
  const response = await fetch(
    `${c.url}/storage/v1/object/authenticated/crm-documents/${storagePath(path)}`,
    {
      headers: { apikey: c.service, Authorization: `Bearer ${c.service}` },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    },
  );
  if (
    !response.ok ||
    Number(response.headers.get("content-length")) > 5 * 1024 * 1024
  )
    throw new CrmError("Document indisponible.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 5 * 1024 * 1024)
    throw new CrmError("Document trop volumineux.");
  return bytes;
}
