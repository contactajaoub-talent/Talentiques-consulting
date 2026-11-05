import { CrmError } from "@/lib/crm/core";

const live = "https://www.monportfolio.app";

function previewOrigin() {
  const candidate = process.env.MONPORTFOLIO_PREVIEW_ORIGIN;
  try {
    const url = new URL(candidate || "");
    return url.protocol === "https:" && url.origin === candidate ? candidate : null;
  } catch { return null; }
}

export function allowedOrigin(origin: string) {
  if (process.env.VERCEL_ENV === "preview") return origin !== "" && origin === previewOrigin();
  return origin === live || origin === "https://monportfolio.app";
}

export function dossierOrigin() {
  if (process.env.VERCEL_ENV !== "preview") return live;
  const origin = previewOrigin();
  if (!origin) throw new CrmError("Origine MonPortfolio de préproduction non configurée.", 503);
  return origin;
}
