import EnglishStore from '@/components/store/EnglishStore';
import { localizedMetadata } from '@/lib/i18n';
export const metadata = localizedMetadata('/en/tools', "Career tools for a focused job search", "Organise applications, create a clearer resume and build a repeatable job-search routine. One-time purchases, English resources and secure access.");
export default function Page() { return <EnglishStore />; }
