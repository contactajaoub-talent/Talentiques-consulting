async function checked(response: Response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Envoi impossible.");
  return result;
}
export async function submitIntake(
  data: FormData,
  service?: { id: string; market: string },
) {
  const cv = data.get("cv");
  if (!(cv instanceof File) || cv.size < 100 || cv.size > 5 * 1024 * 1024)
    throw new Error("Ajoutez un CV PDF ou DOCX de 5 Mo maximum.");
  const params = new URLSearchParams(window.location.search);
  const markets = data.getAll("markets").map(String);
  if (!markets.length)
    throw new Error(
      service?.market === "en"
        ? "Select at least one target market."
        : "Sélectionnez au moins un marché ciblé.",
    );
  const init = await checked(
    await fetch("/api/crm/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: service ? "service" : "diagnostic",
        service_id: service?.id,
        market: service?.market,
        name: String(
          data.get("fullName") ||
            `${data.get("firstName") || ""} ${data.get("lastName") || ""}`,
        ).trim(),
        email: data.get("email"),
        phone: data.get("phone"),
        current_status: data.get("statutActuel"),
        objective: data.get("objectifProfessionnel"),
        linkedin: data.get("profilLinkedIn"),
        notes: data.get("informationsComplementaires"),
        markets,
        privacy: data.get("privacy") === "1",
        marketing: data.get("marketing") === "1",
        website: data.get("website"),
        source: window.location.pathname,
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_content: params.get("utm_content"),
        utm_term: params.get("utm_term"),
        filename: cv.name,
        size: cv.size,
      }),
    }),
  );
  const upload = await fetch(init.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": init.mime, "x-upsert": "false" },
    body: cv,
  });
  if (!upload.ok) throw new Error("Le dépôt privé du CV a échoué. Réessayez.");
  return checked(
    await fetch("/api/crm/intake", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId: init.uploadId, token: init.token }),
    }),
  );
}
export async function uploadDocument(
  file: File,
  requestId: string,
  caseId: string | null,
  kind: string,
) {
  const init = await checked(
    await fetch("/api/crm/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        size: file.size,
        request_id: requestId,
        case_id: caseId,
        document_kind: kind,
      }),
    }),
  );
  const response = await fetch(init.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": init.mime },
    body: file,
  });
  if (!response.ok) throw new Error("Dépôt du document impossible.");
  return checked(
    await fetch("/api/crm/documents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId: init.uploadId, token: init.token }),
    }),
  );
}
