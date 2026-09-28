'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getHomeContent, type HomeLocale } from '@/lib/home-content';

export function Navbar({ locale = 'fr' }: { locale?: HomeLocale }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const copy = getHomeContent(locale);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const links = copy.nav.map(([name, href]) => ({ name, href }));
  return <>
    <nav className={cn('fixed inset-x-0 top-0 z-50 border-b transition-all duration-300', scrolled ? 'border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl' : 'border-slate-200/40 bg-white/92 backdrop-blur-md')} aria-label="Main navigation">
      <div className="mx-auto flex h-[82px] w-full max-w-[1460px] items-center justify-between px-6 lg:px-8">
        <Link href={copy.home} onClick={() => setOpen(false)} className="relative z-[60] shrink-0 bg-gradient-to-r from-brand-700 to-blue-600 bg-clip-text font-heading text-[26px] font-bold tracking-tight text-transparent">TalentiQues</Link>
        <div className="ml-10 hidden min-w-0 flex-1 items-center justify-end min-[1180px]:flex">
          <div className="flex items-center gap-6">{links.map(link => <Link key={link.name} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="whitespace-nowrap text-[15px] font-semibold text-slate-600 transition-colors hover:text-brand-600">{link.name}</Link>)}</div>
          <Link href={copy.switchHref} className="ml-6 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">{locale.toUpperCase()} | {copy.switchLabel}</Link>
          <Link href={locale === 'fr' ? '/#resources' : '/en#resources'} className="ml-5 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-brand-600 px-6 py-3 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-lg">{copy.resourcesCta}<ArrowRight size={17}/></Link>
        </div>
        <button type="button" onClick={() => setOpen(value => !value)} aria-label={open ? (locale === 'fr' ? 'Fermer le menu' : 'Close menu') : (locale === 'fr' ? 'Ouvrir le menu' : 'Open menu')} aria-expanded={open} className="relative z-[60] ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm min-[1180px]:hidden">{open ? <X size={23}/> : <Menu size={23}/>}</button>
      </div>
    </nav>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 overflow-y-auto bg-white px-6 pb-8 pt-[112px] min-[1180px]:hidden"><div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center"><div className="flex flex-col divide-y divide-slate-100 border-y border-slate-100">{links.map((link, index) => <motion.div key={link.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .03 }}><Link href={link.href} onClick={() => setOpen(false)} className="flex items-center justify-between py-4 text-[18px] font-semibold text-slate-900">{link.name}<ArrowRight size={17} className="text-slate-400"/></Link></motion.div>)}</div><div className="mt-7 flex gap-3"><Link href={copy.switchHref} className="rounded-full border border-slate-200 px-5 py-4 font-bold text-slate-700">{copy.switchLabel}</Link><Link href={locale === 'fr' ? '/#resources' : '/en#resources'} onClick={() => setOpen(false)} className="flex flex-1 items-center justify-center rounded-full bg-brand-600 px-5 py-4 text-center font-bold text-white">{copy.resourcesCta}</Link></div></div></motion.div>}</AnimatePresence>
  </>;
}
