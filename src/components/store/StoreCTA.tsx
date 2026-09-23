'use client';

import type { MouseEvent, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { STORE_TRACKING_KEYS } from '@/lib/store/catalog';

export default function StoreCTA({
  href,
  productId,
  productName,
  value,
  children,
  className = '',
  arrow = true,
}: {
  href: string;
  productId: 'tracker' | 'ats' | 'bundle';
  productName: string;
  value: number;
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

    window.fbq?.('trackCustom', 'StoreProductClick', {
      content_name: productName,
      content_ids: [productId],
      value,
      currency: 'EUR',
    });
    window.gtag?.('event', 'select_item', {
      item_list_name: 'Talentiques Store FR',
      items: [
        {
          item_id: productId,
          item_name: productName,
          price: value,
          quantity: 1,
        },
      ],
    });

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
