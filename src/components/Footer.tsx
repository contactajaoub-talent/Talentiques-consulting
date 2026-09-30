'use client';

import Link from 'next/link';
import { Instagram, Linkedin } from 'lucide-react';
import type { HomeLocale } from '@/lib/home-content';

export function Footer({ locale = 'fr' }: { locale?: HomeLocale }) {
  const fr = locale === 'fr';
  return <footer className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-slate-900 to-brand-950 pb-12 pt-24 text-white">
    <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-[120px]"/>
    <div className="container relative z-10 mx-auto px-4 md:px-6">
      <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-4">
        <div><Link href={fr ? '/' : '/en'} className="mb-6 block bg-gradient-to-r from-white to-brand-200 bg-clip-text font-heading text-3xl font-bold text-transparent">TalentiQues</Link><p className="mb-8 max-w-xs text-sm font-light leading-relaxed text-slate-400">{fr ? 'Outils, ressources et services pour accéder à de meilleures opportunités professionnelles.' : 'Tools, resources and services to access better professional opportunities.'}</p><div className="flex gap-4"><a href="https://www.linkedin.com/company/talentiques/" target="_blank" rel="noopener noreferrer" aria-label="Talentiques sur LinkedIn" className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-brand-600 hover:text-white"><Linkedin size={18}/></a><a href="https://www.instagram.com/talentiques/" target="_blank" rel="noopener noreferrer" aria-label="Talentiques sur Instagram" className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-brand-600 hover:text-white"><Instagram size={18}/></a></div></div>
        <div><h3 className="mb-6 font-heading font-bold text-white">Talentiques</h3><ul className="space-y-4 text-sm text-slate-400"><li><Link href={fr ? '/outils' : '/en/tools'} className="hover:text-white">{fr ? 'Outils' : 'Tools'}</Link></li><li><Link href={fr ? '/services' : '/en/services'} className="hover:text-white">Services</Link></li><li><a href="https://alternance.talentiques.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Alternance</a></li><li><Link href="/blog" className="hover:text-white">Blog</Link></li></ul></div>
        <div><h3 className="mb-6 font-heading font-bold text-white">{fr ? 'Entreprise' : 'Company'}</h3><ul className="space-y-4 text-sm text-slate-400"><li><Link href="/diagnostic-cv-ats" className="hover:text-white">{fr ? 'Diagnostic CV ATS' : 'ATS Resume Diagnostic'}</Link></li><li><Link href="/careers" className="hover:text-white">{fr ? 'Carrières' : 'Careers'}</Link></li><li><Link href={fr ? '/#contact' : '/en#contact'} className="hover:text-white">Contact</Link></li><li><Link href={fr ? '/en' : '/'} className="hover:text-white">{fr ? 'English' : 'Français'}</Link></li></ul></div>
        <div><h3 className="mb-6 font-heading font-bold text-white">{fr ? 'Légal' : 'Legal'}</h3><ul className="space-y-4 text-sm text-slate-400"><li><Link href="/politique-de-confidentialite" className="hover:text-white">{fr ? 'Confidentialité' : 'Privacy'}</Link></li><li><Link href="/conditions-generales" className="hover:text-white">{fr ? 'Conditions générales' : 'Terms and conditions'}</Link></li><li><Link href="/mentions-legales" className="hover:text-white">{fr ? 'Mentions légales' : 'Legal notice'}</Link></li></ul></div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm font-light text-slate-500 md:flex-row"><span>© 2024 TalentiQues. {fr ? 'Tous droits réservés.' : 'All rights reserved.'}</span><div className="flex gap-8"><Link href="/politique-de-confidentialite" className="hover:text-brand-300">{fr ? 'Confidentialité' : 'Privacy'}</Link><Link href="/conditions-generales" className="hover:text-brand-300">{fr ? 'Conditions générales' : 'Terms'}</Link></div></div>
    </div>
  </footer>;
}
