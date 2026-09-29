'use client';

import { BadgeDollarSign, MailCheck, MessageCircleReply, Target, Users } from 'lucide-react';
import { useAcquisition } from './AcquisitionProvider';
import { MetricCard, Panel } from './ui';

function BarRows({ rows }: { rows: Array<{ label: string; value: number; detail: string }> }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return <div className="space-y-4">{rows.map((row) => <div key={row.label}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-bold">{row.label}</span><span className="text-slate-500">{row.detail}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0683C9]" style={{ width: `${Math.max(6, row.value / max * 100)}%` }} /></div></div>)}</div>;
}

export function AnalyticsView() {
  const { prospects, campaigns, revenue } = useAcquisition();
  const contacted = prospects.filter((item) => !['Nouveau', 'À qualifier', 'À contacter'].includes(item.status)).length;
  const replies = prospects.filter((item) => ['A répondu', 'Intéressé', 'Offre envoyée', 'Client'].includes(item.status)).length;
  const interested = prospects.filter((item) => ['Intéressé', 'Offre envoyée', 'Client'].includes(item.status)).length;
  const offers = prospects.filter((item) => ['Offre envoyée', 'Client'].includes(item.status)).length;
  const sales = prospects.filter((item) => item.status === 'Client').length;
  const groups = (key: 'market' | 'source' | 'potentialProduct') => [...new Set(prospects.map((item) => item[key]))].map((label) => { const rows = prospects.filter((item) => item[key] === label); return { label, value: rows.length, detail: `${rows.filter((item) => item.status === 'Client').length} vente(s)` }; });
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><MetricCard label="Prospects traités" value={prospects.length} icon={Users} /><MetricCard label="Contactés" value={contacted} icon={MailCheck} /><MetricCard label="Réponses" value={replies} icon={MessageCircleReply} /><MetricCard label="Intéressés" value={interested} icon={Target} /><MetricCard label="Offres envoyées" value={offers} /><MetricCard label="Ventes" value={sales} /><MetricCard label="Revenu attribué EUR" value={`${revenue.EUR.toLocaleString('fr-FR')} EUR`} icon={BadgeDollarSign} /><MetricCard label="Revenu attribué USD" value={`${revenue.USD.toLocaleString('fr-FR')} USD`} icon={BadgeDollarSign} /><MetricCard label="Taux de réponse" value={`${contacted ? Math.round(replies / contacted * 100) : 0}%`} /><MetricCard label="Taux de conversion" value={`${contacted ? Math.round(sales / contacted * 100) : 0}%`} /></div><div className="mt-7 grid gap-7 xl:grid-cols-2"><Panel title="Performance par marché"><BarRows rows={groups('market')} /></Panel><Panel title="Performance par campagne"><BarRows rows={campaigns.map((campaign) => ({ label: campaign.name, value: prospects.filter((item) => item.campaignId === campaign.id).length, detail: `${campaign.revenue.toLocaleString('fr-FR')} ${campaign.currency}` }))} /></Panel><Panel title="Performance par source"><BarRows rows={groups('source')} /></Panel><Panel title="Performance par produit"><BarRows rows={groups('potentialProduct')} /></Panel><Panel title="Performance des scripts / templates" className="xl:col-span-2"><p className="text-sm leading-6 text-slate-500">Aucune métrique fiable n’est affichée tant que les événements d’envoi, de réponse et de conversion ne sont pas attribués à un template.</p></Panel></div></>;
}
