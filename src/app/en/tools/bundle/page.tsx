import EnglishStore from '@/components/store/EnglishStore';
import { localizedMetadata } from '@/lib/i18n';
export const metadata = localizedMetadata('/en/tools/bundle', "Career Search Bundle", "Opportunity Tracker Pro and ATS Resume System in one complete career toolkit. English resources, one-time payment and instant access after confirmation.");
export default function Page() { return <EnglishStore productId="bundle"/>; }
