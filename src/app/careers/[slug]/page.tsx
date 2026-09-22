'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { JobApplicationModal } from '@/components/JobApplicationModal';
import { content } from '@/lib/content';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Wallet,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function JobDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const job = content.careers.jobs.find((j) => j.slug === slug);

  if (!job) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              Offre introuvable
            </h1>

            <p className="text-slate-500 mb-6">
              Cette opportunité n’est plus disponible ou n’existe pas.
            </p>

            <Link
              href="/careers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Voir les offres
            </Link>
          </div>
        </div>

        <Footer />
      </main>
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

      {/* HERO */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-32 pb-14">
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-brand-100/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 max-w-5xl relative z-10">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-8 text-sm font-bold"
          >
            <ArrowLeft size={16} />
            Retour aux offres
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg uppercase tracking-wide">
                  {job.department}
                </span>

                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wide">
                  Recrutement ouvert
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 font-heading tracking-tight mb-6">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Briefcase size={17} className="text-brand-600" />
                  {job.department}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={17} className="text-brand-600" />
                  {job.location}
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={17} className="text-brand-600" />
                  {job.type}
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              Postuler maintenant
            </motion.button>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="container mx-auto px-4 md:px-6 max-w-5xl py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_310px] gap-8 items-start">

          {/* MAIN COLUMN */}
          <div className="space-y-7">

            {/* DESCRIPTION */}
            <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 font-heading">
                  À propos du poste
                </h2>
              </div>

              <p className="text-slate-600 leading-8 text-[17px]">
                {job.description}
              </p>
            </div>

            {/* MISSIONS */}
            <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Target size={20} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 font-heading">
                  Vos missions
                </h2>
              </div>

              <ul className="space-y-4">
                {job.missions.map((mission, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-brand-600 flex-shrink-0 mt-0.5"
                    />

                    <span className="text-slate-600 leading-relaxed">
                      {mission}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* REQUIREMENTS */}
            <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Users size={20} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 font-heading">
                  Profil recherché
                </h2>
              </div>

              <ul className="space-y-4">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-green-500 flex-shrink-0 mt-0.5"
                    />

                    <span className="text-slate-600 leading-relaxed">
                      {requirement}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* REMUNERATION */}
            <div className="bg-white rounded-3xl p-7 md:p-9 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Wallet size={20} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 font-heading">
                  Rémunération
                </h2>
              </div>

              <div className="space-y-4">
                {job.remuneration.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <CheckCircle2
                      size={19}
                      className="text-brand-600 flex-shrink-0 mt-0.5"
                    />

                    <span className="text-slate-700 leading-relaxed font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* FINAL CTA */}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white">
              <span className="text-brand-300 font-bold text-xs uppercase tracking-widest">
                Rejoindre TalentiQues
              </span>

              <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-3 font-heading">
                Vous pensez correspondre à ce profil ?
              </h2>

              <p className="text-slate-300 leading-relaxed mb-7 max-w-2xl">
                Envoyez votre candidature. Nous étudierons votre profil,
                votre expérience ainsi que votre approche commerciale avant
                de vous contacter pour la prochaine étape.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-500 transition-colors"
              >
                Envoyer ma candidature
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-28">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg mb-5">
                Informations clés
              </h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <Briefcase
                    size={18}
                    className="text-brand-600 mt-0.5 flex-shrink-0"
                  />

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">
                      Département
                    </p>

                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {job.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="text-brand-600 mt-0.5 flex-shrink-0"
                  />

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">
                      Localisation
                    </p>

                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {job.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock
                    size={18}
                    className="text-brand-600 mt-0.5 flex-shrink-0"
                  />

                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-bold">
                      Modalité
                    </p>

                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      {job.type}
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 my-6" />

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors"
              >
                Postuler
                <ChevronRight size={16} />
              </button>

              <p className="text-xs text-slate-400 text-center leading-relaxed mt-4">
                La candidature prend seulement quelques minutes.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
