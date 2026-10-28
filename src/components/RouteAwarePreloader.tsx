'use client';

import { usePathname } from 'next/navigation';
import { Preloader } from '@/components/Preloader';

export function RouteAwarePreloader() {
  const pathname = usePathname();

  if (
    pathname === '/crm' ||
    pathname.startsWith('/crm/') ||
    pathname === '/paiement-service' ||
    pathname === '/completer-dossier' ||
    pathname === '/career-search-360' ||
    pathname === '/outils' ||
    pathname.startsWith('/outils/') ||
    pathname === '/en/tools' ||
    pathname.startsWith('/en/tools/')
  ) {
    return null;
  }

  return <Preloader />;
}
