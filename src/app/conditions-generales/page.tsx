'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { content } from '@/lib/content';
import { Scale, FileCheck, AlertTriangle, Copyright, CreditCard, Gavel, HelpCircle } from 'lucide-react';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />

            {/* Header with gradient */}
            <div className="bg-slate-900 pt-40 pb-20 px-4 md:px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider mb-6">
                        <Scale size={14} />
                        Juridique
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading tracking-tight">
                        Conditions Générales d'Utilisation
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Veuillez lire attentivement ces conditions régissant l'utilisation des services de {content.businessName}.
                    </p>
                </div>
            </div>

            <section className="px-4 md:px-6 -mt-10 pb-20 relative z-20">
                <div className="container mx-auto max-w-4xl bg-white rounded-3xl p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <p className="text-sm text-slate-400 mb-12 font-medium border-b border-slate-100 pb-8">
                        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <div className="space-y-16">
                        {/* Section 1 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:scale-110 transition-transform duration-300">
                                    <FileCheck size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">1. Objet</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <p className="text-slate-600 leading-relaxed text-lg font-light">
                                    Les présentes Conditions Générales ont pour objet de définir les modalités de mise à disposition des services du site <strong>{content.businessName}</strong> et les conditions d'utilisation du service par l'Utilisateur.
                                </p>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                                    <Scale size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">2. Services proposés</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <p className="text-slate-700 font-medium mb-3">{content.businessName} propose :</p>
                                    <ul className="space-y-3">
                                        {['Coaching professionnel', "Aide à la recherche d'emploi (CV, LinkedIn)", 'Formations et ateliers'].map((s, i) => (
                                            <li key={i} className="flex items-center gap-3 text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Section 3 & 4 */}
                        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                            <div className="group">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 font-heading">3. Obligations</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    L'Utilisateur s'engage à fournir des informations véridiques et à jour. Tout comportement illégal ou nuisible est interdit.
                                </p>
                            </div>

                            <div className="group">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        <Copyright size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 font-heading">4. Propriété</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Les contenus (textes, images, méthodologies) sont la propriété exclusive de {content.businessName}. Reproduction interdite.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform duration-300">
                                    <CreditCard size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">5. Paiement et Annulation</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    Le paiement des prestations s'effectue selon les modalités convenues (virement, paiement en ligne).
                                </p>
                                <div className="bg-red-50 text-red-800 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 inline-block">
                                    En cas d'annulation moins de 24 heures à l'avance, la séance est due.
                                </div>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform duration-300">
                                    <Gavel size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">6. Limitation de responsabilité</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <p className="text-slate-600 leading-relaxed italic border-l-4 border-slate-200 pl-4">
                                    "{content.businessName} s'engage à une obligation de moyens. Cependant, le succès d'une recherche d'emploi dépend de facteurs extérieurs. Nous ne garantissons pas de résultat spécifique."
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <HelpCircle size={20} className="text-brand-400" />
                                    Des questions ?
                                </h3>
                                <p className="text-slate-400 text-sm">Contactez notre équipe pour toute clarification.</p>
                            </div>
                            <a
                                href={`mailto:${content.contact.email}`}
                                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-brand-500/20"
                            >
                                {content.contact.email}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
