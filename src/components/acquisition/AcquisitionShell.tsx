'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Boxes, Cable, Inbox, KanbanSquare, LayoutDashboard, LogOut, Menu, MessageSquareText, SearchCheck, Settings, Users, X } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { href: '/acquisition', label: 'Vue générale', icon: LayoutDashboard },
  { href: '/acquisition/prospects', label: 'Prospects', icon: Users },
  { href: '/acquisition/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { href: '/acquisition/prospecting', label: 'Prospecting Mode', icon: SearchCheck },
  { href: '/acquisition/inbox', label: 'Inbox', icon: Inbox },
  { href: '/acquisition/campaigns', label: 'Campagnes', icon: Boxes },
  { href: '/acquisition/templates', label: 'Modèles de messages', icon: MessageSquareText },
  { href: '/acquisition/integrations', label: 'Intégrations', icon: Cable },
  { href: '/acquisition/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/acquisition/settings', label: 'Paramètres', icon: Settings },
] as const;

export function AcquisitionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <button type="button" onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 rounded-xl bg-[#071b2b] p-3 text-white shadow-lg lg:hidden" aria-label="Ouvrir la navigation"><Menu size={20} /></button>
    {open ? <button className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Fermer la navigation" /> : null}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#071b2b] p-5 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-start justify-between gap-3 px-2 pt-1"><Link href="/acquisition" onClick={() => setOpen(false)} className="font-heading text-2xl font-bold">TalentiQues</Link><button onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 lg:hidden" aria-label="Fermer"><X size={20} /></button></div>
      <p className="mt-2 px-2 text-[11px] font-bold tracking-[.16em] text-sky-300">ACQUISITION OS</p>
      <nav className="mt-8 space-y-1 overflow-y-auto pb-4" aria-label="Navigation principale">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === '/acquisition' ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-white text-[#071b2b] shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={18} />{label}</Link>;
        })}
      </nav>
      <form action="/api/affiliate/admin/auth/logout" method="post" className="mt-auto border-t border-white/10 pt-4"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"><LogOut size={18} />Déconnexion</button></form>
    </aside>
    <main className="lg:ml-[280px]">{children}</main>
  </div>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return <header className="mb-8 flex flex-col gap-5 pt-16 sm:flex-row sm:items-end sm:justify-between lg:pt-0"><div><p className="text-[11px] font-bold tracking-[.16em] text-[#0683C9]">TALENTIQUES ACQUISITION OS</p><h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>{description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p> : null}</div>{action}</header>;
}
