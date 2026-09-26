import type { Metadata } from 'next';
import AffiliateProgramPage from '@/components/affiliate/AffiliateProgramPage';

export const metadata: Metadata = {
  title: 'Talentiques Affiliate Program | Earn 50% Per Sale',
  description: 'Join the Talentiques Affiliate Program, recommend career tools and earn 50% commission on eligible sales generated through your referral link.',
  alternates: { canonical: '/en/affiliate', languages: { fr: '/affiliation', en: '/en/affiliate' } },
};

export default function AffiliatePage() { return <AffiliateProgramPage locale="en" />; }

