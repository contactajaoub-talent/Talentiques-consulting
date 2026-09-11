'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { content } from '@/lib/content';

export const Process = () => {
    return (
        <section id="process" className="py-32 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24 max-w-3xl mx-auto"
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm mb-4 border border-blue-100">
                        Notre Méthodologie
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 font-heading">
                        Une méthode simple en 5 étapes
                    </h2>
                    <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">
                        Un processus clair pour comprendre votre profil, définir votre objectif, optimiser vos supports et vous donner des documents prêts à utiliser.
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Connecting Line (Desktop) - Blue River Gradient */}
                    <div className="hidden md:block absolute top-[3rem] left-0 w-full h-1.5 bg-gradient-to-r from-brand-100 via-brand-400 to-brand-100 rounded-full opacity-30" />

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-10 relative z-10">
                        {content.process.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-brand-900/5 flex items-center justify-center text-2xl font-bold relative z-10 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-brand-500/10 font-heading">
                                        <span className="bg-clip-text text-transparent bg-gradient-to-br from-brand-500 to-blue-700">
                                            {step.step}
                                        </span>
                                    </div>
                                    {/* Active Pulse Glow */}
                                    <div className="absolute inset-0 bg-brand-400 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4 font-heading">{step.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-light">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
