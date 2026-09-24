'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { equivalentPath } from '@/lib/i18n';
import { STORE_TRACKING_KEYS } from '@/lib/store/catalog';
import type { MouseEvent } from 'react';
import { readStoreAttribution } from '@/lib/store/attribution';
export default function LanguageSwitcher() {
  const path = usePathname();
  const params = useSearchParams();
  const en = path === '/en' || path.startsWith('/en/');
  function follow(event: MouseEvent<HTMLAnchorElement>) {
    const target = new URL(event.currentTarget.href);
    const tracking = readStoreAttribution();
    for (const key of STORE_TRACKING_KEYS) {
      const value = tracking[key];
      if (value) target.searchParams.set(key, value);
    }
    event.currentTarget.href = target.toString();
  }
  function href(market: 'fr' | 'en') {
    const query = new URLSearchParams();
    const keys: string[] = [...STORE_TRACKING_KEYS];
    if (path.endsWith('/checkout')) keys.push('product');
    if (path === '/outils/acces' || path === '/en/tools/access') keys.push('token');
    for (const key of keys) { const value = params.get(key); if (value) query.set(key, value); }
    return equivalentPath(path, market) + (query.size ? `?${query}` : '');
  }
  return <nav aria-label={en ? 'Language' : 'Langue'} className="fixed right-4 bottom-24 z-[60] flex gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm md:bottom-5">
    <a href={href('fr')} onClick={follow} onAuxClick={follow} lang="fr" hrefLang="fr" aria-current={!en ? 'page' : undefined} className={!en ? 'text-[#0683C9]' : ''}>FR</a>
    <span aria-hidden="true">|</span>
    <a href={href('en')} onClick={follow} onAuxClick={follow} lang="en" hrefLang="en" aria-current={en ? 'page' : undefined} className={en ? 'text-[#0683C9]' : ''}>EN</a>
  </nav>;
}
