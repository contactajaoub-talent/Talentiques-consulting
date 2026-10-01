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
  const reasons: Record<string, string> = {
    'Je candidate sans obtenir de réponses':
      'Structurez votre recherche, renforcez vos candidatures et suivez chaque opportunité avec un système complet et réutilisable.',
    'Mon CV / LinkedIn ne me valorise pas':
      'Renforcez votre CV, votre profil LinkedIn et la cohérence de votre candidature tout en structurant votre recherche d’opportunités.',
    'Je ne sais pas quelles opportunités cibler':
      'Identifiez, priorisez et suivez les opportunités les plus pertinentes grâce à un système structuré de recherche et de pilotage.',
    'Je manque d’organisation dans ma recherche':
      'Centralisez vos candidatures, relances, entretiens et prochaines actions dans un seul système de recherche structuré.',
    'Je bloque aux entretiens':
      'Structurez votre recherche jusqu’au suivi des entretiens avec des outils et guides conçus pour mieux préparer chaque étape.',
  };
  const genericReason =
    'Un système complet pour structurer votre recherche, renforcer votre profil et garder chaque opportunité sous contrôle.';
  const offer = getStoreProduct('bundle', 'fr');

  return result(
    offer.id,
    offer.name,
    '/outils',
    reasons[difficulty] || genericReason,
    'Découvrir Career Search 360',
  );
}

function result(offerId: string, offerName: string, href: string, reason: string, cta: string) {
  return { offerId, offerName, href, reason, cta };
}
