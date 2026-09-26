import { normalizeEmail } from './core.ts';

export const AFFILIATE_TERMS_VERSION = 'affiliate-v1-2026-09';
export const AFFILIATE_CHANNELS = [
  'instagram', 'tiktok', 'youtube', 'linkedin', 'website', 'newsletter',
  'student_community', 'other',
] as const;
export const AFFILIATE_AUDIENCE_SIZES = [
  'under_1k', '1k_5k', '5k_10k', '10k_50k', '50k_100k', '100k_plus',
] as const;
export const AFFILIATE_CONTENT_FOCUS = [
  'jobs', 'internships', 'apprenticeships', 'career', 'resumes', 'linkedin',
  'students', 'international_mobility', 'education', 'professional_development', 'other',
] as const;

export type ApplicationLanguage = 'fr' | 'en';
export type AffiliateApplication = {
  full_name: string;
  email: string;
  country: string;
  primary_channel: (typeof AFFILIATE_CHANNELS)[number];
  profile_url: string;
  audience_size: (typeof AFFILIATE_AUDIENCE_SIZES)[number];
  content_focus: Array<(typeof AFFILIATE_CONTENT_FOCUS)[number]>;
  motivation: string;
  payout_preference: 'paypal' | 'bank_transfer' | 'other';
  application_language: ApplicationLanguage;
  terms_accepted_at: string;
  terms_version: string;
};

function cleanText(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function cleanUrl(value: unknown) {
  const text = cleanText(value, 500);
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    url.username = '';
    url.password = '';
    return url.toString();
  } catch {
    return '';
  }
}

export function validateAffiliateApplication(value: unknown, now = new Date()) {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const fullName = cleanText(source.full_name, 150);
  const email = normalizeEmail(source.email);
  const country = cleanText(source.country, 100);
  const primaryChannel = cleanText(source.primary_channel, 50);
  const audienceSize = cleanText(source.audience_size, 50);
  const motivation = cleanText(source.motivation, 1000);
  const payoutPreference = cleanText(source.payout_preference, 50);
  const language = source.application_language === 'en' ? 'en' : 'fr';
  const profileUrl = cleanUrl(source.profile_url);
  const focus = Array.isArray(source.content_focus)
    ? [...new Set(source.content_focus.filter((item): item is string => typeof item === 'string'))]
        .filter((item) => AFFILIATE_CONTENT_FOCUS.includes(item as never)).slice(0, 11)
    : [];
  const errors: Record<string, string> = {};

  if (fullName.length < 2) errors.full_name = 'invalid';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'invalid';
  if (country.length < 2) errors.country = 'invalid';
  if (!AFFILIATE_CHANNELS.includes(primaryChannel as never)) errors.primary_channel = 'invalid';
  if (!profileUrl) errors.profile_url = 'invalid';
  if (!AFFILIATE_AUDIENCE_SIZES.includes(audienceSize as never)) errors.audience_size = 'invalid';
  if (focus.length === 0) errors.content_focus = 'invalid';
  if (motivation.length < 10) errors.motivation = 'invalid';
  if (!['paypal', 'bank_transfer', 'other'].includes(payoutPreference)) errors.payout_preference = 'invalid';
  if (source.terms_accepted !== true) errors.terms_accepted = 'required';

  if (Object.keys(errors).length) return { success: false as const, errors };
  return {
    success: true as const,
    data: {
      full_name: fullName,
      email,
      country,
      primary_channel: primaryChannel,
      profile_url: profileUrl,
      audience_size: audienceSize,
      content_focus: focus,
      motivation,
      payout_preference: payoutPreference,
      application_language: language,
      terms_accepted_at: now.toISOString(),
      terms_version: AFFILIATE_TERMS_VERSION,
    } as AffiliateApplication,
  };
}

const RESERVED_CODES = new Set([
  'admin', 'talentiques', 'support', 'api', 'paypal', 'store', 'affiliate',
  'affiliation', 'login',
]);

export function affiliateCodeBase(fullName: string) {
  const base = fullName.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 32);
  return base && !RESERVED_CODES.has(base) ? base : `partner${base}`.slice(0, 32);
}

export function affiliateCodeCandidate(fullName: string, suffix = '') {
  const base = affiliateCodeBase(fullName);
  return `${base}${suffix.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}`.slice(0, 40);
}

export function duplicateApplicationMessage(status: unknown, language: ApplicationLanguage) {
  if (status === 'pending') return language === 'fr' ? 'Candidature déjà en cours d’examen.' : 'Application already under review.';
  if (status === 'active') return language === 'fr' ? 'Vous avez déjà un compte affilié actif.' : 'You already have an active affiliate account.';
  if (status === 'suspended') return language === 'fr' ? 'Ce compte ne peut pas présenter une nouvelle candidature.' : 'This account cannot submit a new application.';
  return null;
}

