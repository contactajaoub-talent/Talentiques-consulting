'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { content } from '@/lib/content';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Diagnostic CV ATS', href: '/diagnostic-cv-ats' },
    { name: 'Ressources', href: '/ressources' },
    { name: 'Services', href: '/#services' },
    { name: 'Accompagnement', href: '/accompagnement' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/#contact' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300',
          scrolled
            ? 'border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl'
            : 'border-slate-200/40 bg-white/92 backdrop-blur-md'
        )}
      >
        <div className="mx-auto flex h-[82px] w-full max-w-[1460px] items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="relative z-[60] shrink-0 bg-gradient-to-r from-brand-700 to-blue-600 bg-clip-text font-heading text-[26px] font-bold tracking-tight text-transparent"
          >
            {content.businessName}
          </Link>

          <div className="ml-10 hidden min-w-0 flex-1 items-center justify-end min-[1120px]:flex">
            <div className="flex items-center gap-6 min-[1320px]:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="whitespace-nowrap text-[15px] font-semibold text-slate-600 transition-colors hover:text-brand-600"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <Link
              href="/#services"
              className="ml-7 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-brand-600 px-6 py-3 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-lg min-[1320px]:ml-9 min-[1320px]:px-7"
            >
              Choisir mon offre
              <ArrowRight size={17} />
            </Link>
          </div>

          <button
            type="button"
            className="relative z-[60] ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 min-[1120px]:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-white min-[1120px]:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-[112px]">
              <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                <div className="flex flex-col divide-y divide-slate-100 border-y border-slate-100">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.035 }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between py-4 text-[18px] font-semibold text-slate-900 transition-colors hover:text-brand-600"
                      >
                        {link.name}
                        <ArrowRight size={17} className="text-slate-400" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <Link
                  href="/#services"
                  onClick={closeMobileMenu}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-brand-500/15 transition hover:bg-brand-700"
                >
                  Choisir mon offre
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
