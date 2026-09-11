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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Diagnostic CV ATS', href: '/diagnostic-cv-ats' },
    { name: 'Ressources', href: '/ressources' },
    { name: 'Services', href: '/#services' },
    { name: 'Accompagnement', href: '/accompagnement' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <>
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b',
        scrolled && !mobileMenuOpen ? 'bg-white/90 backdrop-blur-xl border-slate-200/70 shadow-sm py-4' : 'bg-white/75 backdrop-blur-md border-transparent py-5'
      )}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-heading tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-blue-600 relative z-50">
            {content.businessName}
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
                {link.name}
              </Link>
            ))}
            <Link href="/#services" className="px-5 py-2.5 rounded-full bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 hover:shadow-lg transition-all flex items-center gap-2">
              Choisir mon offre <ArrowRight size={16} />
            </Link>
          </div>

          <button className="lg:hidden p-2 text-slate-800 relative z-50" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 top-0 bg-white z-40 flex flex-col items-center justify-center pt-20">
              <div className="flex flex-col items-center gap-7">
                {navLinks.map((link, i) => (
                  <motion.div key={link.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link href={link.href} className="text-2xl font-bold text-slate-900 hover:text-brand-600" onClick={() => setMobileMenuOpen(false)}>{link.name}</Link>
                  </motion.div>
                ))}
                <Link href="/#services" onClick={() => setMobileMenuOpen(false)} className="px-8 py-3 rounded-full bg-brand-600 text-white text-lg font-bold flex items-center gap-2">
                  Choisir mon offre <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};
