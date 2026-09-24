'use client';

import type { MouseEvent, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  STORE_TRACKING_KEYS,
  type StoreProductId,
} from '@/lib/store/catalog';
import { trackStoreProductClick } from '@/lib/store/analytics';
import { readStoreAttribution } from '@/lib/store/attribution';

export default function StoreCTA({
  href,
  productId,
  children,
  className = '',
  arrow = true,
}: {
  href: string;
  productId: StoreProductId;
  children: ReactNode;
  className?: string;
  arrow?: boolean;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const target = new URL(href, window.location.origin);
    const tracking = readStoreAttribution();
    for (const key of STORE_TRACKING_KEYS) {
      if (tracking[key]) target.searchParams.set(key, tracking[key]);
    }
    event.currentTarget.href = target.toString();
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    trackStoreProductClick(productId, href.startsWith('/en/') ? 'en' : 'fr');

    window.location.assign(`${target.pathname}${target.search}${target.hash}`);
  }

  return (
    <a href={href} onClick={handleClick} onAuxClick={handleClick} className={className}>
      <span>{children}</span>
      {arrow && <ArrowRight className="h-4 w-4 shrink-0" />}
    </a>
  );
}
