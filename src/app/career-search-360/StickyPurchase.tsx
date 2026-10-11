'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Locale } from './content';
import s from './career-search.module.css';

export default function StickyPurchase({ locale }: { locale: Locale }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    const checkout = document.getElementById('checkout');
    const firstAccess = document.getElementById('premier-acces');
    if (!checkout || !firstAccess) return;
    let pastIntro = false;
    let checkoutVisible = false;
    const refresh = () => setHidden(!pastIntro || checkoutVisible || checkout.contains(document.activeElement));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === firstAccess) pastIntro = entry.isIntersecting || entry.boundingClientRect.top < 0;
        if (entry.target === checkout) checkoutVisible = entry.isIntersecting;
      }
      refresh();
    }, { threshold: 0 });
    observer.observe(firstAccess);
    observer.observe(checkout);
    document.addEventListener('focusin', refresh);
    return () => { observer.disconnect(); document.removeEventListener('focusin', refresh); };
  }, []);
  return <div className={`${s.mobileSticky} ${hidden ? s.stickyHidden : ''}`} aria-hidden={hidden} inert={hidden}>
    <a href="#offre" className={s.purchase}>{locale === 'fr' ? 'Accéder maintenant' : 'Get access now'}<ArrowRight size={18} aria-hidden="true" /></a>
  </div>;
}
