export const MARKETS = [
  "France",
  "Canada",
  "Belgique",
  "Suisse",
  "Maroc",
  "Allemagne",
  "International / Autre",
] as const;
/** Canonical FR values are retained when the same UI is displayed in English. */
export const MARKET_OPTIONS = [
  // Main TALENTIQUES markets, in priority order.
  { value: "Marché français", fr: "Marché français", en: "French market", group: "primary", keywords: "france french" },
  { value: "Marché suisse", fr: "Marché suisse", en: "Swiss market", group: "primary", keywords: "suisse swiss switzerland" },
  { value: "Marché canadien", fr: "Marché canadien", en: "Canadian market", group: "primary", keywords: "canada canadian québec quebec" },
  { value: "Marché belge", fr: "Marché belge", en: "Belgian market", group: "primary", keywords: "belgique belgium" },
  { value: "Marché luxembourgeois", fr: "Marché luxembourgeois", en: "Luxembourg market", group: "primary", keywords: "luxembourg" },
  // Africa is an expandable group, not a value submitted to the CRM.
  { value: "Marché marocain", fr: "Marché marocain", en: "Moroccan market", group: "africa", keywords: "maroc morocco" },
  { value: "Marché tunisien", fr: "Marché tunisien", en: "Tunisian market", group: "africa", keywords: "tunisie tunisia" },
  { value: "Marché ivoirien", fr: "Marché ivoirien", en: "Ivorian market", group: "africa", keywords: "côte d'ivoire cote d ivoire ivory coast" },
  { value: "Marché sénégalais", fr: "Marché sénégalais", en: "Senegalese market", group: "africa", keywords: "sénégal senegal" },
  { value: "Marché malgache", fr: "Marché malgache", en: "Madagascar market", group: "africa", keywords: "madagascar" },
  { value: "Marché camerounais", fr: "Marché camerounais", en: "Cameroonian market", group: "africa", keywords: "cameroun cameroon" },
  // Broad markets are selectable themselves.
  { value: "Moyen-Orient", fr: "Moyen-Orient", en: "Middle East", group: "regional", keywords: "middle east golfe gulf dubai uae emirats émirats" },
  { value: "International francophone", fr: "International francophone", en: "International French-speaking markets", group: "regional", keywords: "international french speaking francophone" },
  { value: "International anglophone", fr: "International anglophone", en: "International English-speaking markets", group: "regional", keywords: "international english speaking anglophone" },
] as const;

export const STATUSES = [
  "Étudiant",
  "Alternant",
  "Jeune diplômé",
  "En recherche d'emploi",
  "En poste",
  "En reconversion",
  "Autre",
] as const;
export const REQUEST_STATES = [
  "new",
  "assigned",
  "analyzing",
  "review",
  "report_sent",
  "proposal_needed",
  "proposal_sent",
  "converted",
  "closed",
] as const;
export const CASE_STATES = [
  "missing_info",
  "unassigned",
  "production",
  "quality",
  "delivery",
  "corrections",
  "completed",
  "cancelled",
] as const;
export const DELIVERABLES = [
  "cv_word",
  "cv_pdf",
  "letter",
  "linkedin",
  "tracker",
] as const;
export const LABELS: Record<string, string> = {
  configured: "Renseigné",
  new: "Nouveau",
  assigned: "Assigné",
  analyzing: "Analyse en cours",
  review: "À valider",
  report_sent: "Rapport envoyé",
  proposal_needed: "Proposition à préparer",
  proposal_sent: "Proposition envoyée",
  converted: "Converti",
  closed: "Clôturé",
  missing_info: "Informations manquantes",
  unassigned: "À assigner",
  production: "En production",
  quality: "Contrôle qualité",
  delivery: "Livraison",
  corrections: "Corrections",
  completed: "Finalisé",
  cancelled: "Annulé",
  pending: "En attente",
  paid: "Payé",
  failed: "Échec",
  refunded: "Remboursé",
  paypal_create_failed: "Paiement à reprendre",
  verification_needed: "Vérification nécessaire",
  draft: "Brouillon",
  approved: "Approuvé",
  queued: "En file",
  sending: "Envoi en cours",
  accepted: "Accepté par le fournisseur",
  manual: "À transmettre manuellement",
  manual_sent: "Transmission manuelle déclarée",
  rejected: "Refusé",
  expired: "Expiré",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
  admin: "Administration",
  sales: "Acquisition / Commercial",
  production_role: "Production",
  cv: "CV source",
  report: "Rapport diagnostic",
  cv_word: "CV Word",
  cv_pdf: "CV PDF",
  letter: "Lettre de motivation",
  linkedin: "Optimisation LinkedIn",
  tracker: "Suivi des candidatures",
  done: "Terminée",
  open: "À traiter",
};
export type Role = "admin" | "sales" | "production";
export type Member = {
  user_id: string;
  name: string;
  role: Role;
  active: boolean;
};
export type Row = { id: string; [key: string]: unknown };
export class CrmError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
export function uuid(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new CrmError("Référence invalide.");
  return value;
}
export function text(value: unknown, max = 1000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
export function validateIntake(input: Record<string, unknown>) {
  const name = text(input.name, 150),
    email = text(input.email, 254).toLowerCase();
  const status = text(input.current_status, 100),
    objective = text(input.objective, 1000);
  // Accept the existing country values and any user-specified market.
  // Never silently discard an unknown market: the candidate can target any country.
  if (
    !Array.isArray(input.markets) ||
    input.markets.length > 12 ||
    input.markets.some((item) => typeof item !== "string")
  )
    throw new CrmError("Sélection de marchés invalide.");
  const markets = [
    ...new Map(
      (input.markets as string[]).map((item) => {
        const clean = item.trim().replace(/\s+/g, " ");
        return [clean.normalize("NFKC").toLocaleLowerCase("fr"), clean] as const;
      }),
    ).values(),
  ];
  if (
    markets.length > 8 ||
    markets.some(
      (item) =>
        item.length < 2 ||
        item.length > 80 ||
        /[<>{}\u0000-\u001f\u007f]/.test(item) ||
        !/\p{L}/u.test(item),
    )
  )
    throw new CrmError("Choisissez jusqu’à 8 marchés valides (80 caractères maximum chacun).");
  if (
    name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !status ||
    objective.length < 5 ||
    !markets.length ||
    input.privacy !== true
  )
    throw new CrmError("Complétez les champs obligatoires et le consentement.");
  const linkedin = text(input.linkedin, 300);
  if (
    linkedin &&
    !/^https:\/\/([a-z]{2,3}\.)?(www\.)?linkedin\.com\/(in|pub)\//i.test(
      linkedin,
    )
  )
    throw new CrmError("Lien LinkedIn invalide (https).");
  const kind = input.kind === "service" ? "service" : "diagnostic";
  if (
    kind === "diagnostic" &&
    !STATUSES.includes(status as (typeof STATUSES)[number])
  )
    throw new CrmError("Statut professionnel invalide.");
  const serviceId = input.service_id;
  if (
    kind === "service" &&
    serviceId !== "professional-profile" &&
    serviceId !== "student-jobseeker"
  )
    throw new CrmError("Offre invalide.");
  return {
    name,
    email,
    phone: text(input.phone, 50),
    current_status: status,
    objective,
    markets,
    linkedin,
    kind,
    service_id: kind === "service" ? serviceId : null,
    market: input.market === "en" ? "en" : "fr",
    notes: text(input.notes, 2000),
    privacy: true,
    marketing: input.marketing === true,
    source: text(input.source, 300),
    utm_source: text(input.utm_source, 150),
    utm_medium: text(input.utm_medium, 150),
    utm_campaign: text(input.utm_campaign, 150),
    utm_content: text(input.utm_content, 150),
    utm_term: text(input.utm_term, 150),
    consent_version: "crm-2026-10-28",
  };
}

export type BusinessHours = {
  timezone: string;
  days: number[];
  start: number;
  end: number;
  diagnostic_hours: number;
  production_hours: number;
  promise_enabled: boolean;
  retention_days: number;
  reminder_days: number;
  auto_assign: boolean;
};
export const DEFAULT_HOURS: BusinessHours = {
  timezone: "Europe/Paris",
  days: [1, 2, 3, 4, 5],
  start: 9,
  end: 18,
  diagnostic_hours: 3,
  production_hours: 27,
  promise_enabled: false,
  retention_days: 90,
  reminder_days: 3,
  auto_assign: false,
};
export function validateHours(value: BusinessHours): BusinessHours {
  try {
    new Intl.DateTimeFormat("fr", { timeZone: value.timezone });
  } catch {
    throw new CrmError("Fuseau horaire invalide.");
  }
  if (
    !Array.isArray(value.days) ||
    !value.days.length ||
    value.days.some((d) => !Number.isInteger(d) || d < 0 || d > 6) ||
    !Number.isInteger(value.start) ||
    !Number.isInteger(value.end) ||
    value.start < 0 ||
    value.end > 24 ||
    value.start >= value.end ||
    value.diagnostic_hours < 1 ||
    value.diagnostic_hours > 72 ||
    value.production_hours < 1 ||
    value.production_hours > 720 ||
    value.retention_days < 7 ||
    value.retention_days > 3650 ||
    value.reminder_days < 1 ||
    value.reminder_days > 30 ||
    !["promise_enabled", "auto_assign"].every(
      (k) => typeof value[k as keyof BusinessHours] === "boolean",
    )
  )
    throw new CrmError("Horaires ou délais invalides.");
  return value;
}
/** Advance in real minutes; local business windows follow DST without assuming UTC offsets. */
export function addBusinessHours(
  from: Date,
  hours: number,
  config: BusinessHours,
): Date {
  validateHours(config);
  if (
    !Number.isFinite(hours) ||
    hours <= 0 ||
    hours > 720 ||
    !Number.isFinite(from.getTime())
  )
    throw new CrmError("Délai invalide.");
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: config.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let remaining = Math.ceil(hours * 60),
    cursor = Math.ceil(from.getTime() / 60000) * 60000;
  for (let i = 0; i < 370 * 24 * 60; i++, cursor += 60000) {
    const parts = formatter.formatToParts(cursor),
      get = (type: string) => parts.find((p) => p.type === type)?.value || "";
    const minute = Number(get("hour")) * 60 + Number(get("minute"));
    if (
      config.days.includes(names.indexOf(get("weekday"))) &&
      minute >= config.start * 60 &&
      minute < config.end * 60 &&
      --remaining === 0
    )
      return new Date(cursor + 60000);
  }
  throw new CrmError("Impossible de calculer cette échéance.");
}

export function verifyCapture(
  stored: Record<string, unknown>,
  order: PayPalOrder,
  merchant: string,
) {
  const unit = order.purchase_units?.[0],
    capture = unit?.payments?.captures?.[0];
  if (
    !merchant ||
    order.purchase_units?.length !== 1 ||
    order.status !== "COMPLETED" ||
    unit?.custom_id !== stored.id ||
    unit?.payee?.merchant_id !== merchant ||
    !capture?.id ||
    capture.status !== "COMPLETED" ||
    capture.amount?.currency_code !== stored.currency ||
    !Number.isFinite(Number(capture.amount?.value)) ||
    Math.round(Number(capture.amount?.value) * 100) !==
      Math.round(Number(stored.amount) * 100)
  )
    throw new CrmError("Paiement non confirmé ou rapprochement invalide.", 409);
  return capture;
}
export type PayPalOrder = {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    payee?: { merchant_id?: string };
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: { value?: string; currency_code?: string };
      }>;
    };
  }>;
};
