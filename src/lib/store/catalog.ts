export type StoreMarket = 'fr' | 'en';
export type StoreProductId = 'tracker' | 'ats' | 'bundle';

export type StoreProduct = {
  id: StoreProductId;
  market: StoreMarket;
  name: string;
  description: string;
  amount: string;
  currency: 'EUR' | 'USD';
  displayPrice: string;
  compareAt?: string;
  savings?: string;
  paypalDescription: string;
};

const FR_PRODUCTS: Record<StoreProductId, StoreProduct> = {
  tracker: {
    id: 'tracker',
    market: 'fr',
    name: 'Opportunity Management System',
    description:
      'Centralisez vos candidatures, relances, entretiens et prochaines actions dans un seul système de suivi.',
    amount: '9.60',
    currency: 'EUR',
    displayPrice: '9,60 €',
    paypalDescription: 'Opportunity Management System - TalentiQues',
  },
  ats: {
    id: 'ats',
    market: 'fr',
    name: 'Career Branding Toolkit',
    description:
      'Renforcez votre profil avec des modèles CV ATS, une méthode de personnalisation et un guide LinkedIn.',
    amount: '7.60',
    currency: 'EUR',
    displayPrice: '7,60 €',
    paypalDescription: 'Career Branding Toolkit - TalentiQues',
  },
  bundle: {
    id: 'bundle',
    market: 'fr',
    name: 'Career Search 360',
    description:
      'Tout ce qu’il vous faut pour renforcer votre profil, gérer vos opportunités et garder le contrôle de votre recherche.',
    amount: '14.50',
    currency: 'EUR',
    displayPrice: '14,50 €',
    compareAt: '17,20 € séparément',
    savings: 'Économisez 2,70 €',
    paypalDescription: 'Career Search 360 - TalentiQues',
  },
};

const EN_PRODUCTS: Record<StoreProductId, StoreProduct> = {
  tracker: {
    id: 'tracker',
    market: 'en',
    name: 'Opportunity Management System',
    description:
      'Centralize your applications, follow-ups, interviews and next actions in one structured management system.',
    amount: '9.60',
    currency: 'USD',
    displayPrice: '$9.60',
    paypalDescription: 'Opportunity Management System - TalentiQues',
  },
  ats: {
    id: 'ats',
    market: 'en',
    name: 'Career Branding Toolkit',
    description:
      'Build a stronger professional profile with ATS resume templates, a tailoring method and a practical LinkedIn guide.',
    amount: '7.60',
    currency: 'USD',
    displayPrice: '$7.60',
    paypalDescription: 'Career Branding Toolkit - TalentiQues',
  },
  bundle: {
    id: 'bundle',
    market: 'en',
    name: 'Career Search 360',
    description:
      'Everything you need to build a stronger profile, manage opportunities and stay in control of your job search.',
    amount: '14.50',
    currency: 'USD',
    displayPrice: '$14.50',
    compareAt: '$17.20 separately',
    savings: 'Save $2.70',
    paypalDescription: 'Career Search 360 - TalentiQues',
  },
};

export function isStoreProductId(value: unknown): value is StoreProductId {
  return value === 'tracker' || value === 'ats' || value === 'bundle';
}

export function isStoreMarket(value: unknown): value is StoreMarket {
  return value === 'fr' || value === 'en';
}

export function getStoreProduct(
  productId: StoreProductId,
  market: StoreMarket = 'fr'
): StoreProduct {
  return market === 'fr' ? FR_PRODUCTS[productId] : EN_PRODUCTS[productId];
}

export const STORE_FR_PRODUCTS = FR_PRODUCTS;
export const STORE_EN_PRODUCTS = EN_PRODUCTS;

export const STORE_TRACKING_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const;

export type StoreTracking = Partial<
  Record<(typeof STORE_TRACKING_KEYS)[number], string>
>;
