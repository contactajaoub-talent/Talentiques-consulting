import { CrmError } from "../crm/core.ts";
import { digest } from "./core.ts";
export const OBJECTIVES = ["employment", "services", "image", "other"];
export function capability(request: Request) {
  const value = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!value || !/^[a-f0-9]{64}$/.test(value)) throw new CrmError("Lien personnel invalide.", 403);
  return digest(value);
}
export function dossierAnswers(body: Record<string, unknown>) {
  if (body.consent !== true || typeof body.objective !== "string" || !OBJECTIVES.includes(body.objective)) throw new CrmError("Objectif et autorisation requis.");
  const text = (key: string, max: number) => {
    const value = body[key] ?? "";
    if (typeof value !== "string" || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value)) throw new CrmError("Réponse invalide ou trop longue.");
    return value.trim();
  };
  const other = text("other", 240);
  if (body.objective === "other" && !other) throw new CrmError("Précisez votre objectif.");
  return { objective: body.objective, other: body.objective === "other" ? other : "", projects: text("projects", 3000), achievements: text("achievements", 3000), consent: true };
}
