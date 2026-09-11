'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle, Send, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobTitle: string;
}

export const JobApplicationModal = ({ isOpen, onClose, jobTitle }: JobApplicationModalProps) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        message: ''
    });
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setStep(2); // Loading
        setTimeout(() => {
            setStep(3); // Success
        }, 1500);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative z-[70] bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 font-heading">Postuler</h3>
                                <p className="text-sm text-slate-500 font-medium">{jobTitle}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            {step === 1 && (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700">Nom complet</label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                                                placeholder="Jean Dupont"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-slate-700">Téléphone</label>
                                            <input
                                                required
                                                type="tel"
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                                                placeholder="06 12 34 56 78"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700">Email</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                                            placeholder="jean@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700">Profil LinkedIn</label>
                                        <input
                                            type="url"
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
                                            placeholder="linkedin.com/in/jean-dupont"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700">CV (PDF)</label>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={handleFileChange}
                                            />
                                            <div className={cn(
                                                "w-full px-4 py-4 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-brand-400 group-hover:bg-brand-50/50 transition-all flex items-center justify-center gap-3",
                                                file && "border-brand-500 bg-brand-50"
                                            )}>
                                                {file ? (
                                                    <>
                                                        <FileText className="text-brand-600" size={20} />
                                                        <span className="text-sm font-bold text-brand-700 truncate max-w-[200px]">{file.name}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="text-slate-400 group-hover:text-brand-500 transition-colors" size={20} />
                                                        <span className="text-sm font-medium text-slate-500 group-hover:text-brand-600">Glisser ou cliquer pour ajouter le CV</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-bold text-slate-700">Message (Optionnel)</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm font-medium placeholder:text-slate-400 resize-none"
                                            placeholder="Pourquoi ce poste ?"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!formData.name || !formData.email || !file}
                                        className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-bold text-sm tracking-wide hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span>Envoyer ma candidature</span>
                                        <Send size={16} />
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin mb-4" />
                                    <p className="text-slate-600 font-medium">Envoi en cours...</p>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 mb-2 font-heading">Candidature Envoyée !</h4>
                                    <p className="text-slate-600 max-w-xs mx-auto mb-8">
                                        Merci pour votre intérêt. Notre équipe RH étudiera votre profil et reviendra vers vous sous 48h.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
