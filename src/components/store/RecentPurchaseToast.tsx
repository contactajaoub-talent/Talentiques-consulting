'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { StoreMarket } from '@/lib/store/catalog';

type Purchase = { buyer: string; productName: string };

export default function RecentPurchaseToast({
  hasMobileStickyCta = false,
  market = 'fr',
}: {
  hasMobileStickyCta?: boolean;
  market?: StoreMarket;
}) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/store/recent-purchases?market=${market}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : { purchases: [] }))
      .then((payload) => {
        if (Array.isArray(payload.purchases)) setPurchases(payload.purchases);
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Recent purchases unavailable', error);
        }
      });
    return () => controller.abort();
  }, [market]);

  useEffect(() => {
    if (!purchases.length) return;
    let hideTimer: ReturnType<typeof setTimeout>;
    let currentIndex = 0;
    const show = () => {
      setVisibleIndex(currentIndex);
      currentIndex = (currentIndex + 1) % purchases.length;
      hideTimer = setTimeout(() => setVisibleIndex(null), 4500);
    };
    const firstTimer = setTimeout(show, 9000);
    const rotationTimer = setInterval(show, 20000);
    return () => {
      clearTimeout(firstTimer);
      clearTimeout(hideTimer);
      clearInterval(rotationTimer);
    };
  }, [purchases]);

  const purchase = visibleIndex === null ? null : purchases[visibleIndex];

  return (
    <AnimatePresence>
      {purchase ? (
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          aria-live="polite"
          className={`fixed inset-x-3 z-40 rounded-2xl border border-sky-400/30 bg-[#03122e]/95 p-4 text-white shadow-[0_18px_55px_rgba(14,165,233,.25)] backdrop-blur-xl md:inset-x-auto md:bottom-5 md:left-5 md:w-[340px] ${
            hasMobileStickyCta ? 'bottom-24' : 'bottom-4'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sky-500 text-white">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-300">{purchase.buyer} {market === 'fr' ? 'vient d’acheter' : 'just purchased'}</p>
              <p className="mt-0.5 truncate text-sm font-black">{purchase.productName}</p>
              <p className="mt-1 text-[11px] font-semibold text-sky-200">{market === 'fr' ? 'Accès immédiat • Paiement unique' : 'Instant access • One-time payment'}</p>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
