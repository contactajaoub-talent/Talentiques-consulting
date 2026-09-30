import { getServiceOffer } from '../services/catalog.ts';
import { getStoreProduct } from '../store/catalog.ts';
import type { ExperienceLevel, Recommendation } from './types.ts';

export const DIFFICULTY_OPTIONS = [
  'Je candidate sans obtenir de réponses',
  'Mon CV / LinkedIn ne me valorise pas',
  'Je ne sais pas quelles opportunités cibler',
  'Je manque d’organisation dans ma recherche',
  'Je bloque aux entretiens',
  'Autre',
] as const;

type RecommendationInput = {
  atsScore: number;
  experienceLevel: ExperienceLevel;
  currentStatus?: string;
  difficulty?: string;
};

export function recommendOffer(input: RecommendationInput): Recommendation {
  const difficulty = input.difficulty || '';
  const status = (input.currentStatus || '').toLocaleLowerCase('fr');
  const earlyCareer = input.experienceLevel === 'student' || input.experienceLevel === 'junior' ||
    status.includes('étudiant') || status.includes('stage') || status.includes('alternance') ||
    status.includes('recherche d’emploi') || status.includes("recherche d'emploi");

  if (difficulty === 'Je manque d’organisation dans ma recherche') {
    const offer = getStoreProduct('tracker', 'fr');
    return result(offer.id, offer.name, '/outils/opportunity-tracker',
      'Cet outil vous aide à centraliser vos candidatures, relances et prochaines actions.',
      'Découvrir l’outil');
  }

  if (difficulty === 'Je ne sais pas quelles opportunités cibler' ||
      (difficulty === 'Je candidate sans obtenir de réponses' && input.atsScore >= 55)) {
    const offer = getStoreProduct('bundle', 'fr');
    return result(offer.id, offer.name, '/outils/bundle',
      'Votre besoin concerne plusieurs étapes de la recherche : ciblage, candidature et suivi.',
      'Découvrir le système');
  }

  if (input.atsScore < 55 && earlyCareer) {
    const offer = getServiceOffer('student-jobseeker', 'fr');
    return result(offer.id, offer.name, '/services',
      'Votre profil gagnerait à être restructuré et mieux valorisé pour vos prochaines candidatures.',
      'Découvrir l’accompagnement');
  }

  if (input.atsScore < 55 && ['intermediate', 'senior', 'executive'].includes(input.experienceLevel)) {
    const offer = getServiceOffer('professional-profile', 'fr');
    return result(offer.id, offer.name, '/services',
      'Votre expérience est présente, mais sa structure et sa valorisation peuvent être renforcées.',
      'Faire optimiser mon profil');
  }

  const offer = getStoreProduct('ats', 'fr');
  return result(offer.id, offer.name, '/outils/cv-ats',
    'Votre CV possède une base exploitable ; des modèles et une méthode de personnalisation peuvent vous aider à l’améliorer en autonomie.',
    'Découvrir l’outil');
}

function result(offerId: string, offerName: string, href: string, reason: string, cta: string) {
  return { offerId, offerName, href, reason, cta };
}
