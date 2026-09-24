'use client';

import type { MouseEvent, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  STORE_TRACKING_KEYS,
  type StoreProductId,
} from '@/lib/store/catalog';
import { trackStoreProductClick } from '@/lib/store/analytics';

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

    trackStoreProductClick(productId);

    const target = new URL(href, window.location.origin);
    const current = new URLSearchParams(window.location.search);

    for (const key of STORE_TRACKING_KEYS) {
      const valueFromQuery = current.get(key);
      if (valueFromQuery) target.searchParams.set(key, valueFromQuery);
    }

    window.location.assign(`${target.pathname}${target.search}${target.hash}`);
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      <span>{children}</span>
      {arrow && <ArrowRight className="h-4 w-4 shrink-0" />}
    </a>
  );
}
