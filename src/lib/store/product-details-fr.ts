import type { StoreProductId } from '@/lib/store/catalog';

export type StoreProductDetailFR = {
  id: StoreProductId;
  slug: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  outcome: string;
  includes: string[];
  benefits: string[];
  idealFor: string[];
  delivery: string[];
  note: string;
};

export const STORE_PRODUCT_DETAILS_FR: Record<StoreProductId, StoreProductDetailFR> = {
  tracker: {
    id: 'tracker',
    slug: 'opportunity-tracker',
    eyebrow: 'Pilotez votre recherche au lieu de la subir',
    headline: 'Opportunity Management System',
    subheadline:
      'Centralisez vos candidatures, relances, entretiens et prochaines actions dans un seul système de suivi.',
    outcome:
      'Vous savez quoi faire, quand le faire et quelles opportunités méritent votre temps — sans reconstruire votre organisation à chaque recherche.',
    includes: [
      'Opportunity Management System FR + EN',
      'Dashboard de pilotage et indicateurs',
      'Suivi des candidatures, relances et entretiens',
      'Mini CRM recruteurs / contacts',
      'Scoring et priorisation des opportunités',
      'Automatisations Google Sheets + Google Calendar',
      'Guide premium : identifier & qualifier les opportunités',
      'Guide premium : suivi, relances & entretiens',
    ],
    benefits: [
      'Ne plus perdre une candidature ou une relance importante',
      'Prioriser les opportunités au lieu de candidater au hasard',
      'Voir votre progression et vos actions prioritaires en un coup d’œil',
      'Réutiliser le même système à chaque nouvelle recherche',
    ],
    idealFor: [
      'Recherche d’emploi',
      'Stage',
      'Alternance',
      'Graduate program',
      'Mobilité professionnelle',
    ],
    delivery: [
      'Vous finalisez le paiement sécurisé PayPal.',
      'La confirmation du paiement débloque immédiatement votre page d’accès.',
      'Vous recevez également vos accès par e-mail.',
      'Vous importez le Tracker dans Google Sheets et suivez le guide d’installation fourni.',
    ],
    note: 'Paiement unique. Aucun abonnement. Les fichiers restent à votre disposition pour vos futures recherches.',
  },
  ats: {
    id: 'ats',
    slug: 'cv-ats',
    eyebrow: 'Présentez une candidature plus claire et plus solide',
    headline: 'Career Branding Toolkit',
    subheadline:
      'Renforcez votre profil avec des modèles CV ATS, une méthode de personnalisation et un guide LinkedIn.',
    outcome:
      'Vous ne repartez plus d’une page blanche : vous disposez d’une structure professionnelle et d’une méthode réutilisable pour adapter votre CV à chaque offre.',
    includes: [
      '7 modèles CV ATS professionnels et modifiables',
      'Bibliothèque de modèles FR + EN',
      'Guide complet CV ATS FR',
      'ATS Resume Guide EN',
      'Méthode de personnalisation selon l’offre',
      'Méthode mots-clés, expériences, compétences et résultats',
      'Guide LinkedIn FR offert',
      'LinkedIn Profile Optimization Guide EN offert',
    ],
    benefits: [
      'Gagner du temps à chaque nouvelle candidature',
      'Utiliser une structure lisible et adaptée aux pratiques ATS',
      'Adapter le contenu au poste au lieu d’envoyer le même CV partout',
      'Renforcer la cohérence entre votre CV et votre profil LinkedIn',
    ],
    idealFor: [
      'Étudiants',
      'Jeunes diplômés',
      'Profils expérimentés',
      'Reconversion',
      'Candidatures internationales',
    ],
    delivery: [
      'Vous finalisez le paiement sécurisé PayPal.',
      'Votre page d’accès s’ouvre immédiatement après confirmation.',
      'Vous recevez aussi les liens et fichiers par e-mail.',
      'Vous choisissez votre modèle, le personnalisez dans Canva et utilisez le guide pour l’adapter à vos offres.',
    ],
    note: 'Paiement unique. Aucun abonnement. Les modèles et guides sont réutilisables pour vos futures candidatures.',
  },
  bundle: {
    id: 'bundle',
    slug: 'bundle',
    eyebrow: 'L’offre recommandée',
    headline: 'Career Search 360',
    subheadline:
      'Tout ce qu’il vous faut pour renforcer votre profil, gérer vos opportunités et garder le contrôle de votre recherche.',
    outcome:
      'Au lieu d’acheter des ressources isolées, vous réunissez le pilotage de votre recherche, le CV ATS, LinkedIn et les guides d’exécution dans un seul système.',
    includes: [
      'Opportunity Management System FR + EN',
      'Toutes les automatisations du Tracker',
      '2 guides premium Opportunités / Relances / Entretiens',
      '7 modèles CV ATS professionnels',
      'Guide complet CV ATS FR + EN',
      'Guide LinkedIn FR + EN',
      'Accès immédiat après paiement',
      'Réutilisable pour vos prochaines recherches',
    ],
    benefits: [
      'Un seul système du ciblage jusqu’au suivi des entretiens',
      'Moins de temps perdu entre plusieurs fichiers et méthodes',
      'Une candidature plus cohérente entre CV, LinkedIn et suivi',
      'Le meilleur rapport valeur/prix de la Store',
    ],
    idealFor: [
      'Toute personne en recherche active',
      'Étudiants et alternants',
      'Jeunes diplômés',
      'Professionnels en mobilité',
      'Candidatures FR et internationales',
    ],
    delivery: [
      'Vous finalisez un seul paiement sécurisé PayPal.',
      'Votre accès au Bundle est débloqué immédiatement après confirmation.',
      'Vous recevez par e-mail les deux packs : Opportunity Management System + Career Branding Toolkit.',
      'Vous pouvez conserver les fichiers et les réutiliser pour vos prochaines opportunités.',
    ],
    note: '14,50 € au lieu de 17,20 € si les deux systèmes sont achetés séparément. Paiement unique, aucun abonnement.',
  },
};

export function getStoreDetailHrefFR(id: StoreProductId) {
  return `/outils/${STORE_PRODUCT_DETAILS_FR[id].slug}`;
}
