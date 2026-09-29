'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { content } from '@/lib/content';
import { Briefcase, MapPin, ArrowRight } from 'lucide-react';

export default function CareersPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <section className="pt-40 pb-20 px-4 md:px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-6 font-heading tracking-tight text-slate-900"
                    >
                        {content.careers.title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-slate-600 font-light"
                    >
                        {content.careers.subtitle}
                    </motion.p>
                </div>
            </section>

            {/* --- JOBS GRID --- */}
            <section className="container mx-auto px-4 md:px-6 pb-32 max-w-5xl">
                <div className="grid gap-6">
                    {content.careers.jobs.map((job, index) => (
                        <motion.div
                            key={job.slug}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5 transition-all duration-300 group flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg uppercase tracking-wide">
                                        {job.department}
                                    </span>
                                    <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg border border-slate-100 uppercase tracking-wide">
                                        {job.type}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors font-heading">
                                    {job.title}
                                </h3>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={16} />
                                        {job.location}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 md:mt-0">
                                <Link
                                    href={`/careers/${job.slug}`}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-all group-hover:shadow-lg group-hover:shadow-brand-500/20 w-full md:w-auto"
                                >
                                    Voir l'offre
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <Footer />
        </main>
    );
}
