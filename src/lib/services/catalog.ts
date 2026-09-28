export type ServiceMarket = 'fr' | 'en';
export type ServiceId = 'professional-profile' | 'student-jobseeker';

export type ServiceOffer = {
  id: ServiceId;
  market: ServiceMarket;
  name: string;
  amount: string;
  currency: 'EUR' | 'USD';
  displayPrice: string;
  paypalDescription: string;
};

const SERVICES: Record<ServiceMarket, Record<ServiceId, ServiceOffer>> = {
  fr: {
    'professional-profile': {
      id: 'professional-profile', market: 'fr',
      name: 'Valorisation professionnelle complète', amount: '45.00',
      currency: 'EUR', displayPrice: '45 €',
      paypalDescription: 'Valorisation professionnelle complète - TalentiQues',
    },
    'student-jobseeker': {
      id: 'student-jobseeker', market: 'fr',
      name: 'Pack Étudiant & Demandeur d’emploi', amount: '30.00',
      currency: 'EUR', displayPrice: '30 €',
      paypalDescription: 'Pack Étudiant et Demandeur d’emploi - TalentiQues',
    },
  },
  en: {
    'professional-profile': {
      id: 'professional-profile', market: 'en',
      name: 'Complete Professional Profile Optimization', amount: '45.00',
      currency: 'USD', displayPrice: '$45',
      paypalDescription: 'Complete Professional Profile Optimization - TalentiQues',
    },
    'student-jobseeker': {
      id: 'student-jobseeker', market: 'en',
      name: 'Student & Job Seeker Pack', amount: '30.00',
      currency: 'USD', displayPrice: '$30',
      paypalDescription: 'Student and Job Seeker Pack - TalentiQues',
    },
  },
};

export function isServiceId(value: unknown): value is ServiceId {
  return value === 'professional-profile' || value === 'student-jobseeker';
}

export function isServiceMarket(value: unknown): value is ServiceMarket {
  return value === 'fr' || value === 'en';
}

export function getServiceOffer(id: ServiceId, market: ServiceMarket) {
  return SERVICES[market][id];
}

export function serviceMoneyMatches(expected: string, actual?: string) {
  const a = Number(expected); const b = Number(actual);
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 0.001;
}
