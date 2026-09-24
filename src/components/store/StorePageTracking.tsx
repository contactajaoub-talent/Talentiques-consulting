'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  onStoreAnalyticsReady,
  trackStorePage,
} from '@/lib/store/analytics';

export default function StorePageTracking() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const track = () => {
      if (cancelled || lastTrackedPath.current === pathname) return;

      lastTrackedPath.current = pathname;
      trackStorePage(pathname);
    };

    const removeReadyListener = onStoreAnalyticsReady(track);

    return () => {
      cancelled = true;
      removeReadyListener?.();
    };
  }, [pathname]);

  return null;
}
