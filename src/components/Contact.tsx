'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { content } from '@/lib/content';

export const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        setLoading(true);
        setError('');
        try {
            const data = new FormData(event.currentTarget);
            data.set('typeDemande', 'Contact');
            data.set('offreRessource', 'Contact général');
            data.set('statutPaiement', 'Non applicable');
            data.set('pageOrigine', window.location.pathname || '/');
            const params = new URLSearchParams(window.location.search);
            data.set('utmSource', params.get('utm_source') || '');
            data.set('utmMedium', params.get('utm_medium') || '');
            data.set('utmCampaign', params.get('utm_campaign') || '');
            const response = await fetch('/api/salesforce-lead', { method: 'POST', body: data });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Impossible d’envoyer votre message.');
            setSuccess(true);
            formElement.reset();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/50 rounded-full blur-[128px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[128px] pointer-events-none" />
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-sm font-medium mb-6"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span></span>Disponible pour vous</div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">Prêt à Propulser <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">Votre Carrière ?</span></h2>
                        <p className="text-slate-600 mb-10 text-lg leading-relaxed max-w-lg">Votre avenir commence par une simple discussion. Parlons de vos ambitions et construisons ensemble la stratégie de votre réussite.</p>
                        <div className="space-y-6">
                            <a href={`mailto:${content.contact.email}`} className="flex items-center gap-5 group p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"><div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300"><Mail size={22}/></div><div><div className="text-sm text-slate-500 font-medium mb-1">Email</div><div className="text-slate-900 font-semibold">{content.contact.email}</div></div></a>
                            <div className="flex items-center gap-5 p-4"><div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600"><Phone size={22}/></div><div><div className="text-sm text-slate-500 font-medium mb-1">WhatsApp</div><div className="text-slate-900 font-semibold">{content.contact.phone}</div></div></div>
                            <div className="flex items-center gap-5 p-4"><div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600"><MapPin size={22}/></div><div><div className="text-sm text-slate-500 font-medium mb-1">Marchés</div><div className="text-slate-900 font-semibold">{content.contact.address}</div></div></div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-blue-200 rounded-3xl blur-2xl opacity-30 -z-10 transform translate-y-4"></div>
                        <div className="bg-white/80 backdrop-blur-xl border border-slate-100 p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden">
                            {success ? (
                                <div className="py-12 text-center"><div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-5"><CheckCircle2 size={32}/></div><h3 className="text-2xl font-bold text-slate-900">Message envoyé</h3><p className="text-slate-600 mt-2">Votre demande a bien été enregistrée. Nous revenons vers vous rapidement.</p></div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <Field label="Prénom"><input required name="firstName" type="text" className="input" placeholder="Jean" /></Field>
                                        <Field label="Nom"><input required name="lastName" type="text" className="input" placeholder="Dupont" /></Field>
                                    </div>
                                    <Field label="Email"><input required name="email" type="email" className="input" placeholder="jean.dupont@exemple.com" /></Field>
                                    <Field label="Téléphone"><input name="phone" type="tel" className="input" placeholder="+33 6 12 34 56 78" /></Field>
                                    <Field label="Message"><textarea required name="informationsComplementaires" rows={4} className="input resize-none" placeholder="Parlez-nous de vos objectifs..." /></Field>
                                    <label className="flex items-start gap-3 text-xs text-slate-600"><input required name="privacy" value="1" type="checkbox" className="mt-0.5"/><span>J’accepte que Talentiques traite mes informations afin de répondre à ma demande. *</span></label>
                                    {error && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
                                    <button disabled={loading} type="submit" className="group w-full py-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"><span className="relative flex items-center gap-2">{loading ? 'Envoi en cours…' : <>Envoyer ma demande <ArrowRight size={18}/></>}</span></button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block space-y-2"><span className="text-sm text-slate-600 font-medium ml-1">{label}</span>{children}</label>;
