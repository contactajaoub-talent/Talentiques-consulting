'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { rememberStoreAttribution } from '@/lib/store/attribution';
export default function StoreAttribution() {
  const pathname = usePathname();
  const params = useSearchParams();
  useEffect(() => { rememberStoreAttribution(); }, [pathname, params]);
  return null;
}
