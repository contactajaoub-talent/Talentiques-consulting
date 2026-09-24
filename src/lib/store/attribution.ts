import { STORE_TRACKING_KEYS, type StoreTracking } from './catalog';
const storageKey = 'talentiques-store-attribution-v1';

export function readStoreAttribution(): StoreTracking {
  if (typeof window === 'undefined') return {};
  let saved: Record<string, unknown> = {};
  try { saved = JSON.parse(window.sessionStorage.getItem(storageKey) || '{}'); } catch { /* Storage is optional. */ }
  const query = new URLSearchParams(window.location.search);
  const tracking: StoreTracking = {};
  for (const key of STORE_TRACKING_KEYS) {
    const value = query.get(key) || saved?.[key];
    if (typeof value === 'string' && value) tracking[key] = value.slice(0, 500);
  }
  return tracking;
}

export function rememberStoreAttribution() {
  const tracking = readStoreAttribution();
  try { window.sessionStorage.setItem(storageKey, JSON.stringify(tracking)); } catch { /* Direct query attribution still works. */ }
}
