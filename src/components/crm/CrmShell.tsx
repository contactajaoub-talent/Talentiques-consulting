"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  BriefcaseBusiness,
  Layers3,
  Mail,
  Settings2,
  LogOut,
  Menu,
  ArrowUpRight,
  Search,
  X,
} from "lucide-react";
import { LABELS, type Member } from "@/lib/crm/core";
const MemberContext = createContext<Member | null>(null);
export function useMember() {
  const m = useContext(MemberContext);
  if (!m) throw new Error("Member context missing");
  return m;
}
function GlobalSearch() {
  const [query, setQuery] = useState(""),
    [results, setResults] = useState<
      Array<{
        id: string;
        kind: string;
        name: string;
        objective: string;
        status: string;
      }>
    >([]),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      fetch(`/api/crm?section=search&search=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then(async (r) => {
          const v = await r.json();
          if (!r.ok) throw new Error(v.error);
          setResults(v.data);
          setError("");
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError("Recherche indisponible.");
        });
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);
  return (
    <div className="crm-global-search">
      <Search size={14} />
      <input
        aria-label="Recherche globale"
        placeholder="Rechercher dans le CRM…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setQuery("");
        }}
      />
      {query.length > 1 && (
        <div className="crm-search-results" aria-live="polite">
          {error ? (
            <p>{error}</p>
          ) : results.length ? (
            results.map((r) => (
              <button
                key={r.id + r.kind}
                onClick={() =>
                  window.location.assign(`/crm/${r.kind}?open=${r.id}`)
                }
              >
                <strong>
                  {r.name}
                  <small>
                    {r.kind === "cases" ? "Prestation" : "Demande"} ·{" "}
                    {LABELS[r.status]}
                  </small>
                </strong>
                <span>{r.objective.slice(0, 70)}</span>
              </button>
            ))
          ) : (
            <p>Aucun résultat autorisé.</p>
          )}
        </div>
      )}
    </div>
  );
}
const navigation = [
  ["/crm", "Dashboard", LayoutDashboard],
  ["/crm/requests", "Demandes", Inbox],
  ["/crm/sales", "Commercial", BriefcaseBusiness],
  ["/crm/cases", "Prestations", Layers3],
  ["/crm/communications", "Communications", Mail],
  ["/crm/settings", "Administration", Settings2],
] as const;
export function CrmShell({
  member,
  children,
}: {
  member: Member;
  children: React.ReactNode;
}) {
  const path = usePathname(),
    [open, setOpen] = useState(false);
  return (
    <MemberContext.Provider value={member}>
      <div className="crm-app">
        <aside className={`crm-sidebar ${open ? "is-open" : ""}`}>
          <Link className="crm-brand" href="/crm">
            <span className="crm-logomark">T</span>
            <span>
              TALENTIQUES<span className="crm-brand-sub">WORKSPACE / CRM</span>
            </span>
          </Link>
          <button
            className="crm-mobile-menu crm-sidebar-close"
            aria-label="Fermer la navigation"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
          <div className="crm-space-label">ESPACE DE TRAVAIL</div>
          <nav aria-label="CRM">
            {navigation
              .filter(([url]) =>
                url === "/crm/settings"
                  ? member.role === "admin"
                  : member.role === "production"
                    ? !["/crm/sales", "/crm/communications"].includes(url)
                    : true,
              )
              .map(([url, label, Icon]) => (
                <Link
                  key={url}
                  href={url}
                  onClick={() => setOpen(false)}
                  aria-current={path === url ? "page" : undefined}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {path === url && <span className="crm-nav-dot" />}
                </Link>
              ))}
          </nav>
          <div className="crm-sidebar-bottom">
            <a href="/" target="_blank" rel="noreferrer">
              Site public
              <ArrowUpRight size={15} />
            </a>
            <div className="crm-profile">
              <span className="crm-avatar">
                {member.name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <strong>{member.name}</strong>
                <small>
                  {member.role === "production"
                    ? "Production"
                    : LABELS[member.role]}
                </small>
              </div>
              <button
                aria-label="Se déconnecter"
                onClick={async () => {
                  await fetch("/api/crm/auth", { method: "DELETE" });
                  window.location.assign("/crm/login");
                }}
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </aside>
        <div className="crm-main">
          <header className="crm-topbar">
            <button
              className="crm-mobile-menu"
              aria-label="Ouvrir la navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <Menu size={20} />
            </button>
            <div>
              <span className="crm-breadcrumb">Workspace</span>
              <span className="crm-divider">/</span>
              <strong>
                {navigation.find(([url]) => url === path)?.[1] || "Dashboard"}
              </strong>
            </div>
            <GlobalSearch />
            <span className="crm-private">
              <span />
              Espace privé
            </span>
          </header>
          {children}
          <footer className="crm-footer">
            TALENTIQUES <span>Chaque parcours mérite de l’attention.</span>
          </footer>
        </div>
      </div>
    </MemberContext.Provider>
  );
}
