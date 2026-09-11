'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { content } from '@/lib/content';

export const Features = () => {
    return (
        <section id="targets" className="py-24 bg-slate-50 relative">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold mb-6 text-slate-900 font-heading"
                    >
                        Pour qui est <span className="text-brand-600">TalentiQues</span> ?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 max-w-2xl mx-auto"
                    >
                        Nos solutions sont adaptées à chaque étape de votre parcours professionnel.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {content.targets.map((target, index) => {
                        const Icon = target.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 border border-slate-100 group text-center"
                            >
                                <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors mb-4">
                                    <Icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{target.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    {target.objective}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
