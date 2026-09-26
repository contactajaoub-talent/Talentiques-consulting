'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { STORE_TRACKING_KEYS } from '@/lib/store/catalog';

export default function StoreAffiliateAttribution() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(query);
    const ref = params.get('ref');
    if (!ref) return;

    const tracking = Object.fromEntries(
      STORE_TRACKING_KEYS.flatMap((key) => {
        const value = params.get(key);
        return value ? [[key, value]] : [];
      })
    );

    void fetch('/api/affiliate/attribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref, pathname, tracking }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname, query]);

  return null;
}

