'use client';

import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, CircleCheck, Flame, MailCheck, MessageCircleReply, PhoneCall, Target, Users } from 'lucide-react';
import { useAcquisition } from './AcquisitionProvider';
import { EmptyState, formatShortDate, MetricCard, Panel, Score, StatusBadge } from './ui';

function isToday(value: string) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

export function DashboardView() {
  const { prospects, campaigns, revenue, markets } = useAcquisition();
  const active = prospects.filter((item) => !['Client', 'Perdu'].includes(item.status));
  const due = active.filter((item) => isToday(item.nextActionAt));
  const hot = active.filter((item) => item.score >= 80);
  const clients = prospects.filter((item) => item.status === 'Client');
  const metrics = [
    ['Prospects à traiter', active.length, Users], ['À contacter', prospects.filter((item) => ['Nouveau', 'À qualifier', 'À contacter'].includes(item.status)).length, PhoneCall],
    ['Réponses à traiter', prospects.filter((item) => item.status === 'A répondu').length, MessageCircleReply], ['Relances aujourd’hui', due.length, CircleCheck],
    ['Prospects chauds', hot.length, Flame], ['Offres envoyées', prospects.filter((item) => item.status === 'Offre envoyée').length, MailCheck],
    ['Ventes aujourd’hui', clients.filter((item) => isToday(item.updatedAt)).length, Target], ['Revenu attribué EUR', `${revenue.EUR.toLocaleString('fr-FR')} EUR`, BadgeDollarSign], ['Revenu attribué USD', `${revenue.USD.toLocaleString('fr-FR')} USD`, BadgeDollarSign],
  ] as const;
  const priority = [...active].sort((a, b) => b.score - a.score).slice(0, 5);
  const recent = prospects.flatMap((prospect) => prospect.activities.map((event) => ({ ...event, prospect }))).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 5);

  return <>
    <div className="mb-8 rounded-3xl bg-[#071b2b] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-300">Session du jour</p><h2 className="mt-3 max-w-2xl font-heading text-2xl font-bold sm:text-3xl">Transformez votre liste prioritaire en conversations qualifiées.</h2><p className="mt-3 text-sm text-slate-300">{due.length} action(s) prévue(s) aujourd’hui · {hot.length} prospect(s) à fort potentiel.</p></div><Link href="/acquisition/prospecting" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0683C9] px-5 text-sm font-bold text-white transition hover:bg-sky-500">Commencer ma session de prospection <ArrowRight size={17} /></Link></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, Icon]) => <MetricCard key={label} label={label} value={value} icon={Icon} />)}</div>
    <div className="mt-7 grid gap-7 xl:grid-cols-[1.15fr_.85fr]">
      <Panel title="Prochaines actions" eyebrow="Next Action Engine"><div className="space-y-3">{due.length ? due.map((item) => <Link key={item.id} href={`/acquisition/prospects/${item.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-sky-200 hover:bg-sky-50/40"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#0683C9]"><PhoneCall size={18} /></span><span className="min-w-0 flex-1"><span className="block truncate font-bold">{item.firstName} {item.lastName}</span><span className="block truncate text-sm text-slate-500">{item.nextAction}</span></span><span className="text-xs font-bold text-slate-500">{formatShortDate(item.nextActionAt)}</span></Link>) : <EmptyState title="Agenda à jour" detail="Aucune action n’est due aujourd’hui." />}</div></Panel>
      <Panel title="Prospects prioritaires"><div className="space-y-3">{priority.map((item) => <Link key={item.id} href={`/acquisition/prospects/${item.id}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"><Score value={item.score} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{item.firstName} {item.lastName}</span><span className="block truncate text-xs text-slate-500">{item.jobTitle} · {item.market}</span></span><StatusBadge value={item.status} /></Link>)}</div></Panel>
      <Panel title="Campagnes actives"><div className="grid gap-3 sm:grid-cols-2">{campaigns.filter((campaign) => campaign.status === 'Active').map((campaign) => { const count = prospects.filter((p) => p.campaignId === campaign.id).length; return <div key={campaign.id} className="rounded-2xl border border-slate-100 p-4"><div className="flex items-center justify-between"><p className="font-bold">{campaign.name}</p><StatusBadge value={campaign.status} /></div><p className="mt-2 text-sm text-slate-500">{count} prospects · {campaign.product}</p></div>; })}</div></Panel>
      <Panel title="Activité récente"><div className="space-y-4">{recent.map((item) => <div key={item.id} className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0683C9]" /><div><p className="text-sm font-bold">{item.label} · {item.prospect.firstName} {item.prospect.lastName}</p><p className="text-xs text-slate-500">{formatShortDate(item.occurredAt)}{item.detail ? ` · ${item.detail}` : ''}</p></div></div>)}</div></Panel>
      <Panel title="Performance par marché" className="xl:col-span-2"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{markets.map((market) => { const rows = prospects.filter((p) => p.marketId === market.id); const won = rows.filter((p) => p.status === 'Client').length; return <div key={market.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold">{market.name}</p><p className="mt-3 font-heading text-2xl font-bold">{rows.length}</p><p className="text-xs text-slate-500">prospects · {won} vente(s)</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#0683C9]" style={{ width: `${rows.length ? won / rows.length * 100 : 0}%` }} /></div></div>; })}</div></Panel>
    </div>
  </>;
}
