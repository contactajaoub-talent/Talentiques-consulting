'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Instagram } from 'lucide-react';
import { content } from '@/lib/content';

export const Footer = () => {
    return (
        <footer className="bg-gradient-to-br from-brand-950 via-slate-900 to-brand-950 text-white pt-24 pb-12 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-brand-200 mb-6 block font-heading">
                            {content.businessName}
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs font-light">
                            CV ATS, LinkedIn, ressources et accompagnement carrière pour les marchés francophones.
                        </p>
                        <div className="flex gap-4">
                            <a href={content.contact.socials.linkedin} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-brand-600 hover:border-brand-500 transition-all duration-300">
                                <Linkedin size={18} />
                            </a>
                            <a href={content.contact.socials.instagram} className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-brand-600 hover:border-brand-500 transition-all duration-300">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 font-heading">Services</h4>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li><a href="#" className="hover:text-brand-300 hover:translate-x-1 inline-block transition-all">Optimisation CV & LinkedIn</a></li>
                            <li><a href="#" className="hover:text-brand-300 hover:translate-x-1 inline-block transition-all">Coaching & Simulation</a></li>
                            <li><a href="#" className="hover:text-brand-300 hover:translate-x-1 inline-block transition-all">Stratégie de Recherche</a></li>
                            <li><a href="#" className="hover:text-brand-300 hover:translate-x-1 inline-block transition-all">Accompagnement A-Z</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 font-heading">Entreprise</h4>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li><a href="#about" className="hover:text-brand-300 hover:translate-x-1 inline-block transition-all">À Propos</a></li>
                            <li><Link href="/cv-diagnosis" className="hover:text-white transition-colors">Diagnostic CV</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog & Ressources</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Carrières</Link></li>
                            <li><Link href="/#contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>


                    <div>
                        <h4 className="font-bold text-white mb-6 font-heading">Légal</h4>
                        <ul className="space-y-4 text-slate-400 text-sm">
                            <li><Link href="/politique-de-confidentialite" className="hover:text-brand-300 hover:translate-x-1 inline-block transition-all">Confidentialité</Link></li>
                            <li><Link href="/conditions-generales" className="hover:text-brand-300 hover:translate-x-1 inline-block transition-all">Conditions Générales</Link></li>
                            <li><Link href="/mentions-legales" className="hover:text-brand-300 hover:translate-x-1 inline-block transition-all">Mentions Légales</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-light">
                    <div>© {new Date().getFullYear()} {content.businessName}. Tous droits réservés.</div>
                    <div className="flex gap-8">
                        <Link href="/politique-de-confidentialite" className="hover:text-brand-300 transition-colors">Confidentialité</Link>
                        <Link href="/conditions-generales" className="hover:text-brand-300 transition-colors">Conditions générales</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
