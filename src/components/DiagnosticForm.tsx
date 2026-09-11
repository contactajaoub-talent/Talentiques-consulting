'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, ChevronDown, CheckCircle2, FileText, Briefcase, GraduationCap, User, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiagnosticFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DiagnosticForm = ({ isOpen, onClose }: DiagnosticFormProps) => {
    const [step, setStep] = useState(1); // For multi-step feel or just single (keeping single for now based on request)
    const [fileName, setFileName] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        goal: '',
        status: '',
        message: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStatusSelect = (status: string) => {
        setFormData(prev => ({ ...prev, status }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setIsSuccess(true);
    };

    const statusOptions = [
        { id: 'student', label: 'Étudiant', icon: GraduationCap },
        { id: 'job', label: 'En Poste', icon: Briefcase },
        { id: 'alternance', label: 'Alternance', icon: FileText },
        { id: 'freelance', label: 'Freelance', icon: Laptop },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
                    >
                        {/* Decorative Top Bar */}
                        <div className="h-2 w-full bg-gradient-to-r from-brand-500 via-blue-500 to-brand-500" />

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            {!isSuccess ? (
                                <>
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2 font-heading">
                                            Diagnostic <span className="text-brand-600">Offert</span>
                                        </h2>
                                        <p className="text-slate-500">
                                            Remplissez ce formulaire pour recevoir une analyse personnalisée de votre profil.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">

                                        {/* Row 1: Name & Email */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 ml-1">Nom Complet</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="name"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
                                                <input
                                                    required
                                                    type="email"
                                                    name="email"
                                                    placeholder="john@example.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Row 2: Phone & Goal */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 ml-1">Téléphone <span className="text-slate-400 font-normal">(Optionnel)</span></label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="+33 6 12 34 56 78"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-slate-700 ml-1">Objectif Pro</label>
                                                <input
                                                    required
                                                    type="text"
                                                    name="goal"
                                                    placeholder="Poste / Secteur / Pays"
                                                    value={formData.goal}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>

                                        {/* Status Selection */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 ml-1">Votre Statut Actuel</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {statusOptions.map((option) => {
                                                    const Icon = option.icon;
                                                    const isSelected = formData.status === option.id;
                                                    return (
                                                        <div
                                                            key={option.id}
                                                            onClick={() => handleStatusSelect(option.id)}
                                                            className={cn(
                                                                "cursor-pointer flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                                                                isSelected
                                                                    ? "border-brand-500 bg-brand-50 text-brand-700"
                                                                    : "border-slate-100 bg-white text-slate-500 hover:border-brand-200 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <Icon size={20} className={isSelected ? "text-brand-600" : "text-slate-400"} />
                                                            <span className="text-xs font-semibold">{option.label}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* File Upload */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700 ml-1">Votre CV (PDF/Word)</label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className={cn(
                                                    "cursor-pointer group relative w-full h-24 rounded-xl border-2 border-dashed flex items-center justify-center transition-all bg-slate-50 hover:bg-brand-50/50",
                                                    fileName ? "border-brand-500 bg-brand-50/30" : "border-slate-300 hover:border-brand-400"
                                                )}
                                            >
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx"
                                                    className="hidden"
                                                />
                                                <div className="flex items-center gap-3 text-slate-500 group-hover:text-brand-600 transition-colors">
                                                    {fileName ? (
                                                        <>
                                                            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
                                                                <FileText size={20} />
                                                            </div>
                                                            <span className="font-medium text-slate-700 truncate max-w-[200px]">{fileName}</span>
                                                            <span className="text-xs bg-brand-200 text-brand-800 px-2 py-0.5 rounded-md ml-2">Modifié</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="p-2 bg-slate-200 group-hover:bg-brand-100 text-slate-500 group-hover:text-brand-600 rounded-lg transition-colors">
                                                                <Upload size={20} />
                                                            </div>
                                                            <span className="font-medium">Cliquez pour importer votre CV</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700 ml-1">Message Complémentaire</label>
                                            <textarea
                                                name="message"
                                                rows={3}
                                                placeholder="Détails supplémentaires sur votre situation..."
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400 resize-none"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-blue-600 text-white font-bold text-lg shadow-lg shadow-brand-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Envoyer ma demande
                                                    <Check size={20} />
                                                </>
                                            )}
                                        </button>

                                    </form>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                >
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Demande Envoyée !</h3>
                                    <p className="text-slate-500 max-w-sm mb-8">
                                        Nous avons bien reçu vos informations. Notre équipe va analyser votre profil et reviendra vers vous sous 24h.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-8 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Fermer la fenêtre
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
