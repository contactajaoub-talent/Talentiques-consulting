'use client';

import { usePathname } from 'next/navigation';
import { Preloader } from '@/components/Preloader';

export function RouteAwarePreloader() {
  const pathname = usePathname();

  if (pathname === '/outils' || pathname.startsWith('/outils/')) {
    return null;
  }

  return <Preloader />;
}
