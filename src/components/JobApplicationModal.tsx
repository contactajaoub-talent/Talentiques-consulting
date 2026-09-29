'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  CheckCircle,
  Send,
  FileText,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
}

export const JobApplicationModal = ({
  isOpen,
  onClose,
  jobTitle,
}: JobApplicationModalProps) => {
  const [formStep, setFormStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    linkedin: '',
    frenchLevel: '',
    experience: '',
    availability: '',
    equipment: '',
    salesAnswer: '',
    privacy: false,
  });

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];

      if (selectedFile.size > 4 * 1024 * 1024) {
        setErrorMessage('Le CV doit faire moins de 4 Mo.');
        return;
      }

      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const canContinue =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.phone &&
    formData.country &&
    file;

  const canSubmit =
    formData.frenchLevel &&
    formData.experience &&
    formData.availability &&
    formData.equipment &&
    formData.salesAnswer.trim().length >= 20 &&
    formData.privacy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const data = new FormData();

      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('country', formData.country);

      data.append('profilLinkedIn', formData.linkedin);

      data.append('typeDemande', 'Recrutement');
      data.append('offreRessource', 'Candidature carrière');
      data.append('nomRessource', jobTitle);

      data.append('statutActuel', formData.availability);
      data.append('objectifProfessionnel', `Candidature au poste : ${jobTitle}`);

      data.append(
        'difficultePrincipale',
        `Niveau de français : ${formData.frenchLevel}`
      );

      data.append(
        'anneesExperience',
        formData.experience
      );

      data.append(
        'informationsComplementaires',
        [
          `Équipement : ${formData.equipment}`,
          `Réponse commerciale : ${formData.salesAnswer}`,
        ].join('\n\n')
      );

      data.append('posteVise', jobTitle);
      data.append('canalContact', 'WhatsApp / Téléphone');

      data.append('pageOrigine', window.location.href);

      const params = new URLSearchParams(window.location.search);

      data.append('utmSource', params.get('utm_source') || '');
      data.append('utmMedium', params.get('utm_medium') || '');
      data.append('utmCampaign', params.get('utm_campaign') || '');

      data.append('privacy', '1');

      if (file) {
        data.append('cv', file);
      }

      // Honeypot anti-spam
      data.append('website', '');

      const response = await fetch('/api/salesforce-lead', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Une erreur est survenue.');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer la candidature."
      );
    }
  };

  const resetAndClose = () => {
    setFormStep(1);
    setStatus('idle');
    setErrorMessage('');
    setFile(null);

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
      linkedin: '',
      frenchLevel: '',
      experience: '',
      availability: '',
      equipment: '',
      salesAnswer: '',
      privacy: false,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            className="relative z-[70] bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh] overflow-y-auto"
          >

            <div className="bg-slate-50 px-6 md:px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-brand-600">
                  Candidature TalentiQues
                </span>

                <h3 className="text-xl font-bold text-slate-900 font-heading mt-1">
                  Postuler
                </h3>

                <p className="text-sm text-slate-500 font-medium mt-1">
                  {jobTitle}
                </p>
              </div>

              <button
                onClick={resetAndClose}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {status === 'success' ? (
              <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center">

                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-6">
                  <CheckCircle size={40} />
                </div>

                <h4 className="text-2xl font-bold text-slate-900 mb-3 font-heading">
                  Candidature envoyée
                </h4>

                <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
                  Merci pour votre candidature. Notre équipe examinera votre profil.
                  Si votre candidature correspond à nos critères, nous vous contacterons
                  pour la prochaine étape du processus.
                </p>

                <button
                  onClick={resetAndClose}
                  className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                  Fermer
                </button>

              </div>
            ) : (
              <form onSubmit={handleSubmit}>

                <div className="px-6 md:px-8 pt-6">
                  <div className="flex items-center gap-3">

                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className={formStep >= 1 ? 'text-brand-600' : 'text-slate-400'}>
                          1. Votre profil
                        </span>

                        <span className={formStep >= 2 ? 'text-brand-600' : 'text-slate-400'}>
                          2. Qualification
                        </span>
                      </div>

                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 transition-all duration-300"
                          style={{ width: formStep === 1 ? '50%' : '100%' }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="p-6 md:p-8">

                  {errorMessage && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
                      <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {formStep === 1 && (
                    <div className="space-y-5">

                      <div className="grid md:grid-cols-2 gap-4">

                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700">
                            Prénom *
                          </label>

                          <input
                            required
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                            placeholder="Votre prénom"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700">
                            Nom *
                          </label>

                          <input
                            required
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({ ...formData, lastName: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                            placeholder="Votre nom"
                          />
                        </div>

                      </div>

                      <div className="grid md:grid-cols-2 gap-4">

                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700">
                            E-mail *
                          </label>

                          <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                            placeholder="vous@email.com"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-bold text-slate-700">
                            WhatsApp / Téléphone *
                          </label>

                          <input
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                            placeholder="+212..."
                          />
                        </div>

                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">
                          Pays de résidence *
                        </label>

                        <input
                          required
                          type="text"
                          value={formData.country}
                          onChange={(e) =>
                            setFormData({ ...formData, country: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                          placeholder="Ex. Maroc"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">
                          Profil LinkedIn
                        </label>

                        <input
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) =>
                            setFormData({ ...formData, linkedin: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">
                          CV *
                        </label>

                        <div className="relative group">

                          <input
                            required={!file}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />

                          <div
                            className={cn(
                              'w-full px-4 py-5 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-brand-400 group-hover:bg-brand-50/50 transition-all flex items-center justify-center gap-3',
                              file && 'border-brand-500 bg-brand-50'
                            )}
                          >
                            {file ? (
                              <>
                                <FileText className="text-brand-600" size={20} />

                                <span className="text-sm font-bold text-brand-700 truncate max-w-[300px]">
                                  {file.name}
                                </span>
                              </>
                            ) : (
                              <>
                                <Upload
                                  className="text-slate-400 group-hover:text-brand-500"
                                  size={20}
                                />

                                <span className="text-sm font-medium text-slate-500">
                                  Ajouter votre CV — PDF, DOC ou DOCX
                                </span>
                              </>
                            )}
                          </div>

                        </div>

                        <p className="text-xs text-slate-400">
                          Taille maximale : 4 Mo
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!canContinue}
                        onClick={() => setFormStep(2)}
                        className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Continuer
                        <ArrowRight size={17} />
                      </button>

                    </div>
                  )}

                  {formStep === 2 && (
                    <div className="space-y-5">

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">
                          Votre niveau de français à l'oral *
                        </label>

                        <select
                          required
                          value={formData.frenchLevel}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              frenchLevel: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Courant / très avancé">
                            Courant / très avancé
                          </option>
                          <option value="Avancé">
                            Avancé
                          </option>
                          <option value="Intermédiaire">
                            Intermédiaire
                          </option>
                          <option value="Débutant">
                            Débutant
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">
                          Expérience en prospection, vente ou closing *
                        </label>

                        <select
                          required
                          value={formData.experience}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              experience: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Aucune expérience">
                            Aucune expérience
                          </option>
                          <option value="Moins de 6 mois">
                            Moins de 6 mois
                          </option>
                          <option value="6 à 12 mois">
                            6 à 12 mois
                          </option>
                          <option value="1 à 2 ans">
                            1 à 2 ans
                          </option>
                          <option value="Plus de 2 ans">
                            Plus de 2 ans
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">
                          Disponibilité *
                        </label>

                        <select
                          required
                          value={formData.availability}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              availability: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Disponible immédiatement">
                            Disponible immédiatement
                          </option>
                          <option value="Disponible sous 1 semaine">
                            Disponible sous 1 semaine
                          </option>
                          <option value="Disponible sous 2 semaines">
                            Disponible sous 2 semaines
                          </option>
                          <option value="Disponible sous 1 mois">
                            Disponible sous 1 mois
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">
                          Disposez-vous d'un PC personnel et d'une connexion Internet stable ? *
                        </label>

                        <select
                          required
                          value={formData.equipment}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              equipment: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm"
                        >
                          <option value="">Sélectionner</option>
                          <option value="Oui, PC personnel + connexion stable">
                            Oui, PC personnel + connexion stable
                          </option>
                          <option value="Non">
                            Non
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">
                          Mise en situation commerciale *
                        </label>

                        <p className="text-xs text-slate-500 leading-relaxed mb-2">
                          Un prospect est intéressé par notre solution mais vous dit :
                          « Je préfère réfléchir avant de prendre une décision. »
                          Comment poursuivez-vous l'échange ?
                        </p>

                        <textarea
                          required
                          rows={5}
                          value={formData.salesAnswer}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              salesAnswer: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none text-sm resize-none"
                          placeholder="Expliquez votre approche en quelques lignes..."
                        />

                        <p className="text-xs text-slate-400">
                          Minimum recommandé : quelques phrases.
                        </p>
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.privacy}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              privacy: e.target.checked,
                            })
                          }
                          className="mt-1"
                        />

                        <span className="text-xs text-slate-500 leading-relaxed">
                          J'accepte que TalentiQues utilise les informations transmises
                          dans le cadre du traitement de ma candidature. *
                        </span>
                      </label>

                      <div className="grid grid-cols-2 gap-3">

                        <button
                          type="button"
                          onClick={() => setFormStep(1)}
                          className="py-3.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                          <ArrowLeft size={17} />
                          Retour
                        </button>

                        <button
                          type="submit"
                          disabled={!canSubmit || status === 'loading'}
                          className="py-3.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {status === 'loading' ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Envoi...
                            </>
                          ) : (
                            <>
                              Envoyer
                              <Send size={16} />
                            </>
                          )}
                        </button>

                      </div>

                    </div>
                  )}

                </div>

              </form>
            )}

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};
