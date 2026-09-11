'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { content } from '@/lib/content';

export const WhyUs = () => {
    return (
        <section id="why-us" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 max-w-3xl mx-auto"
                >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 font-heading">L’approche TalentiQues</h2>
                    <p className="text-lg text-slate-600">
                        Une démarche centrée sur la clarté, la cohérence et l’utilité concrète de chaque livrable.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {content.promises.map((promise, index) => {
                        const Icon = promise.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-brand-200 hover:shadow-xl hover:-translate-y-1 transition-all group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-brand-600 mb-6 shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-colors duration-300">
                                    <Icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-700 transition-colors">
                                    {promise.title}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {promise.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
