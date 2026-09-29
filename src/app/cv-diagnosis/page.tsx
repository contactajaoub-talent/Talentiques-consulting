'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, CheckCircle, AlertCircle, TrendingUp, Zap, Target, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';

export default function CVDiagnosisPage() {
    const [cvText, setCvText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadMethod, setUploadMethod] = useState<'paste' | 'file'>('paste');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setCvText(text);
        };
        reader.readAsText(file);
    };

    const handleAnalyze = async () => {
        if (!cvText || cvText.trim().length < 50) {
            setError('Veuillez fournir un CV d\'au moins 50 caractères.');
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setAnalysis(null);

        try {
            const response = await fetch('/api/analyze-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cvText }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'analyse');
            }

            setAnalysis(data.analysis);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
            <Navbar />
            <WhatsAppButton />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

                <div className="container mx-auto max-w-4xl relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-semibold mb-6">
                            <Sparkles size={16} />
                            Diagnostic CV ATS gratuit
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-700 via-brand-600 to-blue-600 font-heading">
                            Diagnostic CV ATS
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            Analysez la structure, la lisibilité et plusieurs éléments clés de votre CV. Obtenez immédiatement des recommandations pour identifier vos priorités d’amélioration.
                        </p>
                    </motion.div>

                    {/* Upload Method Toggle */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex justify-center gap-4 mb-8"
                    >
                        <button
                            onClick={() => setUploadMethod('paste')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${uploadMethod === 'paste'
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
                                }`}
                        >
                            <FileText className="inline mr-2" size={18} />
                            Coller le texte
                        </button>
                        <button
                            onClick={() => setUploadMethod('file')}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all ${uploadMethod === 'file'
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
                                }`}
                        >
                            <Upload className="inline mr-2" size={18} />
                            Importer un fichier
                        </button>
                    </motion.div>

                    {/* Input Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8"
                    >
                        {uploadMethod === 'paste' ? (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Collez le contenu de votre CV ici
                                </label>
                                <textarea
                                    value={cvText}
                                    onChange={(e) => setCvText(e.target.value)}
                                    placeholder="Copiez et collez le texte de votre CV ici..."
                                    className="w-full h-64 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none font-mono text-sm"
                                />
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-brand-400 transition-colors">
                                <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                                <label className="cursor-pointer">
                                    <span className="text-brand-600 font-semibold hover:text-brand-700">
                                        Cliquez pour importer
                                    </span>
                                    <span className="text-slate-600"> ou glissez-déposez</span>
                                    <input
                                        type="file"
                                        accept=".txt,.pdf,.doc,.docx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-sm text-slate-500 mt-2">TXT, PDF, DOC, DOCX (max 5MB)</p>
                                {cvText && (
                                    <p className="text-sm text-green-600 mt-4 font-semibold">
                                        ✓ Fichier chargé ({cvText.length} caractères)
                                    </p>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !cvText}
                            className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 group"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyse en cours...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Analyser mon CV
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-start gap-3"
                            >
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Analysis Results */}
                    <AnimatePresence>
                        {analysis && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="bg-gradient-to-br from-white to-brand-50/30 rounded-2xl shadow-2xl border border-brand-200 p-8 mb-8"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-brand-100 rounded-xl">
                                        <CheckCircle className="text-brand-600" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Votre diagnostic</h2>
                                        <p className="text-sm text-slate-600">Résultat immédiat • Indicateur Talentiques</p>
                                    </div>
                                </div>

                                <div className="prose prose-slate max-w-none">
                                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                        {analysis}
                                    </div>
                                </div>

                                {/* CTA Section */}
                                <div className="mt-8 pt-8 border-t border-slate-200">
                                    <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-6 text-white">
                                        <h3 className="text-xl font-bold mb-2">Besoin d'aide pour optimiser votre CV ?</h3>
                                        <p className="text-brand-100 mb-4">
                                            Notre équipe d'experts peut transformer votre CV en un outil puissant pour décrocher des entretiens.
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <a
                                                href="/#contact"
                                                className="px-6 py-3 bg-white text-brand-600 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
                                            >
                                                <Target size={18} />
                                                Obtenir un accompagnement
                                            </a>
                                            <a
                                                href="/#services"
                                                className="px-6 py-3 bg-brand-800 text-white rounded-lg font-semibold hover:bg-brand-900 transition-all inline-flex items-center gap-2"
                                            >
                                                <Zap size={18} />
                                                Voir nos services
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 bg-white">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
                        Pourquoi faire analyser votre CV ?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: TrendingUp,
                                title: 'Augmentez vos chances',
                                description: 'Un CV optimisé peut multiplier par 3 vos chances d\'obtenir un entretien.'
                            },
                            {
                                icon: Target,
                                title: 'Passez les ATS',
                                description: 'Vérifiez la lisibilité et la structure de votre CV pour réduire les problèmes d’interprétation par les outils de recrutement.'
                            },
                            {
                                icon: Sparkles,
                                title: 'Démarquez-vous',
                                description: 'Un CV professionnel vous distingue des centaines d\'autres candidats.'
                            }
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center p-6"
                            >
                                <div className="inline-flex p-4 bg-brand-100 rounded-2xl mb-4">
                                    <benefit.icon className="text-brand-600" size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{benefit.title}</h3>
                                <p className="text-slate-600">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
