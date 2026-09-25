'use client';

import { STORE_TRACKING_KEYS, type StoreMarket } from '@/lib/store/catalog';

const ROUTES: Record<string, string> = {
  '/outils': '/en/tools',
  '/outils/opportunity-tracker': '/en/tools/opportunity-tracker',
  '/outils/cv-ats': '/en/tools/ats-resume',
  '/outils/bundle': '/en/tools/bundle',
  '/outils/checkout': '/en/tools/checkout',
  '/outils/acces': '/en/tools/access',
};

const REVERSE_ROUTES = Object.fromEntries(
  Object.entries(ROUTES).map(([fr, en]) => [en, fr])
);

export default function StoreLanguageSwitcher({ market }: { market: StoreMarket }) {
  function switchLanguage() {
    const current = new URL(window.location.href);
    const targetPath = market === 'fr' ? ROUTES[current.pathname] : REVERSE_ROUTES[current.pathname];
    if (!targetPath) return;

    const target = new URL(targetPath, current.origin);
    for (const key of [...STORE_TRACKING_KEYS, 'product', 'token'] as const) {
      const value = current.searchParams.get(key);
      if (value) target.searchParams.set(key, value);
    }
    window.location.assign(`${target.pathname}${target.search}`);
  }

  return (
    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400" aria-label="Language">
      <button type="button" onClick={market === 'fr' ? undefined : switchLanguage} className={market === 'fr' ? 'text-white' : 'transition hover:text-white'}>FR</button>
      <span aria-hidden="true">|</span>
      <button type="button" onClick={market === 'en' ? undefined : switchLanguage} className={market === 'en' ? 'text-white' : 'transition hover:text-white'}>EN</button>
    </div>
  );
}
