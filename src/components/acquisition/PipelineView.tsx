'use client';

import { CalendarClock, GripVertical } from 'lucide-react';
import type { DragEvent } from 'react';
import type { ProspectStatus } from '@/lib/acquisition/types';
import { recordStatusChange, useAcquisition } from './AcquisitionProvider';
import { formatShortDate, Score } from './ui';

const columns: ProspectStatus[] = ['Nouveau', 'Contacté', 'A répondu', 'Intéressé', 'Offre envoyée', 'Client', 'Perdu'];

export function PipelineView() {
  const { prospects, updateProspect } = useAcquisition();
  function drop(event: DragEvent<HTMLElement>, status: ProspectStatus) { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (id) updateProspect(id, { status }, recordStatusChange(status)); }
  return <div className="overflow-x-auto pb-4"><div className="grid min-w-[1960px] grid-cols-7 gap-4">{columns.map((status) => { const items = prospects.filter((item) => item.status === status || (status === 'Nouveau' && ['À qualifier', 'À contacter', 'Relance'].includes(item.status))); return <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, status)} className="min-h-[560px] rounded-2xl bg-slate-100/80 p-3"><header className="mb-3 flex items-center justify-between px-1"><h2 className="font-heading font-bold">{status}</h2><span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-500">{items.length}</span></header><div className="space-y-3">{items.map((item) => <article key={item.id} draggable onDragStart={(event) => { event.dataTransfer.setData('text/plain', item.id); event.dataTransfer.effectAllowed = 'move'; }} className="cursor-grab rounded-2xl border border-slate-200 bg-white p-4 shadow-sm active:cursor-grabbing"><div className="flex items-start gap-2"><GripVertical className="mt-1 shrink-0 text-slate-300" size={16} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="font-bold">{item.firstName} {item.lastName}</p><Score value={item.score} /></div><p className="mt-1 truncate text-xs text-slate-500">{item.jobTitle}</p><p className="mt-3 text-xs font-semibold text-slate-600">{item.country} · {item.potentialProduct}</p>{item.nextActionAt ? <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-500"><CalendarClock size={14} /><span className="truncate">{item.nextAction} · {formatShortDate(item.nextActionAt)}</span></div> : null}</div></div></article>)}</div></section>; })}</div><p className="mt-4 text-sm text-slate-500">Glissez-déposez une carte pour modifier son statut. Les statuts de préparation sont regroupés dans « Nouveau ».</p></div>;
}
