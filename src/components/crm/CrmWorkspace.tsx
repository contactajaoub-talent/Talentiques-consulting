"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  ClipboardList,
  FileText,
  Inbox,
  LayoutList,
  LoaderCircle,
  PanelTop,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  CASE_STATES,
  DELIVERABLES,
  LABELS,
  REQUEST_STATES,
  type BusinessHours,
  type Member,
} from "@/lib/crm/core";
import { uploadDocument } from "@/lib/crm/intake-client";
import { useMember } from "./CrmShell";

type Entity = {
  id: string;
  contact?: Entity;
  request?: Entity;
  [key: string]: unknown;
};
type Metric = {
  [key: string]:
    | number
    | null
    | Array<{
        currency?: string;
        amount?: number;
        source?: string;
        leads?: number;
        converted?: number;
        name?: string;
        active?: number;
      }>;
};
type Snapshot = {
  list?: Entity[];
  item?: Entity;
  metrics?: Metric;
  tasks?: Entity[];
  notifications?: Entity[];
  activity?: Entity[];
  documents?: Entity[];
  proposals?: Entity[];
  orders?: Entity[];
  contact?: Entity;
  requests?: Entity[];
  cases?: Entity[];
  settings?: BusinessHours;
  integrations?: Record<string, boolean>;
};
type Payload = { data: Snapshot | Entity[]; members: Member[] };
const s = (row: Entity, key: string) => String(row[key] ?? "");
const date = (value: unknown) =>
  value
    ? new Date(String(value)).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "À définir";
const money = (row: Entity) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: s(row, "currency") || "EUR",
  }).format(Number(row.amount || 0));
const titles: Record<string, [string, string]> = {
  dashboard: ["Vue d’ensemble", "Vos priorités, au même endroit."],
  requests: ["Demandes", "Du premier contact au diagnostic validé."],
  sales: ["Commercial", "Des propositions adaptées à chaque parcours."],
  cases: ["Prestations", "Une production suivie, jusqu’à la finalisation."],
  communications: [
    "Communications",
    "Chaque échange, chaque envoi, chaque reprise.",
  ],
  settings: ["Administration", "Votre équipe et vos règles de fonctionnement."],
};
export function Badge({ value }: { value: unknown }) {
  const v = String(value || "pending");
  const tone = [
    "completed",
    "paid",
    "accepted",
    "manual_sent",
    "approved",
    "converted",
    "done",
  ].includes(v)
    ? "success"
    : ["failed", "urgent", "refunded"].includes(v)
      ? "danger"
      : ["review", "quality"].includes(v)
        ? "review"
        : [
              "missing_info",
              "pending",
              "manual",
              "verification_needed",
              "high",
            ].includes(v)
          ? "warn"
          : ["closed", "cancelled", "rejected", "expired"].includes(v)
            ? "muted"
            : "";
  return (
    <span className="crm-badge" data-tone={tone}>
      {LABELS[v] || v}
    </span>
  );
}
function Empty({
  title = "Aucun dossier pour le moment",
  text = "Les demandes reçues sur le site apparaîtront ici.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="crm-empty">
      <Inbox size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
async function requestJson(url: string, init?: RequestInit) {
  const response = await fetch(url, init),
    body = await response.json();
  if (!response.ok) {
    if (response.status === 401) window.location.assign("/crm/login");
    throw new Error(body.error || "Opération impossible.");
  }
  return body;
}
function formValues(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  for (const key of ["due_at", "expires_at"])
    if (values[key]) values[key] = new Date(String(values[key])).toISOString();
  return values;
}
function Timeline({ items }: { items: Entity[] }) {
  return (
    <div className="crm-timeline">
      {items.length ? (
        items.map((item) => (
          <div className="crm-event" key={item.id}>
            <strong>{eventLabel(s(item, "action"))}</strong>
            <small>{date(item.created_at)}</small>
            {Boolean(item.detail) && <p>{s(item, "detail")}</p>}
          </div>
        ))
      ) : (
        <Empty
          title="Aucune activité"
          text="L’historique sera alimenté par les actions de l’équipe."
        />
      )}
    </div>
  );
}
function eventLabel(value: string) {
  return (
    (
      {
        intake: "Demande reçue",
        request_save: "Demande actualisée",
        report_save: "Rapport rédigé",
        report_approve: "Rapport approuvé",
        report_send: "Rapport mis en file",
        document_upload: "Document ajouté",
        proposal_create: "Proposition préparée",
        proposal_approve: "Proposition approuvée",
        proposal_send: "Proposition mise en file",
        proposal_reject: "Proposition refusée",
        payment_confirm: "Paiement confirmé",
        manual_payment: "Paiement vérifié manuellement",
        case_ready: "Informations vérifiées",
        case_save: "Mission actualisée",
        case_submit: "Livrables soumis",
        case_approve: "Livrables approuvés",
        case_deliver: "Livraison mise en file",
        case_note: "Note de production",
        note: "Note interne",
        client_information: "Informations reçues du client",
        message_accepted: "Email accepté par le fournisseur",
        message_manual_sent: "Transmission manuelle enregistrée",
        case_request_info: "Complément demandé",
        message_retry: "Reprise demandée",
      } as Record<string, string>
    )[value] || value
  );
}

export function CrmWorkspace({ section }: { section: string }) {
  const member = useMember(),
    [data, setData] = useState<Snapshot>({}),
    [members, setMembers] = useState<Member[]>([]),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(0),
    [period, setPeriod] = useState("30"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [board, setBoard] = useState(false),
    [selected, setSelected] = useState<{ section: string; id: string } | null>(
      null,
    ),
    [detail, setDetail] = useState<Snapshot | null>(null),
    [tab, setTab] = useState("overview"),
    [working, setWorking] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setQuery(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const params = new URLSearchParams({
        section,
        page: String(page),
        search: query,
        status,
      });
      if (section === "dashboard") {
        const now = new Date();
        const start =
          period === "custom" && from
            ? new Date(`${from}T00:00:00Z`)
            : period === "today"
              ? new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z")
              : new Date(
                  now.getTime() -
                    Number(period === "custom" ? "30" : period) * 86400000,
                );
        params.set("from", start.toISOString());
        params.set(
          "to",
          period === "custom" && to ? `${to}T23:59:59.999Z` : now.toISOString(),
        );
      }
      const payload = (await requestJson(`/api/crm?${params}`, {
        signal,
      })) as Payload;
      setData(
        Array.isArray(payload.data) ? { list: payload.data } : payload.data,
      );
      setMembers(payload.members);
    },
    [section, page, query, status, period, from, to],
  );
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    load(controller.signal)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [load]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const loadDetail = useCallback(
    async (target: { section: string; id: string }) => {
      const p = (await requestJson(
        `/api/crm?section=${target.section}&id=${target.id}`,
      )) as Payload;
      setDetail(p.data as Snapshot);
    },
    [],
  );
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("open");
    if (!id || !["cases", "requests"].includes(section)) return;
    const target = { section, id };
    setSelected(target);
    setDetail(null);
    setTab("overview");
    dialog.current?.showModal();
    loadDetail(target).catch((e) => setToast(e.message));
  }, [section, loadDetail]);
  async function open(targetSection: string, id: string) {
    setSelected({ section: targetSection, id });
    setDetail(null);
    setTab("overview");
    dialog.current?.showModal();
    try {
      await loadDetail({ section: targetSection, id });
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Dossier indisponible.");
    }
  }
  async function execute(
    action: string,
    id: string | null,
    values: Record<string, unknown> = {},
  ) {
    setWorking(true);
    try {
      await requestJson("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, data: values }),
      });
      setToast(
        action.endsWith("send") || action === "case_deliver"
          ? "Envoi enregistré dans Communications."
          : "Modification enregistrée.",
      );
      await load();
      if (selected) await loadDetail(selected);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Opération impossible.");
    } finally {
      setWorking(false);
    }
  }
  async function upload(file: File | undefined, kind: string) {
    if (!file || !detail?.item) return;
    setWorking(true);
    try {
      await uploadDocument(
        file,
        selected?.section === "cases"
          ? s(detail.item, "request_id")
          : detail.item.id,
        selected?.section === "cases" ? detail.item.id : null,
        kind,
      );
      setToast("Document privé validé et enregistré.");
      if (selected) await loadDetail(selected);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Import impossible.");
    } finally {
      setWorking(false);
    }
  }
  const list = data.list || [],
    isAdmin = member.role === "admin",
    isSales = member.role !== "production",
    title = titles[section];
  const hasNext =
    section === "sales"
      ? Math.max(data.proposals?.length || 0, data.orders?.length || 0) > 25
      : list.length > 25;
  return (
    <>
      <main className="crm-content">
        <div className="crm-titlebar">
          <div>
            <p className="crm-eyebrow">
              TALENTIQUES /{" "}
              {isAdmin
                ? "PILOTAGE"
                : member.role === "production"
                  ? "PRODUCTION"
                  : "ACQUISITION"}
            </p>
            <h1>{title[0]}</h1>
            <p>{title[1]}</p>
          </div>
          {section === "dashboard" ? (
            <div className="crm-period">
              <CalendarDays size={16} />
              <select
                aria-label="Période"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="today">Aujourd’hui</option>
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="custom">Personnalisé</option>
              </select>
              {period === "custom" && (
                <>
                  <input
                    aria-label="Début"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <input
                    aria-label="Fin"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </>
              )}
            </div>
          ) : (
            <button onClick={() => load().catch((e) => setError(e.message))}>
              Actualiser
            </button>
          )}
        </div>
        {error && (
          <div className="crm-error" role="alert">
            {error}
          </div>
        )}
        {busy ? (
          <div className="crm-loading" role="status" aria-label="Chargement">
            <div />
            <div />
          </div>
        ) : (
          !error && (
            <>
              {section === "dashboard" && (
                <Dashboard
                  data={data}
                  isSales={isSales}
                  execute={execute}
                  open={open}
                />
              )}
              {["requests", "cases", "communications", "sales"].includes(
                section,
              ) && (
                <div className="crm-toolbar">
                  {section !== "sales" && section !== "communications" ? (
                    <div className="crm-search">
                      <Search size={15} />
                      <input
                        ref={searchRef}
                        aria-label="Rechercher un client ou un dossier"
                        placeholder="Rechercher un client ou un dossier…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  ) : (
                    <span className="crm-eyebrow">
                      {section === "sales"
                        ? "PROPOSITIONS & PAIEMENTS"
                        : "JOURNAL DES ENVOIS"}
                    </span>
                  )}
                  <div className="crm-actions">
                    <select
                      aria-label="Filtrer par statut"
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(0);
                      }}
                    >
                      <option value="">Tous les statuts</option>
                      {(section === "requests"
                        ? REQUEST_STATES
                        : section === "cases"
                          ? CASE_STATES
                          : section === "sales"
                            ? [
                                "draft",
                                "approved",
                                "proposal_sent",
                                "converted",
                                "rejected",
                                "expired",
                              ]
                            : [
                                "queued",
                                "sending",
                                "accepted",
                                "failed",
                                "manual",
                                "manual_sent",
                                "cancelled",
                              ]
                      ).map((v) => (
                        <option value={v} key={v}>
                          {LABELS[v] || v}
                        </option>
                      ))}
                    </select>
                    {["requests", "cases"].includes(section) && (
                      <button
                        aria-label={board ? "Vue liste" : "Vue Kanban"}
                        onClick={() => setBoard(!board)}
                      >
                        {board ? (
                          <LayoutList size={16} />
                        ) : (
                          <PanelTop size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
              {["requests", "cases"].includes(section) &&
                (board ? (
                  <div className="crm-kanban">
                    {(section === "cases" ? CASE_STATES : REQUEST_STATES)
                      .filter((v) => list.some((x) => x.status === v))
                      .map((v) => (
                        <div className="crm-kanban-col" key={v}>
                          <h3>
                            {LABELS[v]} ·{" "}
                            {list.filter((x) => x.status === v).length}
                          </h3>
                          {list
                            .filter((x) => x.status === v)
                            .map((row) => (
                              <button
                                className="crm-kanban-card"
                                key={row.id}
                                onClick={() => open(section, row.id)}
                              >
                                <strong>
                                  {s(row, "contact_name") ||
                                    (row.contact?.name as string) ||
                                    "Dossier"}
                                </strong>
                                <small>{date(row.due_at)}</small>
                              </button>
                            ))}
                        </div>
                      ))}
                    {!list.length && <Empty />}
                  </div>
                ) : (
                  <div className="crm-panel">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Client / Dossier</th>
                          <th>Statut</th>
                          <th className="crm-hide-mobile">Responsable</th>
                          <th>Échéance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.slice(0, 25).map((row) => (
                          <tr key={row.id}>
                            <td>
                              <button
                                className="crm-row-open"
                                onClick={() => open(section, row.id)}
                              >
                                <strong>
                                  {s(row, "contact_name") ||
                                    String(row.contact?.name || "Dossier")}
                                </strong>
                                <small>
                                  {s(row, "contact_email") ||
                                    String(row.contact?.email || "")}
                                </small>
                              </button>
                            </td>
                            <td>
                              <Badge value={row.status} />
                              {row.priority !== "normal" && (
                                <small className="crm-priority">
                                  {LABELS[s(row, "priority")]}
                                </small>
                              )}
                            </td>
                            <td className="crm-hide-mobile">
                              {members.find((m) => m.user_id === row.owner_id)
                                ?.name || "À assigner"}
                            </td>
                            <td
                              className={
                                row.due_at &&
                                Date.parse(s(row, "due_at")) < Date.now() &&
                                !["completed", "closed", "converted"].includes(
                                  s(row, "status"),
                                )
                                  ? "crm-warning"
                                  : ""
                              }
                            >
                              {date(row.due_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!list.length && (
                      <Empty
                        title={
                          section === "cases"
                            ? "Aucune prestation à traiter"
                            : "Aucune demande à traiter"
                        }
                        text={
                          section === "cases"
                            ? "Les prestations apparaissent après confirmation du paiement."
                            : "Les demandes qui vous sont autorisées apparaîtront ici."
                        }
                      />
                    )}
                  </div>
                ))}
              {section === "sales" && (
                <Sales
                  data={data}
                  isAdmin={isAdmin}
                  execute={execute}
                  open={open}
                  notify={setToast}
                />
              )}
              {section === "communications" && (
                <Communications
                  list={list.slice(0, 25)}
                  execute={execute}
                  notify={setToast}
                />
              )}
              {section === "settings" && (
                <Settings
                  data={data}
                  members={members}
                  execute={execute}
                  notify={setToast}
                  reload={load}
                />
              )}
              {["requests", "cases", "communications", "sales"].includes(
                section,
              ) && (
                <div className="crm-pagination">
                  <span>Page {page + 1}</span>
                  <button disabled={!page} onClick={() => setPage(page - 1)}>
                    Précédent
                  </button>
                  <button disabled={!hasNext} onClick={() => setPage(page + 1)}>
                    Suivant
                  </button>
                </div>
              )}
            </>
          )
        )}
      </main>
      <dialog
        ref={dialog}
        className="crm-drawer"
        onClose={() => {
          setSelected(null);
          setDetail(null);
        }}
      >
        <div className="crm-drawer-head">
          <div>
            <p className="crm-eyebrow">
              {selected?.section === "contact"
                ? "FICHE CLIENT"
                : selected?.section === "cases"
                  ? "PRESTATION"
                  : "DEMANDE"}
            </p>
            <h2>
              {detail?.contact
                ? s(detail.contact, "name")
                : detail?.item
                  ? s(detail.item, "contact_name") ||
                    String(detail.item.contact?.name || "Dossier")
                  : "Chargement…"}
            </h2>
            <p>
              {detail?.item
                ? s(detail.item, "contact_email") ||
                  String(detail.item.contact?.email || "")
                : detail?.contact
                  ? s(detail.contact, "email")
                  : ""}
            </p>
          </div>
          <button
            aria-label="Fermer la fiche"
            onClick={() => dialog.current?.close()}
          >
            <X size={18} />
          </button>
        </div>
        <div className="crm-drawer-body">
          {!detail ? (
            <div className="crm-loading">
              <div />
            </div>
          ) : selected?.section === "contact" ? (
            <ContactView data={detail} open={open} execute={execute} />
          ) : (
            detail.item && (
              <>
                <div className="crm-tabs" role="tablist">
                  {[
                    ["overview", "Vue générale"],
                    ["documents", "Documents"],
                    ...(selected?.section === "requests"
                      ? [
                          ["report", "Rapport"],
                          ...(isSales ? [["proposal", "Proposition"]] : []),
                        ]
                      : []),
                    ["history", "Historique"],
                  ].map(([key, label]) => (
                    <button
                      role="tab"
                      aria-selected={tab === key}
                      key={key}
                      onClick={() => setTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {tab === "overview" && (
                  <>
                    <div className="crm-detail-section">
                      <div className="crm-actions">
                        <Badge value={detail.item.status} />
                        <Badge value={detail.item.priority} />
                        <button
                          onClick={() =>
                            open(
                              "contact",
                              s(detail.item!, "contact_id") ||
                                String(detail.item!.contact?.id),
                            )
                          }
                        >
                          Fiche client <ArrowRight size={12} />
                        </button>
                      </div>
                      <p className="crm-detail-text" style={{ marginTop: 18 }}>
                        {s(detail.item, "objective")}
                      </p>
                      <p style={{ marginTop: 10, fontSize: 11 }}>
                        {Array.isArray(detail.item.markets)
                          ? detail.item.markets.join(" · ")
                          : ""}{" "}
                        · {s(detail.item, "current_status")}
                      </p>
                      {Boolean(
                        detail.item.linkedin || detail.item.contact?.linkedin,
                      ) && (
                        <a
                          href={String(
                            detail.item.linkedin ||
                              detail.item.contact?.linkedin,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="crm-badge"
                        >
                          Profil LinkedIn ↗
                        </a>
                      )}
                      {Boolean(detail.item.notes) && (
                        <p className="crm-detail-text">
                          {s(detail.item, "notes")}
                        </p>
                      )}
                    </div>
                    <Assignment
                      key={detail.item.id + String(detail.item.updated_at)}
                      item={detail.item}
                      members={members}
                      isAdmin={isAdmin}
                      isCase={selected?.section === "cases"}
                      execute={execute}
                    />
                    {selected?.section === "cases" && (
                      <CaseWorkflow
                        item={detail.item}
                        tasks={detail.tasks || []}
                        documents={detail.documents || []}
                        isAdmin={isAdmin}
                        execute={execute}
                      />
                    )}
                    <form
                      className="crm-form"
                      onSubmit={(e) => {
                        const v = formValues(e);
                        execute(
                          selected?.section === "cases" ? "case_note" : "note",
                          detail.item!.id,
                          v,
                        );
                        e.currentTarget.reset();
                      }}
                    >
                      <label>
                        Note interne
                        <textarea name="text" required maxLength={4000} />
                      </label>
                      <button disabled={working}>Ajouter la note</button>
                    </form>
                  </>
                )}
                {tab === "documents" && (
                  <Documents
                    items={detail.documents || []}
                    isCase={selected?.section === "cases"}
                    upload={upload}
                    working={working}
                  />
                )}{" "}
                {tab === "report" && (
                  <Report
                    item={detail.item}
                    isAdmin={isAdmin}
                    isSales={isSales}
                    execute={execute}
                    upload={upload}
                    working={working}
                    generate={async () => {
                      setWorking(true);
                      try {
                        await requestJson("/api/crm/report", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: detail.item!.id }),
                        });
                        setToast(
                          "PDF privé créé. Vérifiez-le dans Documents avant approbation.",
                        );
                        if (selected) await loadDetail(selected);
                      } catch (e) {
                        setToast(
                          e instanceof Error
                            ? e.message
                            : "Création impossible.",
                        );
                      } finally {
                        setWorking(false);
                      }
                    }}
                  />
                )}{" "}
                {tab === "proposal" && (
                  <ProposalForm
                    item={detail.item}
                    proposals={detail.proposals || []}
                    execute={execute}
                  />
                )}{" "}
                {tab === "history" && (
                  <Timeline items={detail.activity || []} />
                )}
              </>
            )
          )}
        </div>
      </dialog>
      {toast && (
        <div className="crm-toast" role="status">
          {toast}
          <button
            aria-label="Fermer la notification"
            onClick={() => setToast("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}

type Execute = (
  action: string,
  id: string | null,
  data?: Record<string, unknown>,
) => Promise<void>;
function Dashboard({
  data,
  isSales,
  execute,
  open,
}: {
  data: Snapshot;
  isSales: boolean;
  execute: Execute;
  open: (section: string, id: string) => void;
}) {
  const m = data.metrics || {};
  const kpis = isSales
    ? [
        ["Nouvelles demandes", m.new_requests, "À affecter ou à examiner"],
        ["Diagnostics urgents", m.urgent, "Échéance dans moins d’une heure"],
        ["Propositions en attente", m.proposals, "Approuvées ou transmises"],
        ["Prestations actives", m.active_cases, "Dossiers de production"],
      ]
    : [
        ["Mes diagnostics", m.active_diagnostics, "Demandes attribuées"],
        ["Diagnostics urgents", m.urgent, "À traiter en priorité"],
        ["Mes prestations", m.active_cases, "Missions attribuées"],
        ["Livraisons en retard", m.late_cases, "Échéance dépassée"],
      ];
  return (
    <>
      <div className="crm-kpis">
        {kpis.map(([label, value, note]) => (
          <div className="crm-kpi" key={String(label)}>
            <div className="crm-kpi-label">
              {String(label)}
              <ClipboardList size={15} />
            </div>
            <strong>
              {value === null || value === undefined ? "—" : String(value)}
            </strong>
            <small>{String(note)}</small>
          </div>
        ))}
      </div>
      <div className="crm-panels">
        <section className="crm-panel">
          <div className="crm-panel-head">
            <h2>À traiter aujourd’hui</h2>
            <span className="crm-badge">
              {data.tasks?.length || 0} tâches prioritaires
            </span>
          </div>
          {data.tasks?.length ? (
            data.tasks.map((t) => (
              <div className="crm-task" key={t.id}>
                <button
                  className="crm-task-check"
                  aria-label={`Terminer ${s(t, "title")}`}
                  onClick={() => execute("task_done", t.id)}
                >
                  <Check size={12} />
                </button>
                <div>
                  <strong>{s(t, "title")}</strong>
                  <small>{date(t.due_at)}</small>
                </div>
                <button
                  aria-label="Ouvrir le dossier"
                  onClick={() =>
                    open(
                      t.case_id ? "cases" : "requests",
                      s(t, t.case_id ? "case_id" : "request_id"),
                    )
                  }
                >
                  <ArrowRight size={13} />
                </button>
              </div>
            ))
          ) : (
            <Empty
              title="Votre file est à jour"
              text="Les tâches les plus proches de leur échéance apparaîtront ici."
            />
          )}
        </section>
        <section className="crm-panel">
          <div className="crm-panel-head">
            <h2>Activités récentes</h2>
            <span className="crm-eyebrow" style={{ margin: 0 }}>
              DERNIÈRES ACTIONS
            </span>
          </div>
          <Timeline items={data.activity || []} />
        </section>
      </div>
      <div className="crm-panels crm-section-space">
        <section className="crm-panel">
          <div className="crm-panel-head">
            <h2>{isSales ? "Sur la période" : "Mes échéances"}</h2>
            <CalendarDays size={16} />
          </div>
          <div className="crm-panel-body crm-metric-rows">
            {isSales && (
              <>
                <div>
                  <span>Demandes reçues</span>
                  <strong>{String(m.requests || 0)}</strong>
                </div>
                <div>
                  <span>Diagnostics traités / délai moyen réel</span>
                  <strong>
                    {String(m.processed || 0)} /{" "}
                    {m.processing_hours === null
                      ? "—"
                      : `${m.processing_hours} h`}
                  </strong>
                </div>
                <div>
                  <span>Paiements confirmés</span>
                  <strong>{String(m.paid || 0)}</strong>
                </div>
                <div>
                  <span>CA encaissé</span>
                  <strong>
                    {Array.isArray(m.revenue) && m.revenue.length
                      ? m.revenue
                          .map((v) =>
                            new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: v.currency,
                            }).format(Number(v.amount)),
                          )
                          .join(" · ")
                      : "Aucun encaissement"}
                  </strong>
                </div>
                <div>
                  <span>Demandes converties</span>
                  <strong>
                    {m.conversion === null ? "—" : `${m.conversion}%`}
                  </strong>
                </div>
              </>
            )}
            <div>
              <span>Prestations livrées</span>
              <strong>{String(m.delivered || 0)}</strong>
            </div>
            <div>
              <span>Livraisons en retard</span>
              <strong>{String(m.late_cases || 0)}</strong>
            </div>
          </div>
        </section>
        <section className="crm-panel">
          <div className="crm-panel-head">
            <h2>Notifications</h2>
            <ShieldCheck size={16} />
          </div>
          {data.notifications?.length ? (
            data.notifications.map((n) => (
              <div className="crm-task" key={n.id}>
                <div>
                  <strong>{s(n, "title")}</strong>
                  <small>{date(n.created_at)}</small>
                </div>
                <button
                  aria-label="Marquer comme lu"
                  onClick={() => execute("notification_read", n.id)}
                >
                  <CheckCheck size={15} />
                </button>
              </div>
            ))
          ) : (
            <Empty
              title="Aucune notification"
              text="Les affectations et alertes apparaîtront ici."
            />
          )}
        </section>
      </div>
      {isSales && (
        <div className="crm-panels crm-section-space">
          <section className="crm-panel">
            <div className="crm-panel-head">
              <h2>Sources d’acquisition</h2>
            </div>
            <div className="crm-panel-body crm-metric-rows">
              {Array.isArray(m.sources) && m.sources.length ? (
                m.sources.map((v) => (
                  <div key={v.source}>
                    <span>{v.source}</span>
                    <strong>
                      {v.leads} leads · {v.converted} convertis
                    </strong>
                  </div>
                ))
              ) : (
                <p>Aucune donnée sur cette période.</p>
              )}
            </div>
          </section>
          <section className="crm-panel">
            <div className="crm-panel-head">
              <h2>Charge de l’équipe</h2>
            </div>
            <div className="crm-panel-body crm-metric-rows">
              {Array.isArray(m.workload) && m.workload.length ? (
                m.workload.map((v) => (
                  <div key={v.name}>
                    <span>{v.name}</span>
                    <strong>{v.active} prestations</strong>
                  </div>
                ))
              ) : (
                <p>Aucune mission affectée.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
function Assignment({
  item,
  members,
  isAdmin,
  isCase,
  execute,
}: {
  item: Entity;
  members: Member[];
  isAdmin: boolean;
  isCase: boolean;
  execute: Execute;
}) {
  return (
    <form
      className="crm-form crm-detail-section"
      onSubmit={(e) =>
        execute(isCase ? "case_save" : "request_save", item.id, formValues(e))
      }
    >
      <h3>Suivi du dossier</h3>
      <div className="crm-form-grid">
        {isAdmin && (
          <label>
            Responsable
            <select name="owner_id" defaultValue={s(item, "owner_id")}>
              <option value="">À assigner</option>
              {members
                .filter((m) => m.active && (!isCase || m.role !== "sales"))
                .map((m) => (
                  <option value={m.user_id} key={m.user_id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </label>
        )}
        <label>
          Priorité
          <select name="priority" defaultValue={s(item, "priority")}>
            {["normal", "high", "urgent"].map((v) => (
              <option key={v} value={v}>
                {LABELS[v]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Statut
          <select name="status" defaultValue={s(item, "status")}>
            {[
              ...new Set([
                s(item, "status"),
                ...(isCase
                  ? [
                      "missing_info",
                      "unassigned",
                      "production",
                      "corrections",
                      "cancelled",
                    ]
                  : ["new", "assigned", "analyzing", "review", "closed"]),
              ]),
            ].map((v) => (
              <option key={v} value={v}>
                {LABELS[v]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Échéance
          <input
            type="datetime-local"
            name="due_at"
            defaultValue={
              item.due_at
                ? new Date(
                    new Date(s(item, "due_at")).getTime() -
                      new Date().getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 16)
                : ""
            }
          />
        </label>
      </div>
      {isCase && (
        <label>
          Instructions internes
          <textarea
            name="instructions"
            defaultValue={s(item, "instructions")}
            maxLength={4000}
          />
        </label>
      )}
      {(!isCase || isAdmin) && <button>Enregistrer</button>}
    </form>
  );
}
function Documents({
  items,
  isCase,
  upload,
  working,
}: {
  items: Entity[];
  isCase: boolean;
  upload: (file: File | undefined, kind: string) => void;
  working: boolean;
}) {
  const [kind, setKind] = useState(isCase ? "cv_pdf" : "report");
  async function download(id: string) {
    try {
      const result = await requestJson(`/api/crm/documents?id=${id}`);
      window.location.assign(result.url);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Document indisponible.");
    }
  }
  return (
    <>
      {items.map((d) => (
        <div className="crm-doc" key={d.id}>
          <FileText size={20} />
          <div>
            <strong>{s(d, "name")}</strong>
            <small>
              {LABELS[s(d, "kind")]} · {Math.ceil(Number(d.size) / 1024)} Ko ·{" "}
              {date(d.created_at)}
            </small>
            {Boolean(d.approved_at) && <Badge value="approved" />}
          </div>
          <button
            aria-label={`Télécharger ${s(d, "name")}`}
            onClick={() => download(d.id)}
          >
            <ArrowDownToLine size={15} />
          </button>
        </div>
      ))}
      {!items.length && (
        <Empty
          title="Aucun document"
          text="Importez un document pour ce dossier."
        />
      )}
      <div className="crm-upload">
        <label>
          Type de document
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            {(isCase ? DELIVERABLES : ["cv", "report"]).map((k) => (
              <option key={k} value={k}>
                {LABELS[k]}
              </option>
            ))}
          </select>
        </label>
        <label style={{ marginTop: 12 }}>
          Importer · 5 Mo maximum
          <input
            disabled={working}
            type="file"
            accept={
              kind === "cv"
                ? ".pdf,.docx"
                : kind === "cv_word"
                  ? ".docx"
                  : kind === "tracker"
                    ? ".pdf,.xlsx"
                    : ".pdf"
            }
            onChange={(e) => {
              upload(e.target.files?.[0], kind);
              e.target.value = "";
            }}
          />
        </label>
        {working && <LoaderCircle size={16} className="animate-spin" />}
      </div>
    </>
  );
}
function Report({
  item,
  isAdmin,
  isSales,
  execute,
  upload,
  working,
  generate,
}: {
  item: Entity;
  isAdmin: boolean;
  isSales: boolean;
  execute: Execute;
  upload: (file: File | undefined, kind: string) => void;
  working: boolean;
  generate: () => Promise<void>;
}) {
  return (
    <>
      <form
        className="crm-form crm-detail-section"
        onSubmit={(e) => execute("report_save", item.id, formValues(e))}
      >
        <h3>Rapport de diagnostic</h3>
        <p>
          Rédaction et contrôle humains. Enregistrez la trame puis créez le PDF,
          ou importez votre propre rapport.
        </p>
        <label>
          Trame éditable
          <textarea
            name="text"
            rows={16}
            maxLength={20000}
            style={{ minHeight: 320 }}
            defaultValue={
              s(item, "report_text") ||
              "Objectif professionnel\n\nCompatibilité ATS : observations vérifiées\n\nPoints forts\n\nPoints à améliorer\n\nAdéquation au marché ciblé\n\nTrois recommandations prioritaires\n\nProchaines étapes"
            }
          />
        </label>
        <button>Enregistrer le brouillon</button>
      </form>
      <button disabled={working} onClick={generate}>
        <FileText size={15} />
        Créer le PDF du brouillon enregistré
      </button>
      <label className="crm-upload">
        Importer le rapport final PDF
        <input
          disabled={working}
          type="file"
          accept=".pdf"
          onChange={(e) => {
            upload(e.target.files?.[0], "report");
            e.target.value = "";
          }}
        />
      </label>
      <div className="crm-notice">
        {item.report_approved_at
          ? `Rapport approuvé le ${date(item.report_approved_at)}.`
          : "Approbation administrateur requise avant envoi."}
        {Boolean(item.report_sent_at) &&
          ` Transmission enregistrée le ${date(item.report_sent_at)}.`}
      </div>
      <div className="crm-actions">
        {isAdmin && (
          <button
            disabled={working || Boolean(item.report_approved_at)}
            onClick={() => execute("report_approve", item.id)}
          >
            <Check size={14} />
            Approuver
          </button>
        )}
        {isSales && (
          <button
            className="crm-primary"
            disabled={!item.report_approved_at || working}
            onClick={() => execute("report_send", item.id)}
          >
            Envoyer le rapport
          </button>
        )}
      </div>
    </>
  );
}
function ProposalForm({
  item,
  proposals,
  execute,
}: {
  item: Entity;
  proposals: Entity[];
  execute: Execute;
}) {
  const [service, setService] = useState("professional-profile");
  return (
    <>
      <form
        className="crm-form crm-detail-section"
        onSubmit={(e) => {
          const v = formValues(e);
          execute("proposal_create", item.id, {
            ...v,
            amount: Number(v.amount),
            reminder_opt_in: v.reminder_opt_in === "on",
          });
        }}
      >
        <h3>Nouvelle proposition personnalisée</h3>
        <label>
          Service
          <select
            name="service_id"
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            <option value="professional-profile">
              Valorisation professionnelle complète
            </option>
            <option value="student-jobseeker">
              Pack Étudiant & Demandeur d’emploi
            </option>
          </select>
        </label>
        <div className="crm-form-grid">
          <label>
            Tarif
            <input
              key={service}
              type="number"
              step="0.01"
              min="0.01"
              max="9999"
              name="amount"
              required
              defaultValue={service === "professional-profile" ? 45 : 35}
            />
          </label>
          <label>
            Devise
            <select
              name="currency"
              defaultValue={item.market === "en" ? "USD" : "EUR"}
            >
              <option>EUR</option>
              <option>USD</option>
            </select>
          </label>
        </div>
        {service === "student-jobseeker" && (
          <label>
            Vérification d’éligibilité
            <textarea
              name="student_evidence"
              required
              minLength={5}
              maxLength={500}
              placeholder="Référence de justificatif ou vérification réalisée"
            />
          </label>
        )}
        <label>
          Prestations incluses
          <textarea
            name="inclusions"
            required
            maxLength={4000}
            defaultValue="CV ATS Word + PDF, lettre de motivation, optimisation LinkedIn, tableau de suivi des candidatures, corrections jusqu’à finalisation."
          />
        </label>
        <label>
          Message personnalisé
          <textarea name="message" required minLength={10} maxLength={4000} />
        </label>
        <label>
          Conditions, informations complémentaires et délai
          <textarea
            name="conditions"
            required
            maxLength={2000}
            defaultValue="48–72 heures ouvrées après confirmation du paiement et réception des informations nécessaires."
          />
        </label>
        <label>
          Expiration
          <input type="datetime-local" name="expires_at" />
        </label>
        <label>
          <input type="checkbox" name="reminder_opt_in" />
          Autoriser une relance programmée (consentement marketing requis)
        </label>
        <p>
          Les tarifs et exceptions sont soumis à approbation admin.
          Prévisualisation et envoi depuis Commercial.
        </p>
        <button className="crm-primary">
          <Plus size={14} />
          Préparer la proposition
        </button>
      </form>
      {proposals.map((p) => (
        <div className="crm-doc" key={p.id}>
          <div>
            <strong>{money(p)}</strong>
            <small>{date(p.created_at)}</small>
          </div>
          <Badge value={p.status} />
        </div>
      ))}
    </>
  );
}
function CaseWorkflow({
  item,
  tasks,
  documents,
  isAdmin,
  execute,
}: {
  item: Entity;
  tasks: Entity[];
  documents: Entity[];
  isAdmin: boolean;
  execute: Execute;
}) {
  return (
    <div className="crm-detail-section">
      <h3>Livrables attendus</h3>
      {DELIVERABLES.map((kind) => (
        <div className="crm-doc" key={kind}>
          {documents.some((d) => d.kind === kind && d.case_id === item.id) ? (
            <Check size={16} />
          ) : (
            <FileText size={16} />
          )}
          <strong>{LABELS[kind]}</strong>
        </div>
      ))}
      <div className="crm-notice">
        {item.ready_at
          ? `Informations vérifiées · échéance : ${date(item.due_at)}`
          : "Le délai de production démarrera après validation des informations nécessaires."}
      </div>
      <div className="crm-actions">
        {isAdmin && item.status === "completed" && (
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Rouvrir ce dossier pour une nouvelle série de corrections ?",
                )
              )
                execute("case_reopen", item.id);
            }}
          >
            Rouvrir pour corrections
          </button>
        )}
        {isAdmin && !item.ready_at && (
          <button
            onClick={() => {
              const student_evidence =
                item.service_id === "student-jobseeker"
                  ? window.prompt(
                      "Référence de la vérification d’éligibilité étudiant / demandeur d’emploi réalisée",
                    ) || ""
                  : "";
              execute("case_ready", item.id, { student_evidence });
            }}
          >
            Valider les informations
          </button>
        )}
        <button onClick={() => execute("case_submit", item.id)}>
          Soumettre pour validation
        </button>
        {isAdmin && item.status === "quality" && (
          <button onClick={() => execute("case_approve", item.id)}>
            Approuver les livrables
          </button>
        )}
        {isAdmin && item.status === "delivery" && (
          <button
            className="crm-primary"
            onClick={() => {
              if (
                window.confirm(
                  "Autoriser l’envoi des livrables approuvés au client ?",
                )
              )
                execute("case_deliver", item.id);
            }}
          >
            Livrer au client
          </button>
        )}
      </div>
      {isAdmin && (
        <form
          className="crm-form"
          style={{ marginTop: 20 }}
          onSubmit={(e) => execute("case_request_info", item.id, formValues(e))}
        >
          <label>
            Demander un complément au client
            <textarea required minLength={5} name="text" maxLength={3000} />
          </label>
          <button>Préparer la demande sécurisée</button>
        </form>
      )}
      <p style={{ marginTop: 15, fontSize: 10 }}>
        {tasks.filter((t) => t.status === "done").length} / {tasks.length}{" "}
        tâches terminées
      </p>
    </div>
  );
}
function Sales({
  data,
  isAdmin,
  execute,
  open,
  notify,
}: {
  data: Snapshot;
  isAdmin: boolean;
  execute: Execute;
  open: (s: string, id: string) => void;
  notify: (s: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null),
    [payment, setPayment] = useState<string | null>(null);
  return (
    <>
      <section className="crm-panel">
        <div className="crm-panel-head">
          <h2>Propositions personnalisées</h2>
          <small>Approbation avant transmission</small>
        </div>
        {data.proposals?.length ? (
          data.proposals.slice(0, 25).map((p) => (
            <div
              className="crm-panel-body"
              key={p.id}
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <div
                className="crm-actions"
                style={{ justifyContent: "space-between" }}
              >
                <strong>
                  {String(p.request?.contact?.name || "Proposition")} ·{" "}
                  {money(p)}
                </strong>
                <Badge value={p.status} />
              </div>
              <div className="crm-actions" style={{ marginTop: 12 }}>
                <button
                  onClick={() => setPreview(preview === p.id ? null : p.id)}
                >
                  Prévisualiser
                </button>
                <button onClick={() => open("requests", s(p, "request_id"))}>
                  Ouvrir la demande
                </button>
                {isAdmin && p.status === "draft" && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Approuver cette proposition à ${money(p)} ?`,
                        )
                      )
                        execute("proposal_approve", p.id);
                    }}
                  >
                    Approuver
                  </button>
                )}
                {p.status === "approved" && (
                  <button
                    className="crm-primary"
                    onClick={() => execute("proposal_send", p.id)}
                  >
                    Envoyer
                  </button>
                )}
                {!["rejected", "converted", "expired"].includes(
                  s(p, "status"),
                ) && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Marquer cette proposition comme refusée et annuler ses relances ?",
                        )
                      )
                        execute("proposal_reject", p.id);
                    }}
                  >
                    Refus / arrêt des relances
                  </button>
                )}
              </div>
              {preview === p.id && (
                <div className="crm-preview" style={{ marginTop: 15 }}>
                  {s(p, "message")}
                  {"\n\n"}
                  {s(p, "inclusions")}
                  {"\n\n"}
                  {money(p)}
                  {"\n"}
                  {s(p, "conditions")}
                  {"\n"}Expiration :{" "}
                  {p.expires_at
                    ? date(p.expires_at)
                    : "7 jours après émission du lien de paiement"}
                </div>
              )}
            </div>
          ))
        ) : (
          <Empty
            title="Aucune proposition"
            text="Préparez une proposition depuis une fiche demande."
          />
        )}
      </section>
      <section className="crm-panel">
        <div className="crm-panel-head">
          <h2>Paiements & commandes</h2>
          <ShieldCheck size={17} />
        </div>
        {data.orders?.length ? (
          data.orders.slice(0, 25).map((o) => (
            <div
              className="crm-panel-body"
              key={o.id}
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <div
                className="crm-actions"
                style={{ justifyContent: "space-between" }}
              >
                <strong>
                  {s(o, "customer_name")} · {money(o)}
                </strong>
                <Badge value={o.status} />
              </div>
              <p style={{ fontSize: 10, margin: "6px 0 10px" }}>
                {o.id} · {date(o.created_at)}
              </p>
              {isAdmin && o.status !== "paid" && o.status !== "refunded" && (
                <button
                  onClick={() => setPayment(payment === o.id ? null : o.id)}
                >
                  Vérifier le paiement
                </button>
              )}
              {isAdmin && o.status === "paid" && (
                <button
                  onClick={() => {
                    const reference = window.prompt(
                      "Référence du remboursement réellement vérifié (8 caractères minimum)",
                    );
                    if (reference)
                      execute("payment_refund", o.id, { reference });
                  }}
                >
                  Enregistrer un remboursement vérifié
                </button>
              )}
              {payment === o.id && (
                <form
                  className="crm-form crm-section-space"
                  onSubmit={(e) => {
                    const v = formValues(e);
                    if (v.confirm !== "on") {
                      notify("Confirmez la vérification réelle.");
                      return;
                    }
                    if (
                      window.confirm(
                        "Confirmer ce paiement vérifié et ouvrir une seule prestation ?",
                      )
                    )
                      execute("manual_payment", o.id, {
                        ...v,
                        amount: Number(v.amount),
                      });
                  }}
                >
                  <div className="crm-form-grid">
                    <label>
                      Montant réellement reçu
                      <input
                        type="number"
                        step="0.01"
                        name="amount"
                        required
                        defaultValue={Number(o.amount)}
                      />
                    </label>
                    <label>
                      Devise
                      <input
                        name="currency"
                        required
                        defaultValue={s(o, "currency")}
                      />
                    </label>
                    <label>
                      Bénéficiaire vérifié
                      <input name="beneficiary" required minLength={3} />
                    </label>
                    <label>
                      Référence de transaction vérifiée
                      <input name="reference" minLength={8} required />
                    </label>
                  </div>
                  <label>
                    <input type="checkbox" name="confirm" required />
                    J’ai vérifié la transaction dans le compte PayPal du
                    bénéficiaire.
                  </label>
                  <button className="crm-primary">
                    Confirmer le paiement vérifié
                  </button>
                </form>
              )}
            </div>
          ))
        ) : (
          <Empty
            title="Aucune commande"
            text="Les paiements non confirmés restent en attente et n’ouvrent aucune production."
          />
        )}
      </section>
    </>
  );
}
function Communications({
  list,
  execute,
  notify,
}: {
  list: Entity[];
  execute: Execute;
  notify: (s: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <section className="crm-panel">
      {list.length ? (
        list.map((m) => (
          <div
            className="crm-panel-body"
            key={m.id}
            style={{ borderBottom: "1px solid var(--line)" }}
          >
            <div
              className="crm-actions"
              style={{ justifyContent: "space-between" }}
            >
              <div>
                <strong>{s(m, "subject")}</strong>
                <p style={{ fontSize: 11 }}>
                  {s(m, "recipient")} · {date(m.created_at)}
                </p>
              </div>
              <Badge value={m.status} />
            </div>
            {Boolean(m.error) && (
              <p className="crm-error" style={{ marginTop: 12 }}>
                {s(m, "error")}
              </p>
            )}
            <div className="crm-actions" style={{ marginTop: 12 }}>
              <button
                onClick={() => setPreview(preview === m.id ? null : m.id)}
              >
                Lire
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `À : ${s(m, "recipient")}\nObjet : ${s(m, "subject")}\n\n${s(m, "body")}`,
                    );
                    notify(
                      "Message copié. Joignez les documents approuvés depuis la fiche dossier.",
                    );
                  } catch {
                    notify(
                      "Copie indisponible. Ouvrez le message et sélectionnez son texte.",
                    );
                  }
                }}
              >
                Copier
              </button>
              {["failed", "manual"].includes(s(m, "status")) && (
                <>
                  <button onClick={() => execute("message_retry", m.id)}>
                    Réessayer
                  </button>
                  <button
                    onClick={() => {
                      const reference = window.prompt(
                        "Référence de l’email réellement transmis avec ses pièces jointes (8 caractères minimum)",
                      );
                      if (reference)
                        execute("message_manual", m.id, { reference });
                    }}
                  >
                    Déclarer une transmission manuelle
                  </button>
                </>
              )}
            </div>
            {preview === m.id && (
              <div className="crm-preview" style={{ marginTop: 12 }}>
                {s(m, "body")}
                {Array.isArray(m.document_ids) &&
                  m.document_ids.length > 0 &&
                  `\n\n${m.document_ids.length} pièce(s) jointe(s) approuvée(s) à transmettre.`}
              </div>
            )}
          </div>
        ))
      ) : (
        <Empty
          title="Aucun envoi"
          text="Les accusés de réception, rapports et livraisons sont suivis ici."
        />
      )}
    </section>
  );
}
function Settings({
  data,
  members,
  execute,
  notify,
  reload,
}: {
  data: Snapshot;
  members: Member[];
  execute: Execute;
  notify: (s: string) => void;
  reload: () => Promise<void>;
}) {
  const hours = data.settings;
  async function jobs() {
    try {
      const result = await requestJson("/api/crm/jobs", { method: "POST" });
      notify(
        `${result.accepted} acceptés par le fournisseur · ${result.manual} à transmettre manuellement · ${result.failed} échecs.`,
      );
      await reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Traitement impossible.");
    }
  }
  return (
    <>
      <div className="crm-panels">
        <section className="crm-panel">
          <div className="crm-panel-head">
            <h2>Horaires & engagements</h2>
          </div>
          {hours && (
            <form
              className="crm-form crm-panel-body"
              onSubmit={(e) => {
                const v = formValues(e);
                const f = new FormData(e.currentTarget);
                execute("settings_save", null, {
                  timezone: v.timezone,
                  days: f.getAll("days").map(Number),
                  start: Number(v.start),
                  end: Number(v.end),
                  diagnostic_hours: Number(v.diagnostic_hours),
                  production_hours: Number(v.production_hours),
                  retention_days: Number(v.retention_days),
                  reminder_days: Number(v.reminder_days),
                  promise_enabled: v.promise_enabled === "on",
                  auto_assign: v.auto_assign === "on",
                });
              }}
            >
              <label>
                Fuseau horaire IANA
                <input name="timezone" required defaultValue={hours.timezone} />
              </label>
              <div className="crm-chips">
                {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(
                  (day, i) => (
                    <label key={day}>
                      <input
                        type="checkbox"
                        name="days"
                        value={i}
                        defaultChecked={hours.days.includes(i)}
                      />
                      {day}
                    </label>
                  ),
                )}
              </div>
              <div className="crm-form-grid">
                {[
                  ["start", "Ouverture", hours.start],
                  ["end", "Fermeture", hours.end],
                  [
                    "diagnostic_hours",
                    "Diagnostic (heures ouvrées)",
                    hours.diagnostic_hours,
                  ],
                  [
                    "production_hours",
                    "Production (heures ouvrées)",
                    hours.production_hours,
                  ],
                  [
                    "retention_days",
                    "Conservation documents (jours)",
                    hours.retention_days,
                  ],
                  [
                    "reminder_days",
                    "Relance (jours calendaires)",
                    hours.reminder_days,
                  ],
                ].map(([name, label, value]) => (
                  <label key={String(name)}>
                    {String(label)}
                    <input
                      required
                      type="number"
                      name={String(name)}
                      defaultValue={Number(value)}
                    />
                  </label>
                ))}
              </div>
              <label>
                <input
                  type="checkbox"
                  name="promise_enabled"
                  defaultChecked={hours.promise_enabled}
                />
                Afficher l’engagement de délai du diagnostic au client
              </label>
              <label>
                <input
                  type="checkbox"
                  name="auto_assign"
                  defaultChecked={hours.auto_assign}
                />
                Affecter la production au membre le moins chargé
              </label>
              <p>
                27 heures ouvrées = trois journées de 9 heures. La conservation
                supprime les fichiers des dossiers clôturés ; les données de
                suivi restent conservées.
              </p>
              <button className="crm-primary">Enregistrer</button>
            </form>
          )}
        </section>
        <section className="crm-panel">
          <div className="crm-panel-head">
            <h2>Intégrations & traitements</h2>
          </div>
          <div className="crm-panel-body crm-metric-rows">
            {Object.entries(data.integrations || {}).map(([key, value]) => (
              <div key={key}>
                <span>
                  {
                    (
                      {
                        supabase: "Supabase",
                        email: "Resend",
                        paypal: "PayPal",
                        scheduler: "Secret du planificateur",
                      } as Record<string, string>
                    )[key]
                  }
                </span>
                <Badge value={value ? "configured" : "missing_info"} />
              </div>
            ))}
            <p style={{ margin: "16px 0" }}>
              Le secret seul n’active pas une planification. Configurez un appel
              régulier au traitement ou lancez-le ici.
            </p>
            <button onClick={jobs}>Traiter la file & les échéances</button>
          </div>
        </section>
      </div>
      <section className="crm-panel crm-section-space">
        <div className="crm-panel-head">
          <h2>Équipe & accès</h2>
          <small>Invitation ou approbation obligatoire</small>
        </div>
        <div className="crm-panel-body">
          <form
            className="crm-form"
            onSubmit={async (e) => {
              const v = formValues(e);
              try {
                const r = await requestJson("/api/crm/team", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(v),
                });
                notify(r.message);
                await reload();
              } catch (err) {
                notify(
                  err instanceof Error ? err.message : "Invitation impossible.",
                );
              }
            }}
          >
            <div className="crm-form-grid">
              <label>
                Nom
                <input required name="name" maxLength={150} />
              </label>
              <label>
                Email
                <input required name="email" type="email" />
              </label>
              <label>
                Rôle
                <select name="role">
                  <option value="production">Production</option>
                  <option value="sales">Acquisition / Commercial</option>
                  <option value="admin">Administration</option>
                </select>
              </label>
            </div>
            <button>
              <Plus size={15} />
              Inviter un membre
            </button>
          </form>
          <div className="crm-section-space">
            {members.map((m) => (
              <form
                key={m.user_id}
                className="crm-doc"
                onSubmit={(e) => {
                  const v = formValues(e);
                  if (
                    window.confirm("Appliquer cette modification des accès ?")
                  )
                    execute("member_save", m.user_id, {
                      name: m.name,
                      role: v.role,
                      active: v.active === "on",
                    });
                }}
              >
                <div>
                  <strong>{m.name}</strong>
                  <small>{m.user_id}</small>
                </div>
                <select
                  aria-label={`Rôle de ${m.name}`}
                  name="role"
                  defaultValue={m.role}
                  style={{ width: 140 }}
                >
                  <option value="admin">Admin</option>
                  <option value="sales">Commercial</option>
                  <option value="production">Production</option>
                </select>
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={m.active}
                  />
                  Actif
                </label>
                <button aria-label={`Enregistrer ${m.name}`}>
                  <Check size={15} />
                </button>
              </form>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
function ContactView({
  data,
  open,
  execute,
}: {
  data: Snapshot;
  open: (s: string, id: string) => void;
  execute: Execute;
}) {
  const [tab, setTab] = useState("overview");
  const member = useMember();
  return (
    <>
      <div className="crm-tabs" role="tablist">
        {[
          ["overview", "Vue générale"],
          ["requests", "Demandes"],
          ["proposals", "Propositions"],
          ["cases", "Prestations"],
          ["documents", "Documents"],
          ["history", "Historique"],
        ].map(([v, l]) => (
          <button
            role="tab"
            key={v}
            aria-selected={tab === v}
            onClick={() => setTab(v)}
          >
            {l}
          </button>
        ))}
      </div>
      {tab === "overview" && data.contact && (
        <div className="crm-form">
          <h3>{s(data.contact, "name")}</h3>
          <p>
            {s(data.contact, "email")}
            <br />
            {s(data.contact, "phone")}
          </p>
          <p>
            {data.requests?.length || 0} demandes autorisées ·{" "}
            {data.proposals?.length || 0} propositions visibles
          </p>
          {member.role !== "production" && (
            <button
              disabled={Boolean(data.contact.marketing_opted_out_at)}
              onClick={() => {
                if (
                  window.confirm(
                    "Enregistrer le retrait du consentement marketing et arrêter toutes les relances de ce contact ?",
                  )
                )
                  execute("contact_optout", data.contact!.id);
              }}
            >
              {data.contact.marketing_opted_out_at
                ? "Relances marketing désactivées"
                : "Retirer le consentement marketing"}
            </button>
          )}
        </div>
      )}
      {tab === "requests" &&
        data.requests?.map((r) => (
          <div className="crm-doc" key={r.id}>
            <div>
              <strong>{s(r, "objective")}</strong>
              <small>{date(r.created_at)}</small>
            </div>
            <button onClick={() => open("requests", r.id)}>Ouvrir</button>
          </div>
        ))}
      {tab === "proposals" &&
        data.proposals?.map((p) => (
          <div className="crm-doc" key={p.id}>
            <strong>{money(p)}</strong>
            <Badge value={p.status} />
          </div>
        ))}
      {tab === "cases" &&
        (data.cases?.length ? (
          data.cases.map((c) => (
            <div className="crm-doc" key={c.id}>
              <div>
                <strong>{s(c, "objective")}</strong>
                <small>{date(c.due_at)}</small>
              </div>
              <Badge value={c.status} />
              <button onClick={() => open("cases", c.id)}>Ouvrir</button>
            </div>
          ))
        ) : (
          <Empty
            title="Aucune prestation autorisée"
            text="Les prestations de ce client apparaîtront ici."
          />
        ))}
      {tab === "documents" &&
        data.documents?.map((d) => (
          <div className="crm-doc" key={d.id}>
            <FileText size={15} />
            <strong>{s(d, "name")}</strong>
            <button
              onClick={async () => {
                const result = await requestJson(
                  `/api/crm/documents?id=${d.id}`,
                );
                window.location.assign(result.url);
              }}
            >
              Ouvrir
            </button>
          </div>
        ))}
      {tab === "history" && <Timeline items={data.activity || []} />}
    </>
  );
}
