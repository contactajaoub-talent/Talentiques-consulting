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
    headline: 'Opportunity Tracker Pro',
    subheadline:
      'Un système de pilotage réutilisable pour centraliser vos opportunités, vos relances, vos entretiens et vos prochaines actions.',
    outcome:
      'Vous savez quoi faire, quand le faire et quelles opportunités méritent votre temps — sans reconstruire votre organisation à chaque recherche.',
    includes: [
      'Opportunity Tracker Pro FR + EN',
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
    headline: 'CV ATS System',
    subheadline:
      '7 modèles CV ATS modifiables + une méthode complète pour construire, adapter et renforcer votre candidature.',
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
    headline: 'Career Search Bundle',
    subheadline:
      'Le système complet pour structurer votre recherche, renforcer vos candidatures et garder chaque opportunité sous contrôle.',
    outcome:
      'Au lieu d’acheter des ressources isolées, vous réunissez le pilotage de votre recherche, le CV ATS, LinkedIn et les guides d’exécution dans un seul système.',
    includes: [
      'Opportunity Tracker Pro FR + EN',
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
      'Vous recevez par e-mail les deux packs : Tracker + CV ATS System.',
      'Vous pouvez conserver les fichiers et les réutiliser pour vos prochaines opportunités.',
    ],
    note: '14,90 € au lieu de 17,80 € si les deux systèmes sont achetés séparément. Paiement unique, aucun abonnement.',
  },
};

export function getStoreDetailHrefFR(id: StoreProductId) {
  return `/outils/${STORE_PRODUCT_DETAILS_FR[id].slug}`;
}
