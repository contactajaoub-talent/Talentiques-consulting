'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { JobApplicationModal } from '@/components/JobApplicationModal';
import { content } from '@/lib/content';
import { motion } from 'framer-motion';
import { MapPin, Clock, Briefcase, ArrowLeft, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const job = content.careers.jobs.find(j => j.slug === slug);

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p>Offre introuvable.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />

            <JobApplicationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                jobTitle={job.title}
            />

            {/* --- HEADER --- */}
            <div className="bg-white border-b border-slate-200 pt-32 pb-12 sticky top-0 z-30">
                <div className="container mx-auto px-4 md:px-6 max-w-4xl">
                    <Link href="/careers" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-6 text-sm font-bold">
                        <ArrowLeft size={16} />
                        Retour aux offres
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-heading">{job.title}</h1>
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-500 text-sm font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Briefcase size={16} className="text-brand-600" />
                                    {job.department}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={16} className="text-brand-600" />
                                    {job.location}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={16} className="text-brand-600" />
                                    {job.type}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-3.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-1 active:translate-y-0 whitespace-nowrap"
                        >
                            Postuler maintenant
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="container mx-auto px-4 md:px-6 max-w-4xl py-12">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">

                    {/* Description */}
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <span className="w-8 h-1 bg-brand-500 rounded-full" />
                            Description du poste
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed font-light">
                            {job.description}
                        </p>
                    </div>

                    {/* Requirements */}
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                            <span className="w-8 h-1 bg-brand-500 rounded-full" />
                            Profil recherché
                        </h2>
                        <ul className="space-y-4">
                            {job.requirements.map((req, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-slate-600 text-lg leading-relaxed">{req}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Bottom CTA */}
                    <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Ce poste vous correspond ?</h3>
                        <p className="text-slate-500 mb-6">Ne manquez pas cette opportunité de rejoindre TalentiQues.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors"
                        >
                            Envoyer ma candidature
                            <ChevronRight size={16} />
                        </button>
                    </div>

                </div>
            </div>

            <Footer />
        </main>
    );
}
