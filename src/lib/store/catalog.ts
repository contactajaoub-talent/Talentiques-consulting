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
    name: 'Opportunity Tracker Pro',
    description:
      'Le système de pilotage pour centraliser vos opportunités, relances, entretiens et prochaines actions.',
    amount: '7.90',
    currency: 'EUR',
    displayPrice: '7,90 €',
    paypalDescription: 'Opportunity Tracker Pro - TalentiQues',
  },
  ats: {
    id: 'ats',
    market: 'fr',
    name: 'CV ATS System',
    description:
      '7 modèles CV ATS, guide CV complet et guide LinkedIn offert.',
    amount: '9.90',
    currency: 'EUR',
    displayPrice: '9,90 €',
    paypalDescription: 'CV ATS System - TalentiQues',
  },
  bundle: {
    id: 'bundle',
    market: 'fr',
    name: 'Career Search Bundle',
    description:
      'Le système complet : Opportunity Tracker Pro + CV ATS System + tous les guides.',
    amount: '14.90',
    currency: 'EUR',
    displayPrice: '14,90 €',
    compareAt: '17,80 € séparément',
    savings: 'Économisez 2,90 €',
    paypalDescription: 'Career Search Bundle - TalentiQues',
  },
};

const EN_PRODUCTS: Record<StoreProductId, StoreProduct> = {
  tracker: {
    id: 'tracker',
    market: 'en',
    name: 'Application Tracker Pro',
    description:
      'Keep every application, follow-up, interview and priority under control from one dashboard.',
    amount: '7.90',
    currency: 'USD',
    displayPrice: '$7.90',
    paypalDescription: 'Application Tracker Pro - TalentiQues',
  },
  ats: {
    id: 'ats',
    market: 'en',
    name: 'ATS Resume & LinkedIn Pro',
    description:
      '7 ATS-friendly resume templates, complete resume guide and LinkedIn guide.',
    amount: '9.90',
    currency: 'USD',
    displayPrice: '$9.90',
    paypalDescription: 'ATS Resume & LinkedIn Pro - TalentiQues',
  },
  bundle: {
    id: 'bundle',
    market: 'en',
    name: 'Career Search Bundle',
    description:
      'Application Tracker Pro, ATS Resume & LinkedIn Pro and all practical guides in one complete system.',
    amount: '14.90',
    currency: 'USD',
    displayPrice: '$14.90',
    compareAt: '$17.80 separately',
    savings: 'Save $2.90',
    paypalDescription: 'Career Search Bundle - TalentiQues',
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
