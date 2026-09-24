import EnglishStore from '@/components/store/EnglishStore';
import { localizedMetadata } from '@/lib/i18n';
export const metadata = localizedMetadata('/en/tools/opportunity-tracker', "Opportunity Tracker Pro", "Track applications, interviews, follow-ups and recruiter contacts in a reusable job-search system. English edition with practical guides.");
export default function Page() { return <EnglishStore productId="tracker"/>; }
