'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { content } from '@/lib/content';
import { Building2, Server, Globe, Mail } from 'lucide-react';

export default function LegalMentionsPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />

            {/* Header with gradient */}
            <div className="bg-slate-900 pt-40 pb-20 px-4 md:px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-600/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading tracking-tight">
                        Mentions Légales
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
                        Identification et informations légales de {content.businessName}.
                    </p>
                </div>
            </div>

            <section className="px-4 md:px-6 -mt-10 pb-20 relative z-20">
                <div className="container mx-auto max-w-4xl bg-white rounded-3xl p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100">

                    <div className="grid gap-12">
                        {/* Editeur */}
                        <div className="flex flex-col md:flex-row gap-8 items-start pb-12 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                                <Building2 size={32} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-heading">Éditeur du site</h2>
                                <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Dénomination</p>
                                        <p className="text-lg font-medium text-slate-800">{content.businessName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Directeur de publication</p>
                                        <p className="text-lg font-medium text-slate-800">Othmane Biz</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Email de contact</p>
                                        <a href={`mailto:${content.contact.email}`} className="text-lg font-medium text-brand-600 hover:underline">
                                            {content.contact.email}
                                        </a>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Téléphone</p>
                                        <p className="text-lg font-medium text-slate-800">{content.contact.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hebergeur */}
                        <div className="flex flex-col md:flex-row gap-8 items-start pb-12 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                                <Server size={32} />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-heading">Hébergement</h2>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <p className="font-bold text-slate-900 text-lg mb-2">Vercel Inc.</p>
                                    <p className="text-slate-600 leading-relaxed">
                                        340 S Lemon Ave #4133<br />
                                        Walnut, CA 91789<br />
                                        États-Unis
                                    </p>
                                    <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-600 font-bold text-sm mt-4 hover:underline">
                                        <Globe size={16} />
                                        www.vercel.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Propriete */}
                        <div className="text-center">
                            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl mx-auto">
                                © {new Date().getFullYear()} <strong>{content.businessName}</strong>. Tous droits réservés.<br />
                                La reproduction de tout ou partie de ce site sur quelque support que ce soit est formellement interdite sauf autorisation expresse du directeur de la publication.
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </main>
    );
}
