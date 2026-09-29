import type { LucideIcon } from 'lucide-react';

export function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: React.ReactNode; detail?: string; icon?: LucideIcon }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
    <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-500">{label}</p>{Icon ? <span className="rounded-xl bg-sky-50 p-2 text-[#0683C9]"><Icon size={18} /></span> : null}</div>
    <div className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-950">{value}</div>
    {detail ? <p className="mt-2 text-xs text-slate-400">{detail}</p> : null}
  </div>;
}

export function Panel({ title, eyebrow, action, children, className = '' }: { title: string; eyebrow?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,.03)] sm:p-6 ${className}`}>
    <div className="mb-5 flex items-start justify-between gap-4"><div>{eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#0683C9]">{eyebrow}</p> : null}<h2 className={`${eyebrow ? 'mt-2' : ''} font-heading text-xl font-bold text-slate-950 sm:text-2xl`}>{title}</h2></div>{action}</div>
    {children}
  </section>;
}

export function StatusBadge({ value }: { value: string }) {
  const tone = value === 'Client' || value === 'Active' || value === 'Vérifié' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : value === 'Perdu' || value === 'En pause' ? 'bg-slate-100 text-slate-600 ring-slate-500/10' : value === 'Intéressé' || value === 'A répondu' ? 'bg-sky-50 text-sky-700 ring-sky-600/10' : value === 'Offre envoyée' || value === 'Relance' ? 'bg-amber-50 text-amber-700 ring-amber-600/10' : 'bg-blue-50 text-blue-700 ring-blue-600/10';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tone}`}>{value}</span>;
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"><p className="font-heading text-lg font-bold text-slate-800">{title}</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{detail}</p></div>;
}

export function Score({ value }: { value: number }) {
  return <span className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-extrabold ${value >= 80 ? 'bg-emerald-50 text-emerald-700' : value >= 60 ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>{value}</span>;
}

export function formatShortDate(value: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
