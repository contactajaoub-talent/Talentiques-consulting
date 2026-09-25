import type { StoreProductDetailFR } from '@/lib/store/product-details-fr';
import type { StoreProductId } from '@/lib/store/catalog';

export const STORE_PRODUCT_DETAILS_EN: Record<StoreProductId, StoreProductDetailFR> = {
  tracker: {
    id: 'tracker',
    slug: 'opportunity-tracker',
    eyebrow: 'Run your search instead of reacting to it',
    headline: 'Application Tracker Pro',
    subheadline: 'A reusable system to centralize your opportunities, applications, follow-ups, interviews and next actions.',
    outcome: 'Know what to do next, when to follow up and which opportunities deserve your attention — without rebuilding your organization every time you start a new search.',
    includes: ['Application Tracker Pro', 'Tracking dashboard and performance indicators', 'Application, follow-up and interview tracking', 'Recruiter and contact mini CRM', 'Opportunity scoring and prioritization', 'Google Sheets and Google Calendar automations', 'Premium guide: find and qualify opportunities', 'Premium guide: follow-ups and interviews'],
    benefits: ['Never lose track of an application or important follow-up', 'Prioritize the strongest opportunities instead of applying at random', 'See your progress and next actions at a glance', 'Reuse the same system for every future search'],
    idealFor: ['Career opportunities', 'Internships', 'Apprenticeships', 'Graduate programs', 'Career transitions'],
    delivery: ['Complete your secure PayPal payment.', 'Payment confirmation immediately unlocks your access page.', 'Your access links are also sent by email.', 'Import the Tracker into Google Sheets and follow the included setup guide.'],
    note: 'One-time payment. No subscription. Keep the files and reuse them for every future search.',
  },
  ats: {
    id: 'ats',
    slug: 'ats-resume',
    eyebrow: 'Present a clearer, stronger application',
    headline: 'ATS Resume & LinkedIn Pro',
    subheadline: '7 editable ATS-friendly resume templates plus a complete method to build, tailor and strengthen your applications.',
    outcome: 'Start with a professional structure and a reusable process for adapting your resume to each opportunity instead of starting from scratch.',
    includes: ['7 professional, editable ATS resume templates', 'English resume template library', 'Complete ATS resume guide', 'Job-specific tailoring method', 'Keyword, experience, skills and results method', 'LinkedIn Profile Optimization Guide included'],
    benefits: ['Save time on every new application', 'Use a clear structure designed for ATS readability', 'Tailor your resume to each role instead of sending the same version everywhere', 'Strengthen consistency between your resume and LinkedIn profile'],
    idealFor: ['Students', 'Recent graduates', 'Experienced professionals', 'Career changers', 'International applicants'],
    delivery: ['Complete your secure PayPal payment.', 'Your access page opens immediately after confirmation.', 'Your links and files are also sent by email.', 'Choose a template, edit it in Canva and use the guide to tailor it to each opportunity.'],
    note: 'One-time payment. No subscription. Keep the templates and guides for future applications.',
  },
  bundle: {
    id: 'bundle',
    slug: 'bundle',
    eyebrow: 'Recommended offer',
    headline: 'Career Search Bundle',
    subheadline: 'The complete system to organize your opportunity search, strengthen your applications and keep every next action under control.',
    outcome: 'Instead of relying on disconnected resources, bring application tracking, ATS resumes, LinkedIn and practical execution guides into one system.',
    includes: ['Application Tracker Pro', 'All Tracker automations', '2 premium opportunity and follow-up guides', '7 professional ATS resume templates', 'Complete ATS resume guide', 'LinkedIn optimization guide', 'Immediate access after payment', 'Reusable for future searches'],
    benefits: ['One system from opportunity targeting through interview follow-up', 'Less time lost between disconnected files and methods', 'A more consistent resume, LinkedIn profile and follow-up process', 'The Store’s strongest overall value'],
    idealFor: ['Anyone actively exploring opportunities', 'Students and interns', 'Recent graduates', 'Professionals in transition', 'International applicants'],
    delivery: ['Complete one secure PayPal payment.', 'Your Bundle access is unlocked immediately after confirmation.', 'Both packs are also sent to you by email.', 'Keep the files and reuse them for future career opportunities.'],
    note: '$14.90 instead of $17.80 when purchased separately. One-time payment, no subscription.',
  },
};

export function getStoreDetailHrefEN(id: StoreProductId) {
  return `/en/tools/${STORE_PRODUCT_DETAILS_EN[id].slug}`;
}
