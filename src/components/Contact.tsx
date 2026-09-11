'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, ArrowRight } from 'lucide-react';
import { content } from '@/lib/content';

export const Contact = () => {
    return (
        <section id="contact" className="py-24 bg-white relative overflow-hidden">
            {/* Ambient Background Lights - Subtle for Light Mode */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/50 rounded-full blur-[128px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[128px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                            Disponible pour vous
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                            Prêt à Propulser <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
                                Votre Carrière ?
                            </span>
                        </h2>
                        <p className="text-slate-600 mb-10 text-lg leading-relaxed max-w-lg">
                            Votre avenir commence par une simple discussion. Parlons de vos ambitions et construisons ensemble la stratégie de votre réussite.
                        </p>

                        <div className="space-y-6">
                            <a href={`mailto:${content.contact.email}`} className="flex items-center gap-5 group p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-primary-500/5">
                                    <Mail size={22} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium mb-1">Email</div>
                                    <div className="text-slate-900 font-semibold group-hover:text-primary-600 transition-colors">{content.contact.email}</div>
                                </div>
                            </a>

                            <div className="flex items-center gap-5 group p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-primary-500/5">
                                    <Phone size={22} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium mb-1">WhatsApp</div>
                                    <div className="text-slate-900 font-semibold group-hover:text-primary-600 transition-colors">{content.contact.phone}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 group p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-lg shadow-primary-500/5">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium mb-1">Localisation</div>
                                    <div className="text-slate-900 font-semibold group-hover:text-primary-600 transition-colors">{content.contact.address}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-blue-200 rounded-3xl blur-2xl opacity-30 -z-10 transform translate-y-4"></div>
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden">

                            <form className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600 font-medium ml-1">Prénom</label>
                                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all" placeholder="Jean" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-600 font-medium ml-1">Nom</label>
                                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all" placeholder="Dupont" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-600 font-medium ml-1">Email</label>
                                    <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all" placeholder="jean.dupont@exemple.com" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-600 font-medium ml-1">Message</label>
                                    <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none" placeholder="Parlez-nous de vos objectifs..." />
                                </div>

                                <button type="button" className="group w-full py-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="relative flex items-center gap-2">
                                        Envoyer ma demande <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>

                                <p className="text-center text-xs text-slate-500 mt-4">
                                    En envoyant ce formulaire, vous acceptez notre politique de confidentialité.
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
