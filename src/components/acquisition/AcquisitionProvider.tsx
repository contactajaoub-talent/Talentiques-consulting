'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AcquisitionState, Activity, AutomationSettings, Campaign, MarketRecord, MessageTemplate, Prospect, ProspectStatus } from '@/lib/acquisition/types';
import type { DuplicateMatch } from '@/lib/acquisition/dedupe';

type ImportReport = { imported: number; duplicates: number; skipped: number; errors: Array<{ row: number; message: string }> };
type AcquisitionContextValue = AcquisitionState & {
  hydrated: true;
  saving: boolean;
  error: string;
  clearError: () => void;
  refresh: () => Promise<void>;
  addProspect: (prospect: Prospect, options?: { force?: boolean; mergeId?: string }) => Promise<{ duplicate?: DuplicateMatch[]; id?: string; merged?: boolean }>;
  updateProspect: (id: string, patch: Partial<Prospect>, activity?: Omit<Activity, 'id' | 'occurredAt'>) => Promise<boolean>;
  archiveProspect: (id: string) => Promise<boolean>;
  completeTask: (id: string) => Promise<boolean>;
  addNote: (id: string, note: string) => Promise<boolean>;
  saveTemplate: (template: MessageTemplate) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
  saveCampaign: (campaign: Campaign) => Promise<boolean>;
  saveMarket: (market: MarketRecord) => Promise<boolean>;
  saveSettings: (settings: AutomationSettings) => Promise<boolean>;
  importCsv: (rows: Array<Record<string, string>>, forceDuplicates?: boolean) => Promise<ImportReport>;
};

const AcquisitionContext = createContext<AcquisitionContextValue | null>(null);

async function api<T>(payload?: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/acquisition', payload ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) } : { cache: 'no-store' });
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error || 'Opération impossible.');
  return result;
}

export function AcquisitionProvider({ initialState, children }: { initialState: AcquisitionState; children: React.ReactNode }) {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState('');
  const run = useCallback(async <T,>(operation: () => Promise<T>) => { setPending((value) => value + 1); setError(''); try { return await operation(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Opération impossible.'); throw caught; } finally { setPending((value) => value - 1); } }, []);
  const refresh = useCallback(() => run(async () => { setState(await api<AcquisitionState>()); }), [run]);
  const addProspect = useCallback((prospect: Prospect, options: { force?: boolean; mergeId?: string } = {}) => run(async () => { const result = await api<{ duplicate?: DuplicateMatch[]; id?: string; merged?: boolean }>({ action: 'create_prospect', prospect, ...options }); if (!result.duplicate) await refresh(); return result; }), [refresh, run]);
  const updateProspect = useCallback((id: string, patch: Partial<Prospect>, event?: Omit<Activity, 'id' | 'occurredAt'>) => run(async () => {
    const previous = state;
    const optimisticEvent = event ? { ...event, id: crypto.randomUUID(), occurredAt: new Date().toISOString() } : null;
    setState((current) => ({ ...current, prospects: current.prospects.map((item) => item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString(), activities: optimisticEvent ? [optimisticEvent, ...item.activities] : item.activities } : item) }));
    try { await api({ action: 'update_prospect', id, patch, event }); return true; } catch { setState(previous); return false; }
  }), [run, state]);
  const archiveProspect = useCallback((id: string) => run(async () => { await api({ action: 'archive_prospect', id }); setState((current) => ({ ...current, prospects: current.prospects.filter((item) => item.id !== id) })); return true; }), [run]);
  const completeTask = useCallback((id: string) => run(async () => { await api({ action: 'complete_task', id }); await refresh(); return true; }), [refresh, run]);
  const addNote = useCallback((id: string, note: string) => updateProspect(id, { notes: note }, { type: 'note', label: 'Note ajoutée', detail: note }), [updateProspect]);
  const saveTemplate = useCallback((template: MessageTemplate) => run(async () => { await api({ action: 'save_template', template }); await refresh(); return true; }), [refresh, run]);
  const deleteTemplate = useCallback((id: string) => run(async () => { await api({ action: 'delete_template', id }); setState((current) => ({ ...current, templates: current.templates.filter((item) => item.id !== id) })); return true; }), [run]);
  const saveCampaign = useCallback((campaign: Campaign) => run(async () => { await api({ action: 'save_campaign', campaign }); await refresh(); return true; }), [refresh, run]);
  const saveMarket = useCallback((market: MarketRecord) => run(async () => { await api({ action: 'save_market', market }); await refresh(); return true; }), [refresh, run]);
  const saveSettings = useCallback((settings: AutomationSettings) => run(async () => { await api({ action: 'save_settings', settings }); await refresh(); return true; }), [refresh, run]);
  const importCsv = useCallback((rows: Array<Record<string, string>>, forceDuplicates = false) => run(async () => { const report = await api<ImportReport>({ action: 'import_csv', rows, forceDuplicates }); await refresh(); return report; }), [refresh, run]);
  const value = useMemo(() => ({ ...state, hydrated: true as const, saving: pending > 0, error, clearError: () => setError(''), refresh, addProspect, updateProspect, archiveProspect, completeTask, addNote, saveTemplate, deleteTemplate, saveCampaign, saveMarket, saveSettings, importCsv }), [state, pending, error, refresh, addProspect, updateProspect, archiveProspect, completeTask, addNote, saveTemplate, deleteTemplate, saveCampaign, saveMarket, saveSettings, importCsv]);
  return <AcquisitionContext.Provider value={value}>{children}</AcquisitionContext.Provider>;
}

export function useAcquisition() { const value = useContext(AcquisitionContext); if (!value) throw new Error('useAcquisition must be used inside AcquisitionProvider'); return value; }
export function useProspect(id: string) { const store = useAcquisition(); return { ...store, prospect: store.prospects.find((item) => item.id === id) }; }
export function recordStatusChange(status: ProspectStatus) { return { type: 'status' as const, label: 'Statut modifié', detail: `Nouveau statut : ${status}` }; }
