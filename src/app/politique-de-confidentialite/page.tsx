'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { content } from '@/lib/content';
import { Shield, Lock, FileText, Eye, Database, Server, Share2, Cookie } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />

            {/* Header with gradient */}
            <div className="bg-slate-900 pt-40 pb-20 px-4 md:px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-brand-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Shield size={14} />
                        RGPD Compliant
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 font-heading tracking-tight">
                        Politique de Confidentialité
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                        Votre confiance est notre priorité. Découvrez comment nous protégeons et gérons vos données personnelles chez {content.businessName}.
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
                                    <FileText size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">1. Introduction</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <p className="text-slate-600 leading-relaxed text-lg font-light">
                                    Chez <strong>{content.businessName}</strong>, nous accordons une importance capitale à la confidentialité de vos données. Cette politique vise à vous informer de manière transparente sur la manière dont nous collectons, utilisons et protégeons vos informations personnelles lors de l'utilisation de notre site web et de nos services.
                                </p>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                    <Database size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">2. Données collectées</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <p className="text-slate-600 mb-6 leading-relaxed">Nous pouvons être amenés à collecter les données suivantes :</p>
                                <ul className="grid md:grid-cols-2 gap-4">
                                    {[
                                        { title: "Identité", desc: "Nom, prénom" },
                                        { title: "Coordonnées", desc: "Email, téléphone" },
                                        { title: "Professionnel", desc: "CV, LinkedIn, parcours" },
                                        { title: "Connexion", desc: "IP, navigateur (cookies)" }
                                    ].map((item, i) => (
                                        <li key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1 hover:border-brand-200 transition-colors">
                                            <span className="font-bold text-slate-900">{item.title}</span>
                                            <span className="text-slate-500 text-sm">{item.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-300">
                                    <Eye size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">3. Finalité du traitement</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <ul className="space-y-4">
                                    {[
                                        "Fournir nos services de coaching et d'accompagnement carrière.",
                                        "Gérer la relation client (contact, facturation, suivi).",
                                        "Améliorer votre expérience utilisateur sur notre site.",
                                        "Vous envoyer des informations pertinentes (newsletter) si vous y avez consenti."
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600 leading-relaxed">
                                            <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5 text-xs font-bold">
                                                {i + 1}
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Section 4 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform duration-300">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">4. Protection des données</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <p className="text-slate-600 leading-relaxed text-lg font-light bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre l'accès non autorisé, la modification, la divulgation ou la destruction. Vos données sont hébergées sur des serveurs sécurisés.
                                </p>
                            </div>
                        </div>

                        {/* Section 5 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform duration-300">
                                    <Share2 size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">5. Partage des données</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <p className="text-slate-600 mb-4 leading-relaxed">
                                    Vos données personnelles ne sont <strong className="text-brand-600">jamais vendues</strong> à des tiers. Elles peuvent être partagées uniquement avec :
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        <span>Nos prestataires techniques (hébergement, outils d'emailing) soumis à confidentialité.</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        <span>Les autorités légales si la loi l'exige.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Section 6 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform duration-300">
                                    <Shield size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">6. Vos droits (RGPD)</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    {["Accès et rectification", "Droit à l'oubli", "Limitation du traitement", "Droit d'opposition"].map((right, i) => (
                                        <div key={i} className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium text-center hover:border-brand-300 transition-colors cursor-default">
                                            {right}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-slate-600">
                                    Pour exercer ces droits, contactez-nous à : <a href={`mailto:${content.contact.email}`} className="text-brand-600 font-bold hover:underline">{content.contact.email}</a>.
                                </p>
                            </div>
                        </div>

                        {/* Section 7 */}
                        <div className="group">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                                    <Cookie size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 font-heading">7. Cookies</h2>
                            </div>
                            <div className="pl-0 md:pl-16">
                                <p className="text-slate-600 leading-relaxed">
                                    Ce site utilise des cookies pour améliorer votre navigation. Vous pouvez configurer votre navigateur pour refuser les cookies, mais cela pourrait limiter certaines fonctionnalités du site.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
