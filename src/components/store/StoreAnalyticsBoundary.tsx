'use client';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
export default function StoreAnalyticsBoundary({ children }: { children: ReactNode }) {
  const path = usePathname();
  // Bearer access links and download links must never reach session recording or pixels.
  if (path === '/outils/acces' || path === '/en/tools/access') return null;
  return children;
}
